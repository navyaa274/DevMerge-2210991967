const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const Semester = require('../../models/academic/Semester');

// Create semester
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const semester = new Semester({ name, startDate, endDate });
    await semester.save();
    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all semesters
router.get('/', authenticate, async (req, res) => {
  try {
    const semesters = await Semester.find().sort({ createdAt: -1 });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active semester
router.get('/active', authenticate, async (req, res) => {
  try {
    const semester = await Semester.findOne({ isActive: true });
    res.json(semester);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
