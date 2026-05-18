const aiCareerPredictor = require('../../services/analytics/aiCareerPredictorService');

/**
 * Career Path Controller
 * Handles AI-driven career projections for students.
 */

exports.getCareerProjection = async (req, res) => {
    try {
        const studentId = req.user.id;
        const projection = await aiCareerPredictor.predictCareerPath(studentId);

        res.json({
            success: true,
            projection
        });
    } catch (error) {
        console.error('[Career Controller Error]', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
