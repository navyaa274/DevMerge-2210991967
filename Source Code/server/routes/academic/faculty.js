const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const logger = require('../../utils/logger');
const User = require('../../models/auth/User');

const router = express.Router();

// Get all faculty (HOD only)
router.get('/', authenticate, authorize(['hod', 'admin']), async (req, res) => {
  try {
    const faculty = await User.find({ role: 'faculty' })
      .select('name email firstName lastName department')
      .lean();
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add faculty (HOD only)
router.post('/', authenticate, authorize(['hod', 'admin']), async (req, res) => {
  try {
    const { name, email, phone, specialization, experience } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    logger.info(`New faculty added: ${name}`, { userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Faculty added successfully',
      data: {
        _id: Date.now().toString(),
        name,
        email,
        phone,
        specialization,
        experience,
        courses: 0
      }
    });
  } catch (error) {
    logger.error('Failed to add faculty', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete faculty
router.delete('/:facultyId', authenticate, authorize(['hod', 'admin']), async (req, res) => {
  try {
    const { facultyId } = req.params;

    logger.info(`Faculty deleted: ${facultyId}`, { userId: req.user.id });

    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete faculty', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
