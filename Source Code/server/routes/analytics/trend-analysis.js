const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const TrendAnalysis = require('../../services/analytics/trendAnalysis');

/**
 * @route   GET /api/trend-analysis/performance/:userId
 * @desc    Analyze performance trend for a student
 * @access  Student (own), Faculty, Admin
 */
router.get('/performance/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeWindow = 30 } = req.query;

    // Check authorization
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = await TrendAnalysis.analyzePerformanceTrend(userId, parseInt(timeWindow));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/trend-analysis/class/:courseId
 * @desc    Analyze class-wide trends
 * @access  Faculty, Admin
 */
router.get('/class/:courseId', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { timeWindow = 30 } = req.query;

    const result = await TrendAnalysis.analyzeClassTrends(courseId, parseInt(timeWindow));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/trend-analysis/compare
 * @desc    Compare trends between students
 * @access  Faculty, Admin
 */
router.post('/compare', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { userIds, timeWindow = 30 } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array' });
    }

    const result = await TrendAnalysis.compareTrends(userIds, parseInt(timeWindow));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
