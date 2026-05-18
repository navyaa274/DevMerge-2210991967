const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');

// Dashboard service will be initialized in server/index.js
let dashboardService = null;

const setDashboardService = (service) => {
  dashboardService = service;
};

/**
 * @route   GET /api/realtime-dashboard/metrics
 * @desc    Get current dashboard metrics
 * @access  Admin, Faculty
 */
router.get('/metrics', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    if (!dashboardService) {
      return res.status(503).json({ error: 'Dashboard service not initialized' });
    }

    const metrics = dashboardService.getCurrentMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/realtime-dashboard/historical/:metricType
 * @desc    Get historical data for a metric
 * @access  Admin, Faculty
 */
router.get('/historical/:metricType', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    if (!dashboardService) {
      return res.status(503).json({ error: 'Dashboard service not initialized' });
    }

    const { metricType } = req.params;
    const { timeRange = '24h' } = req.query;

    const data = await dashboardService.getHistoricalData(metricType, timeRange);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/realtime-dashboard/leaderboard
 * @desc    Get live leaderboard
 * @access  Public
 */
router.get('/leaderboard', async (req, res) => {
  try {
    if (!dashboardService) {
      return res.status(503).json({ error: 'Dashboard service not initialized' });
    }

    const { limit = 10 } = req.query;
    const leaderboard = await dashboardService.getLiveLeaderboard(parseInt(limit));
    
    res.json({
      success: true,
      leaderboard,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { router, setDashboardService };
