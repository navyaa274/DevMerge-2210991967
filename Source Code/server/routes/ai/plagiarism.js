const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const PlagiarismReport = require('../../models/assessment/logic/PlagiarismReport');

/**
 * @route   GET /api/ai/plagiarism/reports/:courseId
 * @desc    Get all plagiarism reports for a specific course (Faculty only)
 */
router.get('/reports/:courseId', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        const reports = await PlagiarismReport.find({ problem: { $in: await getCourseProblemIds(req.params.courseId) } })
            .populate('submission1', 'student code language')
            .populate('submission2', 'student code language')
            .populate('problem', 'title')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/ai/plagiarism/report/:reportId
 * @desc    Get detailed analysis for a specific plagiarism report
 */
router.get('/report/:reportId', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        const report = await PlagiarismReport.findById(req.params.reportId)
            .populate('submission1')
            .populate('submission2')
            .populate('problem');

        if (!report) return res.status(404).json({ success: false, message: "Report not found" });

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Helper to get problem IDs for a course
 */
async function getCourseProblemIds(courseId) {
    const Problem = require('../../models/assessment/problems/Problem');
    const problems = await Problem.find({ course: courseId }).select('_id');
    return problems.map(p => p._id);
}

module.exports = router;
