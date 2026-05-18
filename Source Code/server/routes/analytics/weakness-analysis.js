const express = require('express');
const WeaknessAnalysis = require('../../models/analytics/WeaknessAnalysis');
const { authenticate, authorize } = require('../../middleware/auth');

const WeaknessDetectionService = require('../../services/analytics/WeaknessDetectionService');

const router = express.Router();

// Get real-time cognitive diagnosis for a student
router.get('/student/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.query;

    // Security check: Only user or admin can view
    if (req.user.id !== userId && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const diagnosis = await WeaknessDetectionService.diagnose(userId, courseId);

    res.json({
      success: true,
      analysis: diagnosis
    });
  } catch (err) {
    console.error('API Error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Placeholder for history (can be expanded later)
router.get('/student/:userId/history', authenticate, async (req, res) => {
  res.json({ success: true, history: [] });
});

// Placeholder for improvement (can be expanded later)
router.get('/student/:userId/improvement', authenticate, async (req, res) => {
  res.json({
    success: true,
    improvement: {
      initialScore: 65,
      currentScore: 78,
      improvementPercentage: 13,
      topicsImproved: [],
      topicsDeclined: []
    }
  });
});

module.exports = router;
