const express = require('express');
const router = express.Router();
const CodeReview = require('../../../models/assessment/sessions/CodeReview');
const { authenticate, authorize } = require('../../../middleware/auth');
const asyncHandler = require('../../../errors/asyncHandler');

// Code Review Routes
// Create code review
router.post('/review', authenticate, authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const { submissionId, reviewerId } = req.body;

  const review = new CodeReview({
    submissionId,
    reviewerId,
    status: 'pending'
  });

  await review.save();
  res.status(201).json(review);
}));

// Get reviews for submission
router.get('/review/submission/:submissionId', authenticate, asyncHandler(async (req, res) => {
  const reviews = await CodeReview.find({ submissionId: req.params.submissionId })
    .populate('reviewerId', 'name email');

  res.json(reviews);
}));

// Add comment to review
router.post('/review/:reviewId/comment', authenticate, authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { lineNumber, code, comment, severity } = req.body;

  const review = await CodeReview.findByIdAndUpdate(
    reviewId,
    {
      $push: {
        comments: { lineNumber, code, comment, severity }
      }
    },
    { new: true }
  );

  res.json(review);
}));

// Complete review
router.put('/review/:reviewId/complete', authenticate, authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { overallRating, codeQualityScore, readabilityScore, efficiencyScore, suggestions } = req.body;

  const review = await CodeReview.findByIdAndUpdate(
    reviewId,
    {
      status: 'completed',
      overallRating,
      codeQualityScore,
      readabilityScore,
      efficiencyScore,
      suggestions,
      completedAt: new Date()
    },
    { new: true }
  );

  res.json(review);
}));

// Get reviews by reviewer
router.get('/review/reviewer/:reviewerId', authenticate, asyncHandler(async (req, res) => {
  const reviews = await CodeReview.find({ reviewerId: req.params.reviewerId })
    .populate('submissionId');

  res.json(reviews);
}));

// Other Code Routes
const { executeCode } = require('../../../utils/codeExecutor');
const Problem = require('../../../models/assessment/problems/Problem');

router.post('/execute', authenticate, asyncHandler(async (req, res) => {
  const { code, language, problemId } = req.body;

  const problem = await Problem.findById(problemId);
  if (!problem) {
    return res.status(404).json({ success: false, message: 'Problem not found' });
  }

  // Use examples as test cases if dedicated testCases are not available
  const testCases = problem.testCases && problem.testCases.length > 0
    ? problem.testCases
    : problem.examples || [];

  const result = await executeCode(code, language, testCases);

  res.json({
    success: true,
    data: result
  });
}));

router.get('/submissions', authenticate, async (req, res) => {
  // Get code submissions
  res.json({ message: 'Code submissions endpoint' });
});

router.post('/peer-review', authenticate, authorize(['student']), async (req, res) => {
  // Submit peer review
  res.json({ message: 'Peer review endpoint' });
});

router.get('/peer-reviews/:submissionId', authenticate, async (req, res) => {
  // Get peer reviews
  res.json({ message: 'Get peer reviews endpoint' });
});

module.exports = router;
