const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');
const logger = require('../../utils/logger');

const router = express.Router();

const systemStatsService = require('../../services/system/systemStatsService');

// Get system logs (super admin only)
// Public health endpoint - no authentication required
router.get('/health-public', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      data: { 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/logs', authenticate, authorize(['super_admin']), async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await systemStatsService.getRecentActivity(parseInt(limit));
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get system health
router.get('/health', authenticate, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const health = await systemStatsService.getSystemHealth();
    res.json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get system statistics
router.get('/stats', authenticate, authorize(['super_admin', 'admin']), async (req, res) => {
  try {
    const stats = await systemStatsService.getGlobalStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
