const express = require('express');
const LabSubmission = require('../../models/assessment/labs/LabSubmission');
const LabManual = require('../../models/assessment/labs/LabManual');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

// Get submissions (admin can view all, users only their own, can filter by course)
router.get('/', authenticate, async (req, res) => {
  try {
    const { course } = req.query;
    const filter = {};

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin' && req.user.role !== 'faculty') {
      filter.user = req.user.id;
    }

    if (course) {
      const labs = await LabManual.find({ course }).select('_id');
      const labIds = labs.map(l => l._id);
      filter.lab = { $in: labIds };
    }

    const submissions = await LabSubmission.find(filter)
      .populate('user', 'name email')
      .populate('lab', 'title labNumber')
      .sort({ submittedAt: -1 })
      .lean();

    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new lab submission (user only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { lab, submissionData } = req.body;
    const newSub = new LabSubmission({ user: req.user.id, lab, submissionData });
    await newSub.save();
    res.status(201).json(newSub);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Grade a lab submission (faculty only)
router.put('/:id/grade', authenticate, async (req, res) => {
  try {
    const { grade, feedback, rubricScores } = req.body;
    const submission = await LabSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    submission.grade = grade;
    submission.feedback = feedback;
    if (rubricScores) submission.rubricScores = rubricScores;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    submission.status = 'graded';
    await submission.save();
    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
