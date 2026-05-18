const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const AnomalyDetection = require('../../services/analytics/anomalyDetection');

/**
 * @route   GET /api/anomaly-detection/student/:userId
 * @desc    Detect anomalies in student behavior
 * @access  Faculty, Admin
 */
router.get('/student/:userId', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeWindow = 7 } = req.query;

    const result = await AnomalyDetection.detectSubmissionAnomalies(userId, parseInt(timeWindow));

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/anomaly-detection/exam/:examId
 * @desc    Detect anomalies in exam results
 * @access  Faculty, Admin
 */
router.get('/exam/:examId', authenticate, authorize(['faculty', 'hod', 'admin', 'super_admin']), async (req, res) => {
  try {
    const { examId } = req.params;

    const result = await AnomalyDetection.detectExamAnomalies(examId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/anomaly-detection/system
 * @desc    Detect system-wide anomalies
 * @access  Admin
 */
router.get('/system', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const result = await AnomalyDetection.detectSystemAnomalies();

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/anomaly-detection/monitor
 * @desc    Real-time anomaly monitoring
 * @access  Admin
 */
router.get('/monitor', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const result = await AnomalyDetection.monitorRealTime();

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
