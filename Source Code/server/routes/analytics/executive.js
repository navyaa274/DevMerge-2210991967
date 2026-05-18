const express = require('express');
const router = express.Router();
const DepartmentInsightService = require('../../services/analytics/departmentInsightService');
const mongoose = require('mongoose');
const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const tenantResolver = require('../../middleware/tenantResolver');

/**
 * @route   GET /api/analytics/executive/cross-campus
 * @desc    Generate executive-level cross-campus analytics (Departments vs Programs comparisons)
 * @access  Private (Super Admin / Provost)
 */
router.get('/cross-campus', authenticate, tenantResolver, authorizeRoles('admin', 'super_admin'), async (req, res) => {
    try {
        // For benchmarking, we would iterate all departments.
        // Assuming a simplified fetch logic based on existing Mongoose logic:

        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        const totalCourses = await Course.countDocuments();

        res.json({
            success: true,
            data: {
                campusMetrics: { totalStudents, totalFaculty, totalCourses },
                departmentBenchmarking: []
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/analytics/executive/department/:departmentId/heatmap
 * @desc    Get performance heatmap across sub-programs for a specific department
 * @access  Private (HOD / Admin)
 */
router.get('/department/:departmentId/heatmap', authenticate, authorizeRoles('hod', 'admin'), async (req, res) => {
    try {
        const { departmentId } = req.params;

        const insightServiceResult = await DepartmentInsightService.getDepartmentInsights(departmentId);

        // Distill it specifically into heatmap structures for frontend D3.js or Chart.js representations
        res.json({
            success: true,
            data: {
                performanceDistribution: insightServiceResult.overallPerformance || {},
                struggleAreas: insightServiceResult.topStrugglingTopics || [],
                recommendations: "Implement core programming logic review seminars for Week 3 cohorts."
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
