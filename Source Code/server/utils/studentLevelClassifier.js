const UserProgress = require('../models/analytics/UserProgress');

/**
 * Student Level Classifier
 * Determines if a student is Weak, Average, or Advanced based on metrics
 */

exports.classifyStudentLevel = async (studentId, courseId) => {
    try {
        // 1. Fetch academic performance nodes
        // We look across all learning paths for simplicity in this phase
        const progressNodes = await UserProgress.find({ user: studentId });

        if (!progressNodes || progressNodes.length === 0) {
            return 'Average'; // Baseline for new students
        }

        // 2. Extract scores from quizzes/problems
        const scores = [];
        progressNodes.forEach(path => {
            path.completedContent.forEach(item => {
                if (item.score !== null && item.score !== undefined) {
                    scores.push(item.score);
                }
            });
        });

        if (scores.length < 3) {
            return 'Average'; // Not enough data for deviation
        }

        // 3. Rule-based Classification
        const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        if (averageScore >= 85) return 'Advanced';
        if (averageScore >= 50) return 'Average';
        return 'Weak';

    } catch (error) {
        console.error('[Level Classifier Error]', error);
        return 'Average';
    }
};
