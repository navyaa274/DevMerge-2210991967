const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');

// Shared Utility Routes
router.get('/health', async (req, res) => {
  // System health check
  res.json({ status: 'OK', timestamp: new Date() });
});

router.get('/version', async (req, res) => {
  // API version info
  res.json({ version: '1.0.0', environment: process.env.NODE_ENV });
});

router.get('/features', authenticate, async (req, res) => {
  // Available features
  res.json({ features: ['ai-tutor', 'analytics', 'learning-paths'] });
});

router.post('/feedback', authenticate, async (req, res) => {
  // User feedback submission
  res.json({ message: 'Feedback submitted successfully' });
});

router.get('/stats', authenticate, async (req, res) => {
  // General statistics
  res.json({ users: 1000, courses: 50, problems: 500 });
});

const searchController = require('../../controllers/shared/searchController');

// Global Platform Search
router.get('/search', authenticate, searchController.globalSearch);

// Professional Enterprise Integration
router.use('/enterprise', require('./enterprise'));

// System Health Diagnostics
router.get('/health', (req, res) => {
  res.json({
    status: 'Operational',
    timestamp: new Date().toISOString(),
    version: '1.4.2-premium',
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router;
