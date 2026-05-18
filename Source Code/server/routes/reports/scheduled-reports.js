const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const scheduledReportsService = require('../../services/reports/scheduledReports');

/**
 * @route   POST /api/scheduled-reports
 * @desc    Create scheduled report
 * @access  Admin
 */
router.post('/', authenticate, authorize(['admin', 'super_admin']), (req, res) => {
  try {
    const result = scheduledReportsService.createSchedule(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/scheduled-reports
 * @desc    List all scheduled reports
 * @access  Admin
 */
router.get('/', authenticate, authorize(['admin', 'super_admin']), (req, res) => {
  try {
    const schedules = scheduledReportsService.listSchedules();
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/scheduled-reports/:id
 * @desc    Get schedule info
 * @access  Admin
 */
router.get('/:id', authenticate, authorize(['admin', 'super_admin']), (req, res) => {
  try {
    const schedule = scheduledReportsService.getScheduleInfo(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   PUT /api/scheduled-reports/:id
 * @desc    Update scheduled report
 * @access  Admin
 */
router.put('/:id', authenticate, authorize(['admin', 'super_admin']), (req, res) => {
  try {
    const result = scheduledReportsService.updateSchedule(req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/scheduled-reports/:id
 * @desc    Delete scheduled report
 * @access  Admin
 */
router.delete('/:id', authenticate, authorize(['admin', 'super_admin']), (req, res) => {
  try {
    const result = scheduledReportsService.deleteSchedule(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/scheduled-reports/:id/toggle
 * @desc    Enable/disable scheduled report
 * @access  Admin
 */
router.post('/:id/toggle', authenticate, authorize(['admin', 'super_admin']), (req, res) => {
  try {
    const { enabled } = req.body;
    const result = scheduledReportsService.toggleSchedule(req.params.id, enabled);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/scheduled-reports/:id/run
 * @desc    Run scheduled report immediately
 * @access  Admin
 */
router.post('/:id/run', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const result = await scheduledReportsService.runNow(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/scheduled-reports/history/:scheduleId?
 * @desc    Get report history
 * @access  Admin
 */
router.get('/history/:scheduleId?', authenticate, authorize(['admin', 'super_admin']), (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { limit = 50 } = req.query;
    
    const history = scheduledReportsService.getReportHistory(scheduleId, parseInt(limit));
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
