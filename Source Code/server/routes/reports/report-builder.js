const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const ReportBuilder = require('../../services/reports/reportBuilder');

/**
 * @route   POST /api/report-builder/generate
 * @desc    Generate custom report
 * @access  Faculty, Admin
 */
router.post('/generate', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const config = req.body;
    const report = await ReportBuilder.buildReport(config);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/report-builder/export
 * @desc    Export report to CSV
 * @access  Faculty, Admin
 */
router.post('/export', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const report = req.body;
    const csv = ReportBuilder.exportToCSV(report);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/report-builder/metrics
 * @desc    Get available metrics
 * @access  Faculty, Admin
 */
router.get('/metrics', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), (req, res) => {
  try {
    const metrics = ReportBuilder.getAvailableMetrics();
    res.json({ metrics });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/report-builder/groupby-options
 * @desc    Get group by options
 * @access  Faculty, Admin
 */
router.get('/groupby-options', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), (req, res) => {
  try {
    const options = ReportBuilder.getGroupByOptions();
    res.json({ options });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
