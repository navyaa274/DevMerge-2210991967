const facultyInsightService = require('../../services/analytics/facultyInsightService');
const smartCohortService = require('../../services/learning/smartCohortService');

/**
 * Faculty Dashboard Controller
 * Aggregates advanced instructional and integrity insights.
 */

exports.getGlobalInsights = async (req, res) => {
    try {
        const { courseId } = req.params;

        // 1. Get parallel insights
        const [course, integrity, syllabus] = await Promise.all([
            facultyInsightService.getCourseInsights(courseId),
            facultyInsightService.getIntegrityInsights(courseId),
            facultyInsightService.getSyllabusInsights(courseId)
        ]);

        res.json({
            success: true,
            data: {
                performance: course,
                integrity,
                syllabus
            }
        });
    } catch (error) {
        console.error('[Faculty Dashboard Controller Error]', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get detailed difficulty calibration
 */
exports.getCalibration = async (req, res) => {
    try {
        const { courseId } = req.params;
        const calibration = await facultyInsightService.getCourseDifficultyCalibration(courseId);
        res.json({ success: true, calibration });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Suggest student groups with AI synergy
 */
exports.getSynergyGroups = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { groupSize } = req.query;
        const groups = await smartCohortService.suggestSynergyGroups(courseId, parseInt(groupSize) || 4);
        res.json({ success: true, data: groups });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
