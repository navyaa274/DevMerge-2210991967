const express = require('express');
const { authenticate } = require('../../middleware/auth');
const logger = require('../../utils/logger');
const Submission = require('../../models/assessment/problems/Submission');

const router = express.Router();

// Get submissions for peer review
router.get('/submissions', authenticate, async (req, res) => {
  try {
    const submissions = await Submission.find({ isPublic: true })
      .populate('student', 'name')
      .populate('problem', 'title')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, data: submissions });
  } catch (error) {
    logger.error('Failed to fetch submissions for review', error);
    res.status(500).json({ message: error.message });
  }
});

// Submit peer review
router.post('/:submissionId', authenticate, async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { review, rating } = req.body;

    if (!review || !rating) {
      return res.status(400).json({ message: 'Review and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    logger.info(`Peer review submitted for submission: ${submissionId}`, { userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Peer review submitted successfully'
    });
  } catch (error) {
    logger.error('Failed to submit peer review', error);
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a submission
router.get('/:submissionId/reviews', authenticate, async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
