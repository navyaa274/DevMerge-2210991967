const express = require('express');
const User = require('../../models/auth/User');
const { authenticate, authorize } = require('../../middleware/auth');
const { paginate, paginatedResponse } = require('../../middleware/pagination');
const { cache, cacheKeys, invalidateCache } = require('../../utils/cache');

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').lean();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, bio, phone, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, bio, phone, profilePicture, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    invalidateCache.userStats(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only) with pagination
router.get('/', authenticate, authorize(['admin', 'super_admin']), paginate, async (req, res) => {
  try {
    const { role, department, isActive } = req.query;
    const { page, limit, skip } = req.pagination;

    let filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Get total count
    const total = await User.countDocuments(filter);

    // Get paginated results
    const users = await User.find(filter)
      .select('-password')
      .lean()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const response = paginatedResponse(users, total, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create user (admin only)
router.post('/', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || 'student',
      department
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user (admin only)
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, role, department, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department) user.department = department;
    if (password) user.password = password;

    user.updatedAt = new Date();
    await user.save();

    invalidateCache.userStats(req.params.id);

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status (super_admin / admin)
router.put('/:id/status', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    invalidateCache.userStats(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    invalidateCache.userStats(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
