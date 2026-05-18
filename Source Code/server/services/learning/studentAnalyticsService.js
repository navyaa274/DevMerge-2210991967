const StudentWeakness = require('../../models/analytics/StudentWeakness');
const Submission = require('../../models/assessment/problems/Submission');
const ultimateGenService = require('../ai/ultimateProblemGeneratorService');

/**
 * Student Analytics Service
 * Analyzes performance data to detect weaknesses and generate adaptive recommendations.
 */
class StudentAnalyticsService {
    /**
     * Analyze a student's performance in a specific course
     */
    async analyzePerformance(studentId, courseId) {
        // 1. Fetch recent submissions for this student in this course
        // Note: Joining with Problem to get topics
        const submissions = await Submission.find({ student: studentId })
            .populate('problem')
            .sort({ submittedAt: -1 })
            .limit(50);

        if (submissions.length === 0) return null;

        const topicStats = {};

        submissions.forEach(sub => {
            const problem = sub.problem;
            if (!problem) return;

            const topics = problem.topics || [];
            topics.forEach(topic => {
                if (!topicStats[topic]) {
                    topicStats[topic] = { attempts: 0, successes: 0, lastAttempt: sub.submittedAt };
                }
                topicStats[topic].attempts++;
                if (sub.status === 'accepted') {
                    topicStats[topic].successes++;
                }
                if (sub.submittedAt > topicStats[topic].lastAttempt) {
                    topicStats[topic].lastAttempt = sub.submittedAt;
                }
            });
        });

        // 2. Identify weak topics (success rate < 60%)
        const weakTopics = [];
        for (const [topic, stats] of Object.entries(topicStats)) {
            const successRate = (stats.successes / stats.attempts) * 100;
            if (successRate < 60) {
                weakTopics.push({
                    topic,
                    attempts: stats.attempts,
                    successRate,
                    lastAttempt: stats.lastAttempt,
                    severity: successRate < 30 ? 'Critical' : 'High'
                });
            }
        }

        // 3. Update or Create StudentWeakness record
        let record = await StudentWeakness.findOne({ student: studentId, course: courseId });
        if (!record) {
            record = new StudentWeakness({ student: studentId, course: courseId });
        }

        record.weakTopics = weakTopics;
        record.lastAnalyzed = new Date();

        // 4. Generate AI Recommendations for the top weak topic
        if (weakTopics.length > 0) {
            const topWeakness = weakTopics[0];
            const prompt = `
                Student is struggling with topic: ${topWeakness.topic}.
                Success Rate: ${topWeakness.successRate}%.
                Suggest 3 actionable steps to improve mastery.
                Return JSON: { "actions": [{ "action": "String", "priority": "High|Medium|Low", "estimatedTime": Number }] }
            `;

            try {
                const aiRecs = await ultimateGenService._callAI(prompt, "Pedagogical AI Specialist.");
                record.recommendedActions = aiRecs.actions.map(act => ({
                    ...act,
                    topic: topWeakness.topic,
                    completed: false
                }));
            } catch (err) {
                console.warn("[Analytics] AI Rec failed:", err.message);
            }
        }

        await record.save();
        return record;
    }
}

module.exports = new StudentAnalyticsService();
