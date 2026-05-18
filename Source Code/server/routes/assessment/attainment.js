const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const attainmentService = require('../../services/analytics/attainmentService');
const Course = require('../../models/academic/Course');

/**
 * @route   GET /api/attainment/course/:courseId
 * @desc    Calculate CO-PO attainment for a specific course
 * @access  Private (Faculty/HOD/Admin)
 */
router.get(
    '/course/:courseId',
    authenticate,
    authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId } = req.params;
            const facultyId = req.user.id;

            // Security Check
            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ success: false, message: "Course not found" });

            if (req.user.role === 'faculty' && !course.facultyIds.includes(facultyId)) {
                return res.status(403).json({ success: false, message: "Unauthorized for this course node" });
            }

            const results = await attainmentService.calculateCourseAttainment(courseId);

            res.status(200).json({
                success: true,
                data: results
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

module.exports = router;
