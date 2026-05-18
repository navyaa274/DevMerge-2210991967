const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../../middleware/auth');
const controller = require('../../controllers/auth/profileController');
const User = require('../../models/auth/User');

// ─────────────────────────────────────────────
// Profile / Settings (authenticated user)
// ─────────────────────────────────────────────
router.get('/users/profile', authenticate, controller.getMe);
router.put('/users/profile', authenticate, controller.updateProfile);
router.put('/users/change-password', authenticate, controller.changePassword);
router.get('/users/settings', authenticate, controller.getSettings);
router.put('/users/settings', authenticate, controller.updateSettings);

// ─────────────────────────────────────────────
// User Management (Admin / Super Admin)
// ─────────────────────────────────────────────

// GET /api/users — list all users with optional filters
router.get('/users', authenticate, authorize(['admin', 'super_admin', 'hod']), async (req, res) => {
  try {
    const { role, department, search, isActive, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role && role !== 'all') filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName email role department isActive isSuspended studentId employeeId createdAt lastActive')
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    // Normalize: attach computed `name` field for frontend compatibility
    const normalized = users.map(u => ({
      ...u,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
    }));

    res.json({ success: true, count: total, data: normalized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/users/:id — get single user
router.get('/users/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens -twoFactorSecret -backupCodes')
      .populate('department', 'name code')
      .lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { ...user, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users — create a new user
router.post('/users', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { name, firstName, lastName, email, role, password, department } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Support both `name` (legacy) and `firstName`/`lastName`
    let fName = firstName;
    let lName = lastName;
    if (!fName && name) {
      const parts = name.trim().split(' ');
      fName = parts[0];
      lName = parts.slice(1).join(' ') || '';
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists' });
    }

    const user = new User({
      firstName: fName,
      lastName: lName,
      email: email.toLowerCase(),
      role: role || 'student',
      password,
      department: department || undefined,
      createdBy: req.user?.id
    });

    await user.save();
    const plain = user.toObject();
    delete plain.password;
    res.status(201).json({ success: true, data: { ...plain, name: `${fName} ${lName}`.trim() } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id — update user (admin)
router.put('/users/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const { name, firstName, lastName, email, role, department, isActive, isSuspended } = req.body;

    const update = { updatedBy: req.user?.id };

    // Support both `name` and split fields
    if (firstName !== undefined) update.firstName = firstName;
    if (lastName !== undefined) update.lastName = lastName;
    if (name && !firstName) {
      const parts = name.trim().split(' ');
      update.firstName = parts[0];
      update.lastName = parts.slice(1).join(' ') || '';
    }
    if (email) update.email = email.toLowerCase();
    if (role) update.role = role;
    if (department) update.department = department;
    if (isActive !== undefined) update.isActive = isActive;
    if (isSuspended !== undefined) update.isSuspended = isSuspended;

    // Hash password if provided
    if (req.body.password) {
      const bcrypt = require('bcryptjs');
      update.password = await bcrypt.hash(req.body.password, 12);
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
      .select('-password -refreshTokens -twoFactorSecret -backupCodes')
      .populate('department', 'name code')
      .lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: { ...user, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id — hard-delete (super admin only)
router.delete('/users/:id', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    // Prevent self-deletion
    if (req.params.id === req.user?.id) {
      return res.status(403).json({ success: false, message: 'You cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: `User "${user.firstName} ${user.lastName}" permanently deleted` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id/status — activate or deactivate user
router.put('/users/:id/status', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const { isActive } = req.body;
    if (isActive === undefined) {
      return res.status(400).json({ success: false, message: '`isActive` field is required' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, updatedBy: req.user?.id },
      { new: true }
    ).select('firstName lastName email role isActive').lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { ...user, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id/role — change user role (super admin)
router.put('/users/:id/role', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'faculty', 'hod', 'admin', 'super_admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: `Role must be one of: ${validRoles.join(', ')}` });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, updatedBy: req.user?.id },
      { new: true }
    ).select('firstName lastName email role isActive').lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { ...user, name: `${user.firstName || ''} ${user.lastName || ''}`.trim() } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
