const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const RecommendationEngine = require('../../services/ai/recommendationEngine');
const cacheService = require('../../services/infrastructure/cacheService');

/**
 * @route   GET /api/recommendations/problems
 * @desc    Get recommended problems for user
 * @access  Student
 */
router.get('/problems', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    // Check cache
    const cacheKey = `recommendations:problems:${userId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const recommendations = await RecommendationEngine.recommendProblems(userId, parseInt(limit));

    // Cache for 1 hour
    await cacheService.set(cacheKey, recommendations, 3600);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/recommendations/courses
 * @desc    Get recommended courses for user
 * @access  Student
 */
router.get('/courses', authenticate, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userId = req.user.id;

    // Check cache
    const cacheKey = `recommendations:courses:${userId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const recommendations = await RecommendationEngine.recommendCourses(userId, parseInt(limit));

    // Cache for 2 hours
    await cacheService.set(cacheKey, recommendations, 7200);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/recommendations/learning-paths
 * @desc    Get personalized learning paths
 * @access  Student
 */
router.get('/learning-paths', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check cache
    const cacheKey = `recommendations:paths:${userId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const recommendations = await RecommendationEngine.recommendLearningPaths(userId);

    // Cache for 6 hours
    await cacheService.set(cacheKey, recommendations, 21600);

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/recommendations/similar-users
 * @desc    Find similar users for collaborative filtering
 * @access  Student
 */
router.get('/similar-users', authenticate, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    // Check cache
    const cacheKey = `recommendations:similar:${userId}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const result = await RecommendationEngine.findSimilarUsers(userId, parseInt(limit));

    // Cache for 24 hours
    await cacheService.set(cacheKey, result, 86400);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/recommendations/refresh
 * @desc    Refresh recommendations cache
 * @access  Student
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Clear all recommendation caches for user
    await cacheService.del(`recommendations:problems:${userId}`);
    await cacheService.del(`recommendations:courses:${userId}`);
    await cacheService.del(`recommendations:paths:${userId}`);
    await cacheService.del(`recommendations:similar:${userId}`);

    res.json({
      success: true,
      message: 'Recommendations cache refreshed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
