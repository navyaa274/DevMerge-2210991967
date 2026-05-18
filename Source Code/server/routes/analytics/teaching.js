const express = require('express');
const router = express.Router();
const facultyInsightService = require('../../services/analytics/facultyInsightService');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');

/**
 * @route   GET /api/analytics/teaching/effectiveness/:facultyId
 * @desc    Get the effectiveness index and insights for a specific faculty member
 * @access  Private (HOD/Admin)
 */
router.get('/effectiveness/:facultyId', authenticate, authorizeRoles('hod', 'admin', 'super_admin'), async (req, res) => {
    try {
        const { facultyId } = req.params;
        const insights = await facultyInsightService.getFacultyEffectivenessIndex(facultyId);

        res.json({ success: true, data: insights });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/analytics/teaching/calibration/:courseId
 * @desc    Get difficulty calibration data for a specific course
 * @access  Private (Faculty/HOD/Admin)
 */
router.get('/calibration/:courseId', authenticate, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
    try {
        const { courseId } = req.params;
        const calibration = await facultyInsightService.getCourseDifficultyCalibration(courseId);

        // Provide default structured response even on errors handled in service gracefully
        if (calibration.error) {
            return res.status(500).json({ success: false, message: calibration.error });
        }

        res.json({ success: true, data: calibration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
