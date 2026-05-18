const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const curriculumPlanner = require('../../services/ai/curriculumPlannerService');
const ultimateGenService = require('../../services/ai/ultimateProblemGeneratorService');

/**
 * @route   POST /api/ai/curriculum/plan/:courseId
 * @desc    Generate a 15-week syllabus for a course
 */
router.post('/plan/:courseId', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        const syllabus = await curriculumPlanner.generateSyllabusForCourse(req.params.courseId, req.user.id);
        res.json({
            success: true,
            message: 'Syllabus planned successfully',
            data: syllabus
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   POST /api/ai/curriculum/batch-labs/:syllabusId
 * @desc    Batch generate all labs for a syllabus
 */
router.post('/batch-labs/:syllabusId', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        const results = await curriculumPlanner.batchGenerateLabs(req.params.syllabusId, req.user.id);
        res.json({
            success: true,
            message: 'Batch generation process initiated',
            results
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * @route   GET /api/ai/curriculum/overview/:programCode/:semester
 * @desc    Get semester overview and subject list
 */
router.get('/overview/:programCode/:semester', authenticate, async (req, res) => {
    try {
        const overview = await ultimateGenService.getSemesterOverview(req.params.programCode, parseInt(req.params.semester));
        res.json({
            success: true,
            data: overview
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
