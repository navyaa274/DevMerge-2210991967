const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const PredictiveAnalytics = require('../../services/analytics/predictiveAnalytics');
const cacheService = require('../../services/infrastructure/cacheService');

/**
 * @route   GET /api/predictive-analytics/performance/:userId
 * @desc    Get performance prediction for a student
 * @access  Student (own), Faculty, Admin
 */
router.get('/performance/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check cache
    const cacheKey = `prediction:${userId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const prediction = await PredictiveAnalytics.predictPerformance(userId);

    // Cache for 1 hour
    await cacheService.set(cacheKey, prediction, 3600);

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/predictive-analytics/at-risk
 * @desc    Get list of at-risk students
 * @access  Faculty, Admin
 */
router.get('/at-risk', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { courseId } = req.query;

    // Check cache
    const cacheKey = `at-risk:${courseId || 'all'}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const result = await PredictiveAnalytics.identifyAtRiskStudents(courseId);

    // Cache for 30 minutes
    await cacheService.set(cacheKey, result, 1800);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/predictive-analytics/class/:courseId
 * @desc    Get class-wide analytics
 * @access  Faculty, Admin
 */
router.get('/class/:courseId', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check cache
    const cacheKey = `class-analytics:${courseId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const result = await PredictiveAnalytics.analyzeClass(courseId);

    // Cache for 1 hour
    await cacheService.set(cacheKey, result, 3600);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/predictive-analytics/batch
 * @desc    Get predictions for multiple students
 * @access  Faculty, Admin
 */
router.post('/batch', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res.status(400).json({ error: 'userIds must be an array' });
    }

    const predictions = await Promise.all(
      userIds.map(userId => PredictiveAnalytics.predictPerformance(userId))
    );

    res.json({
      success: true,
      count: predictions.length,
      predictions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/predictive-analytics/recommendations/:userId
 * @desc    Get personalized recommendations
 * @access  Student (own), Faculty, Admin
 */
router.get('/recommendations/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const prediction = await PredictiveAnalytics.predictPerformance(userId);

    if (!prediction.success) {
      return res.status(500).json({ error: prediction.error });
    }

    res.json({
      success: true,
      userId,
      recommendations: prediction.recommendations,
      level: prediction.prediction.level,
      trend: prediction.metrics.trend
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/predictive-analytics/optimize-path
 * @desc    Initialize path optimization for a student
 * @access  Student (own), Faculty, Admin
 */
router.post('/optimize-path', authenticate, async (req, res) => {
  try {
    const { studentId } = req.body;

    // Check authorization
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    // Get current prediction
    const prediction = await PredictiveAnalytics.predictPerformance(studentId);

    if (!prediction.success) {
      return res.status(500).json({ 
        success: false,
        error: 'Unable to generate prediction for path optimization' 
      });
    }

    // Create optimized learning path based on predictions
    const optimizedPath = {
      studentId,
      generatedAt: new Date(),
      basedOn: {
        overallScore: prediction.prediction.overallScore,
        level: prediction.prediction.level,
        trend: prediction.prediction.trend,
        weakAreas: prediction.recommendations
          .filter(r => r.priority === 'high')
          .map(r => r.area)
      },
      recommendations: prediction.recommendations.map(rec => ({
        area: rec.area,
        priority: rec.priority,
        message: rec.message,
        estimatedTime: rec.estimatedTime || '2-3 hours/week',
        resources: rec.resources || []
      })),
      suggestedActions: [
        {
          action: 'Focus on weak areas',
          priority: 'high',
          areas: prediction.recommendations
            .filter(r => r.priority === 'high')
            .map(r => r.area)
        },
        {
          action: 'Maintain consistency',
          priority: 'medium',
          target: 'Complete at least 3 problems per week'
        },
        {
          action: 'Review fundamentals',
          priority: prediction.prediction.level === 'at-risk' ? 'high' : 'low',
          suggestion: 'Revisit basic concepts before advancing'
        }
      ],
      nextSteps: [
        'Review personalized recommendations',
        'Start with high-priority areas',
        'Track progress weekly',
        'Adjust based on performance'
      ]
    };

    // Clear cache to force refresh
    const cacheKey = `prediction:${studentId}`;
    await cacheService.del(cacheKey);

    res.json({
      success: true,
      message: 'Path optimization initialized successfully',
      optimizedPath
    });
  } catch (error) {
    console.error('Path optimization error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;
