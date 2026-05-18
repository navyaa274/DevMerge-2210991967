const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const DataVisualization = require('../../services/reports/dataVisualization');

/**
 * @route   GET /api/data-visualization/timeseries
 * @desc    Get time series data
 * @access  Faculty, Admin
 */
router.get('/timeseries', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { metric, timeRange = '7d', granularity = 'day' } = req.query;

    const data = await DataVisualization.generateTimeSeries(metric, timeRange, granularity);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/data-visualization/distribution
 * @desc    Get distribution data
 * @access  Faculty, Admin
 */
router.get('/distribution', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { metric, ...filters } = req.query;

    const data = await DataVisualization.generateDistribution(metric, filters);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/data-visualization/heatmap
 * @desc    Get heatmap data
 * @access  Faculty, Admin
 */
router.get('/heatmap', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { metric, ...filters } = req.query;

    const data = await DataVisualization.generateHeatmap(metric, filters);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/data-visualization/comparison
 * @desc    Generate comparison chart
 * @access  Faculty, Admin
 */
router.post('/comparison', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { entities, metric } = req.body;

    const data = await DataVisualization.generateComparison(entities, metric);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
