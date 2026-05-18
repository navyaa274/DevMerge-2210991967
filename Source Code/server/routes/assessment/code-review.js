const express = require('express');
const router = express.Router();
const CodeReview = require('../../models/assessment/sessions/CodeReview');
const { authorize } = require('../../middleware/rbac');
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('../../errors/asyncHandler');

router.use(authenticate);

// Create code review
router.post('/', authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const { submissionId, reviewerId } = req.body;

  const review = new CodeReview({
    submissionId,
    reviewerId,
    status: 'pending'
  });

  await review.save();
  res.status(201).json(review);
}));

// Get review queue (filtered)
router.get('/', authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {};

  if (status && status !== 'all') {
    query.status = status;
  }

  // Faculty sees own review queue by default
  if (req.user.role === 'faculty') {
    query.reviewerId = req.user.id;
  }

  const reviews = await CodeReview.find(query)
    .populate('reviewerId', 'name email')
    .populate('submissionId')
    .sort({ updatedAt: -1, createdAt: -1 })
    .lean();

  res.json(reviews);
}));

// Get reviews for submission
router.get('/submission/:submissionId', asyncHandler(async (req, res) => {
  const reviews = await CodeReview.find({ submissionId: req.params.submissionId })
    .populate('reviewerId', 'name email');

  res.json(reviews);
}));

// Add comment to review
router.post('/:reviewId/comment', authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
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
router.put('/:reviewId/complete', authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
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
router.get('/reviewer/:reviewerId', asyncHandler(async (req, res) => {
  const reviews = await CodeReview.find({ reviewerId: req.params.reviewerId })
    .populate('submissionId');

  res.json(reviews);
}));

// AI-Automated Code Review
const Submission = require('../../models/assessment/problems/Submission');
const aiService = require('../../utils/aiService');

router.post('/ai', authorize(['faculty', 'admin', 'student']), asyncHandler(async (req, res) => {
  const { submissionId, code, language } = req.body;

  let targetCode = code;
  let targetLang = language;

  // Use submissionId if provided to fetch latest content
  if (submissionId) {
    const submission = await Submission.findById(submissionId).populate('problem');
    if (submission) {
      targetCode = submission.code;
      targetLang = submission.language;
    }
  }

  if (!targetCode) {
    return res.status(400).json({ success: false, message: "No code provided for review" });
  }

  const review = await aiService.generateAICodeReview(targetCode, targetLang);

  res.json({
    success: true,
    data: review
  });
}));

module.exports = router;
