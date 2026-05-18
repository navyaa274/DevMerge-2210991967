const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const assignmentGeneratorService = require('../../services/ai/assignmentGeneratorService');
const rubricGeneratorService = require('../../services/ai/rubricGeneratorService');
const feedbackGeneratorService = require('../../services/ai/feedbackGeneratorService');
const codeReviewService = require('../../services/ai/codeReviewService');
const lectureGeneratorService = require('../../services/ai/lectureGeneratorService');
const facultyInsightService = require('../../services/analytics/facultyInsightService');

/**
 * @route   POST /api/faculty-copilot/generate-assignment
 * @desc    Generate a structured, CO-mapped assignment
 * @access  Private (Faculty/Admin)
 */
router.post(
    '/generate-assignment',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId, unitId, type, totalMarks, bloomLevel } = req.body;
            const facultyId = req.user.id;
            const bypassAuth = req.user.role === 'admin' || req.user.role === 'super_admin';

            if (!courseId || !totalMarks) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }

            const assignment = await assignmentGeneratorService.generateAssignment({
                facultyId,
                courseId,
                unitId,
                type: type || 'Theory',
                totalMarks,
                bloomLevel: bloomLevel || 'Apply',
                bypassAuth
            });

            res.status(200).json({
                success: true,
                data: assignment
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   POST /api/faculty-copilot/generate-rubric
 * @desc    Generate a structured grading rubric for an assignment
 * @access  Private (Faculty/Admin)
 */
router.post(
    '/generate-rubric',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId, assignment, strictnessLevel } = req.body;
            const facultyId = req.user.id;
            const bypassAuth = req.user.role === 'admin' || req.user.role === 'super_admin';

            if (!courseId || !assignment || !assignment.questions) {
                return res.status(400).json({ success: false, message: "Missing required fields (courseId or assignment content)" });
            }

            const rubric = await rubricGeneratorService.generateRubric({
                facultyId,
                courseId,
                assignment,
                strictnessLevel: strictnessLevel || 'standard'
            });

            res.status(200).json({
                success: true,
                data: rubric
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   POST /api/faculty-copilot/generate-feedback
 * @desc    Generate structured pedagogical feedback for a submission
 * @access  Private (Faculty/Admin)
 */
router.post(
    '/generate-feedback',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId, submissionId, rubricId, scoreBreakdown } = req.body;
            const facultyId = req.user.id;
            const bypassAuth = req.user.role === 'admin' || req.user.role === 'super_admin';

            if (!courseId || !submissionId || !rubricId) {
                return res.status(400).json({ success: false, message: "Missing required fields (courseId, submissionId, or rubricId)" });
            }

            const feedback = await feedbackGeneratorService.generateAutoFeedback({
                facultyId,
                courseId,
                submissionId,
                rubricId,
                scoreBreakdown
            });

            res.status(200).json({
                success: true,
                data: feedback
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   POST /api/faculty-copilot/review-code
 * @desc    Perform in-depth technical code review
 * @access  Private (Faculty/Admin)
 */
router.post(
    '/review-code',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId, submissionId, settings } = req.body;
            const facultyId = req.user.id;
            const bypassAuth = req.user.role === 'admin' || req.user.role === 'super_admin';

            if (!courseId || !submissionId) {
                return res.status(400).json({ success: false, message: "Missing required fields (courseId or submissionId)" });
            }

            const review = await codeReviewService.generateCodeReview({
                facultyId,
                courseId,
                submissionId,
                settings: settings || {}
            });

            res.status(200).json({
                success: true,
                data: review
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   POST /api/faculty-copilot/generate-lecture
 * @desc    Generate structured lecture notes and slide breakdown
 * @access  Private (Faculty/Admin)
 */
router.post(
    '/generate-lecture',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId, unitId, durationMinutes, bloomFocus } = req.body;
            const facultyId = req.user.id;
            const bypassAuth = req.user.role === 'admin' || req.user.role === 'super_admin';

            if (!courseId || !unitId || !durationMinutes) {
                return res.status(400).json({ success: false, message: "Missing required fields (courseId, unitId, or durationMinutes)" });
            }

            const lecture = await lectureGeneratorService.generateLecture({
                facultyId,
                courseId,
                unitId,
                durationMinutes,
                bloomFocus: bloomFocus || 'Understand'
            });

            res.status(200).json({
                success: true,
                data: lecture
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/faculty-copilot/insights/course/:courseId
 * @desc    Get aggregated instructional insights for a course
 * @access  Private (Faculty/HOD/Admin)
 */
router.get(
    '/insights/course/:courseId',
    authenticate,
    authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId } = req.params;
            const facultyId = req.user.id;

            const Course = require('../../models/academic/Course');
            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ success: false, message: "Course not found" });

            if (req.user.role === 'faculty' && !course.facultyIds.includes(facultyId)) {
                return res.status(403).json({ success: false, message: "Unauthorized for this course node" });
            }

            const generalInsights = await facultyInsightService.getCourseInsights(courseId);
            const assignmentInsights = await facultyInsightService.getAssignmentInsights(courseId);
            const qualityInsights = await facultyInsightService.getCodeQualityInsights(courseId);

            res.status(200).json({
                success: true,
                data: {
                    ...generalInsights,
                    assignments: assignmentInsights,
                    qualityInsights
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/faculty-copilot/insights/interventions/:courseId
 * @desc    Get detailed intervention analytics
 * @access  Private (Faculty/HOD/Admin)
 */
router.get(
    '/insights/interventions/:courseId',
    authenticate,
    authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId } = req.params;
            const insights = await facultyInsightService.getCourseInsights(courseId);
            res.status(200).json({ success: true, data: insights.interventionSummary });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

/**
 * @route   GET /api/faculty-copilot/insights/topic/:courseId/:topic
 * @desc    Get deep-dive insights for a specific topic
 * @access  Private (Faculty/HOD/Admin)
 */
router.get(
    '/insights/topic/:courseId/:topic',
    authenticate,
    authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
    async (req, res) => {
        try {
            const { courseId, topic } = req.params;
            const general = await facultyInsightService.getCourseInsights(courseId);
            const topicData = general.heatmap.find(h => h.topic.toLowerCase() === topic.toLowerCase());

            res.status(200).json({
                success: true,
                data: topicData || { topic, message: "No data found for this topic" }
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

const facultyCopilotController = require('../../controllers/ai/facultyCopilotController');

/**
 * @route   POST /api/faculty-copilot/generate-test-paper
 * @desc    Generate theoretical test paper based on syllabus
 * @access  Private (Faculty/Admin)
 */
router.post(
    '/generate-test-paper',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    facultyCopilotController.generateTestPaper
);

/**
 * @route   POST /api/faculty-copilot/generate-notes
 * @desc    Generate structured lecture notes
 */
router.post(
    '/generate-notes',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    facultyCopilotController.generateLectureNotes
);

/**
 * @route   POST /api/faculty-copilot/publish-assignment
 * @desc    Approve and publish an AI-generated assignment to students
 */
router.post(
    '/publish-assignment',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    facultyCopilotController.publishAssignment
);

module.exports = router;
