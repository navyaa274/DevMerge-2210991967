const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const departmentInsightService = require('../../services/analytics/departmentInsightService');
const programInsightService = require('../../services/analytics/programInsightService');
const cognitiveLoadService = require('../../services/analytics/cognitiveLoadService');
const governanceEfficiencyService = require('../../services/academic/governanceEfficiencyService');
const universitySummaryService = require('../../services/analytics/universitySummaryService');
const facultyWorkloadService = require('../../services/academic/facultyWorkloadService');
const curriculumOptimizationService = require('../../services/academic/curriculumOptimizationService');
const attainmentService = require('../../services/analytics/attainmentService');
const queueService = require('../../services/infrastructure/queueService');
const observabilityService = require('../../services/infrastructure/observabilityService');
const { latencyTracker } = require('../../middleware/latencyTracker');
const User = require('../../models/auth/User');

router.use(latencyTracker); // Apply to all institutional routes

/**
 * @route   GET /api/institutional/department/:departmentId/overview
 * @desc    Get aggregated overview for a specific department
 * @access  Private (HOD/Admin)
 */
router.get(
    '/department/:departmentId/overview',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { departmentId } = req.params;

            // Security Check for HODs: Must belong to this department
            if (req.user.role === 'hod' && req.user.department?.toString() !== departmentId) {
                return res.status(403).json({ success: false, message: "Unauthorized for this department node" });
            }

            const overview = await departmentInsightService.getDepartmentOverview(departmentId);

            res.status(200).json({
                success: true,
                data: overview
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/department/:departmentId/courses
 * @desc    Get all courses in a department with faculty mappings
 * @access  Private (HOD/Admin)
 */
router.get(
    '/department/:departmentId/courses',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { departmentId } = req.params;

            // Security Check for HODs: Must belong to this department
            if (req.user.role === 'hod' && req.user.department?.toString() !== departmentId) {
                return res.status(403).json({ success: false, message: "Unauthorized for this department node" });
            }

            const courses = await departmentInsightService.getDepartmentCourses(departmentId);

            res.status(200).json({
                success: true,
                data: courses
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/program/:programId/overview
 * @desc    Get macro health overview for a program (by semester)
 * @access  Private (HOD/Admin)
 */
router.get(
    '/program/:programId/overview',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { programId } = req.params;
            const overview = await programInsightService.getProgramOverview(programId);
            res.status(200).json({ success: true, data: overview });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/program/:programId/yearly-clusters
 * @desc    Get health trends by academic year clusters
 * @access  Private (HOD/Admin)
 */
router.get(
    '/program/:programId/yearly-clusters',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { programId } = req.params;
            const clusters = await programInsightService.getProgramYearlyCluster(programId);
            res.status(200).json({ success: true, data: clusters });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/cog-load/:departmentId
 * @desc    Get high-risk cognitive load clusters (systemic struggle)
 * @access  Private (HOD/Admin)
 */
router.get(
    '/cog-load/:departmentId',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { departmentId } = req.params;

            // Security Check for HODs: Must belong to this department
            if (req.user.role === 'hod' && req.user.department?.toString() !== departmentId) {
                return res.status(403).json({ success: false, message: "Unauthorized for this department node" });
            }

            const riskClusters = await cognitiveLoadService.getHighRiskCognitiveLoad(departmentId);

            res.status(200).json({
                success: true,
                count: riskClusters.length,
                data: riskClusters
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/efficiency/:departmentId
 * @desc    Get operational efficiency metrics (velocity, turnaround)
 * @access  Private (HOD/Admin)
 */
router.get(
    '/efficiency/:departmentId',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { departmentId } = req.params;

            // Security Check for HODs: Must belong to this department
            if (req.user.role === 'hod' && req.user.department?.toString() !== departmentId) {
                return res.status(403).json({ success: false, message: "Unauthorized for this department node" });
            }

            const efficiency = await governanceEfficiencyService.getDepartmentEfficiency(departmentId);

            res.status(200).json({
                success: true,
                data: efficiency
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/accreditation/department/:departmentId
 * @desc    Get accreditation and attainment report for a department
 * @access  Private (HOD/Admin)
 */
router.get(
    '/accreditation/department/:departmentId',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { departmentId } = req.params;

            // Security Check for HODs: Must belong to this department
            if (req.user.role === 'hod' && req.user.department?.toString() !== departmentId) {
                return res.status(403).json({ success: false, message: "Unauthorized for this department node" });
            }

            const accreditation = await attainmentService.getDepartmentAccreditation(departmentId);

            res.status(200).json({
                success: true,
                data: accreditation
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/university/summary
 * @desc    Get macro-institutional summary for the university
 * @access  Private (Admin/SuperAdmin)
 */
router.get(
    '/university/summary',
    authenticate,
    authorizeRoles('admin', 'super_admin'),
    async (req, res) => {
        try {
            const summary = await universitySummaryService.getUniversitySummary();
            res.status(200).json({ success: true, data: summary });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/university/risk-map
 * @desc    Get top university-wide academic risk topics
 * @access  Private (Admin/SuperAdmin)
 */
router.get(
    '/university/risk-map',
    authenticate,
    authorizeRoles('admin', 'super_admin'),
    async (req, res) => {
        try {
            const summary = await universitySummaryService.getUniversitySummary();
            res.status(200).json({ success: true, data: summary.topInstitutionalRisks });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/faculty/workload/:facultyId
 * @desc    Get detailed workload analytics for a specific faculty member
 * @access  Private (HOD/Admin)
 */
router.get(
    '/faculty/workload/:facultyId',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { facultyId } = req.params;
            const workload = await facultyWorkloadService.getFacultyWorkload(facultyId);
            res.status(200).json({ success: true, data: workload });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/department/:departmentId/workload-distribution
 * @desc    Get workload comparison across all faculty in a department
 * @access  Private (HOD/Admin)
 */
router.get(
    '/department/:departmentId/workload-distribution',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { departmentId } = req.params;

            // Security Check for HODs: Must belong to this department
            if (req.user.role === 'hod' && req.user.department?.toString() !== departmentId) {
                return res.status(403).json({ success: false, message: "Unauthorized for this department node" });
            }

            const distribution = await facultyWorkloadService.getDepartmentWorkloadDistribution(departmentId);
            res.status(200).json({ success: true, data: distribution });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/department/:departmentId/faculty-performance
 * @desc    Get faculty performance rankings for a department
 * @access  Private (HOD/Admin)
 */
router.get(
    '/department/:departmentId/faculty-performance',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { departmentId } = req.params;

            // Security Check for HODs: Must belong to this department
            if (req.user.role === 'hod' && req.user.department?.toString() !== departmentId) {
                return res.status(403).json({ success: false, message: "Unauthorized for this department node" });
            }

            const performance = await departmentInsightService.getDepartmentFacultyPerformance(departmentId);
            res.status(200).json({ success: true, data: performance });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/curriculum-optimization/:courseId
 * @desc    Get data-driven syllabus refinement suggestions
 * @access  Private (Faculty/HOD/Admin)
 */
router.get(
    '/curriculum-optimization/:courseId',
    authenticate,
    authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId } = req.params;
            const facultyId = req.user.id;

            // Security Check for Faculty
            const Course = require('../../models/academic/Course');
            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ success: false, message: "Course not found" });

            if (req.user.role === 'faculty' && !course.facultyIds.includes(facultyId)) {
                return res.status(403).json({ success: false, message: "Unauthorized for this course node" });
            }

            const suggestions = await curriculumOptimizationService.getOptimizationSuggestions(courseId);
            res.status(200).json({ success: true, data: suggestions });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/job/:queueName/:jobId
 * @desc    Check status of a background job
 * @access  Private (Faculty/HOD/Admin)
 */
router.get(
    '/job/:queueName/:jobId',
    authenticate,
    async (req, res) => {
        try {
            const { queueName, jobId } = req.params;
            const queue = queueService.queues[queueName];

            if (!queue) return res.status(404).json({ success: false, message: "Queue not found" });

            const job = await queue.getJob(jobId);
            if (!job) return res.status(404).json({ success: false, message: "Job not found" });

            const state = await job.getState();
            const result = job.returnvalue;
            const progress = job.progress();

            res.status(200).json({
                success: true,
                data: {
                    id: job.id,
                    state,
                    progress,
                    result,
                    isCompleted: state === 'completed',
                    isFailed: state === 'failed'
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/institutional/observability/health
 * @desc    Get system health and observability metrics (AI consumption, Cache)
 * @access  Private (Admin/SuperAdmin)
 */
router.get(
    '/observability/health',
    authenticate,
    authorizeRoles('admin', 'super_admin'),
    async (req, res) => {
        try {
            const snapshot = await observabilityService.getSystemHealthSnapshot();
            res.status(200).json({ success: true, data: snapshot });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

module.exports = router;
