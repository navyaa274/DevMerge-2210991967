const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../../middleware/auth');

const Problem = require('../../../models/assessment/problems/Problem');

// Problems Routes
router.get('/', authenticate, async (req, res) => {
  try {
    const { difficulty, topic } = req.query;
    let query = {
      category: { $ne: 'lab' },
      $or: [{ status: 'Approved' }, { isApproved: true }, { status: 'Published' }]
    };

    if (difficulty && difficulty !== 'All') query.difficulty = difficulty;
    if (topic && topic !== 'All') query.topics = topic;

    const problems = await Problem.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: problems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const problem = new Problem({ ...req.body, createdBy: req.user.id });
    await problem.save();
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    await Problem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/:id/submit', authenticate, authorize(['student']), async (req, res) => {
  // Submit solution to problem
  res.json({ message: 'Submit solution endpoint' });
});

module.exports = router;
