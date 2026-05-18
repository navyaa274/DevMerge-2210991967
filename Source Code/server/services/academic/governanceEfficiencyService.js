const Intervention = require('../../models/learning/pathway/Intervention');
const AssignmentSubmission = require('../../models/assessment/assignments/AssignmentSubmission');
const CopilotUsageLog = require('../../models/analytics/CopilotUsageLog');
const Course = require('../../models/academic/Course');

/**
 * Governance Efficiency Service
 * Measures operational responsiveness and academic delivery velocity
 */

exports.getDepartmentEfficiency = async (departmentId) => {
    try {
        const courses = await Course.find({ department: departmentId });
        const courseIds = courses.map(c => c._id);

        // 1. Intervention Resolution Velocity
        const resolvedInterventions = await Intervention.find({
            courseId: { $in: courseIds },
            status: 'Resolved'
        });

        let totalInterventionTime = 0;
        resolvedInterventions.forEach(i => {
            totalInterventionTime += (i.updatedAt - i.createdAt) / (1000 * 60 * 60 * 24); // days
        });

        const interventionVelocity = resolvedInterventions.length > 0
            ? (totalInterventionTime / resolvedInterventions.length).toFixed(1)
            : 0;

        // 2. Faculty Feedback Turnaround Time
        const gradedSubmissions = await AssignmentSubmission.find({
            assignment: { $in: await getAssignmentIds(courseIds) },
            grade: { $ne: null }
        });

        let totalFeedbackTime = 0;
        gradedSubmissions.forEach(s => {
            totalFeedbackTime += (s.updatedAt - s.submittedAt) / (1000 * 60 * 60); // hours
        });

        const feedbackTurnaround = gradedSubmissions.length > 0
            ? (totalFeedbackTime / gradedSubmissions.length).toFixed(1)
            : 0;

        // 3. AI Copilot Adoption & Pacing (Preparation Velocity)
        const recentLogs = await CopilotUsageLog.find({
            course: { $in: courseIds },
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
        });

        const preparationMetrics = {
            lectureNotesGen: recentLogs.filter(l => l.actionType === 'lecture_notes_gen').length,
            assignmentGen: recentLogs.filter(l => l.actionType === 'assignment_gen').length,
            feedbackGen: recentLogs.filter(l => l.actionType === 'feedback_gen').length
        };

        return {
            interventionResolutionVelocityDays: parseFloat(interventionVelocity),
            feedbackTurnaroundHours: parseFloat(feedbackTurnaround),
            preparationActivity30Days: preparationMetrics,
            efficiencyScore: calculateEfficiencyScore(interventionVelocity, feedbackTurnaround)
        };
    } catch (error) {
        console.error('[Governance Efficiency Error]', error);
        throw error;
    }
};

/**
 * Helper to fetch all assignment IDs for given courses
 */
async function getAssignmentIds(courseIds) {
    const Assignment = require('../../models/assessment/assignments/Assignment');
    const assignments = await Assignment.find({ course: { $in: courseIds } });
    return assignments.map(a => a._id);
}

/**
 * Deterministic Efficiency Score (1-10)
 * Weights: Intervention Speed (60%), Feedback Speed (40%)
 */
function calculateEfficiencyScore(intV, feedbackT) {
    // 0 is default/no data
    if (intV === 0 && feedbackT === 0) return 0;

    // Normalize (Higher speed = Lower days/hours)
    // Score decreases as days/hours increase
    const intScore = Math.max(0, 10 - (intV / 1)); // 1 day resolution is 9/10
    const feedScore = Math.max(0, 10 - (feedbackT / 12)); // 12h turnaround is 9/10

    return parseFloat(((intScore * 0.6) + (feedScore * 0.4)).toFixed(1));
}
