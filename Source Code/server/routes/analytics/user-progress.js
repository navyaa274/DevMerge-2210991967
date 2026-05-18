const express = require('express');
const router = express.Router();
const UserProgress = require('../../models/analytics/UserProgress');
const LearningPath = require('../../models/learning/LearningPath');
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('../../errors/asyncHandler');

// Get user's progress for a learning path
router.get('/:pathId', authenticate, asyncHandler(async (req, res) => {
  let progress = await UserProgress.findOne({
    user: req.user.id,
    learningPath: req.params.pathId
  });

  if (!progress) {
    // Create new progress record
    progress = new UserProgress({
      user: req.user.id,
      learningPath: req.params.pathId,
      completedContent: [],
      overallProgress: 0
    });
    await progress.save();
  }

  res.json(progress);
}));

// Mark content as complete
router.post('/:pathId/complete', authenticate, asyncHandler(async (req, res) => {
  const { contentType, contentId, moduleIndex, contentIndex, score } = req.body;

  let progress = await UserProgress.findOne({
    user: req.user.id,
    learningPath: req.params.pathId
  });

  if (!progress) {
    progress = new UserProgress({
      user: req.user.id,
      learningPath: req.params.pathId
    });
  }

  // Mark content as complete
  progress.markComplete(contentType, contentId, moduleIndex, contentIndex, score);

  // Calculate overall progress
  const learningPath = await LearningPath.findById(req.params.pathId);
  if (learningPath) {
    const totalContent = learningPath.modules.reduce((sum, m) => sum + (m.content?.length || 0), 0);
    const completedCount = progress.completedContent.length;
    progress.overallProgress = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0;
  }

  await progress.save();

  res.json({
    message: 'Progress updated',
    progress: progress.overallProgress,
    completedContent: progress.completedContent
  });
}));

// Check if specific content is completed
router.get('/:pathId/check/:contentType/:contentId', authenticate, asyncHandler(async (req, res) => {
  const { pathId, contentType, contentId } = req.params;
  const { moduleIndex, contentIndex } = req.query;

  const progress = await UserProgress.findOne({
    user: req.user.id,
    learningPath: pathId
  });

  if (!progress) {
    return res.json({ completed: false });
  }

  const isCompleted = progress.isCompleted(
    contentType,
    contentId,
    parseInt(moduleIndex),
    parseInt(contentIndex)
  );

  res.json({ completed: isCompleted });
}));

module.exports = router;
