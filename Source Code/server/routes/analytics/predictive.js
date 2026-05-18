const express = require('express');
const router = express.Router();
const PredictiveAnalytics = require('../../services/analytics/predictiveAnalytics');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');

/**
 * @route   GET /api/analytics/predictive/student/:studentId
 * @desc    Get predictive performance forecast and risk level for a student
 * @access  Private (Faculty/HOD/Student self)
 */
router.get('/student/:studentId', authenticate, async (req, res) => {
    try {
        const { studentId } = req.params;

        // Authorization: student can only view their own prediction, faculty/hod can view any
        if (req.user.role === 'student' && req.user.id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this prediction' });
        }

        const prediction = await PredictiveAnalytics.predictPerformance(studentId);

        if (!prediction.success) {
            return res.status(500).json({ success: false, message: prediction.error });
        }

        res.json({ success: true, data: prediction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Dashboard Performance Forecast Alias
router.get('/performance/:studentId', authenticate, async (req, res) => {
    try {
        const { studentId } = req.params;
        if (req.user.role === 'student' && req.user.id !== studentId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        const prediction = await PredictiveAnalytics.predictPerformance(studentId);
        res.json(prediction);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/analytics/predictive/course/:courseId/at-risk
 * @desc    Identify at-risk students for early intervention in a specific course
 * @access  Private (Faculty/HOD)
 */
router.get('/course/:courseId/at-risk', authenticate, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
    try {
        const { courseId } = req.params;

        // In a production scenario, we verify if the faculty teaches this course directly
        const atRiskData = await PredictiveAnalytics.identifyAtRiskStudents(courseId);

        if (!atRiskData.success) {
            return res.status(500).json({ success: false, message: atRiskData.error });
        }

        res.json({ success: true, count: atRiskData.count, data: atRiskData.students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/analytics/predictive/course/:courseId/class-summary
 * @desc    Generates aggregate predictive performance distribution for the entire class 
 * @access  Private (Faculty/HOD)
 */
router.get('/course/:courseId/class-summary', authenticate, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
    try {
        const { courseId } = req.params;

        const classData = await PredictiveAnalytics.analyzeClass(courseId);

        if (!classData.success) {
            return res.status(500).json({ success: false, message: classData.error });
        }

        res.json({ success: true, data: classData });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
