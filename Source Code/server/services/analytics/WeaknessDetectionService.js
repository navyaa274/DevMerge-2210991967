const Submission = require('../../models/assessment/problems/Submission');
const Problem = require('../../models/assessment/problems/Problem');
const RecommendationEngine = require('../ai/recommendationEngine');

class WeaknessDetectionService {
    /**
     * Performs high-fidelity cognitive diagnosis for a student
     */
    static async diagnose(userId, courseId) {
        try {
            // 1. Gather all activity for the user in this course
            // (If courseId is provided, filter by problems in that course)
            const query = { userId };
            if (courseId) {
                const courseProblems = await Problem.find({ course: courseId }).select('_id');
                query.problemId = { $in: courseProblems.map(p => p._id) };
            }

            const submissions = await Submission.find(query)
                .populate('problemId')
                .sort({ createdAt: -1 })
                .lean();

            if (submissions.length === 0) {
                return {
                    interventionRequired: false,
                    overallWeaknessScore: 0,
                    criticalTopicsCount: 0,
                    performanceSummary: { averageScore: 0 },
                    weakTopics: [],
                    aiRecommendations: {
                        confidenceLevel: 100,
                        focusAreas: [],
                        practiceStrategy: 'Begin solving problems to generate adaptive cognitive profiling and AI optimization strategies.',
                        estimatedTimeToImprove: 0,
                        studyPlan: 'Neural path initialization pending. Practice activity required for vector generation.'
                    }
                };
            }

            // 2. Profile building via RecommendationEngine's logic (reusing existing robust code)
            const profile = RecommendationEngine.analyzeUserProfile(submissions);

            // 3. Detailed Topic Analysis
            const topicStats = {};
            submissions.forEach(sub => {
                const topic = sub.problemId?.category || 'General';
                if (!topicStats[topic]) {
                    topicStats[topic] = {
                        topic,
                        questionsAttempted: 0,
                        questionsCorrect: 0,
                        questionsIncorrect: 0,
                        scores: []
                    };
                }

                topicStats[topic].questionsAttempted++;
                if (sub.status === 'accepted') {
                    topicStats[topic].questionsCorrect++;
                    topicStats[topic].scores.push(100);
                } else {
                    topicStats[topic].questionsIncorrect++;
                    topicStats[topic].scores.push(0);
                }
            });

            // 4. Calculate weakness scores per topic
            const weakTopics = Object.values(topicStats).map(t => {
                const accuracy = (t.questionsCorrect / t.questionsAttempted) * 100;
                const weaknessScore = 100 - accuracy;

                let severity = 'Low';
                if (weaknessScore > 70) severity = 'Critical';
                else if (weaknessScore > 40) severity = 'High';
                else if (weaknessScore > 20) severity = 'Medium';

                return {
                    ...t,
                    accuracy,
                    weaknessScore,
                    severity,
                    category: 'Core Competency',
                    recommendations: this.generateRecommendations(t, weaknessScore)
                };
            }).sort((a, b) => b.weaknessScore - a.weaknessScore);

            // 5. Overall metrics
            const criticalTopicsCount = weakTopics.filter(t => t.severity === 'Critical' || t.severity === 'High').length;
            const averageScore = weakTopics.reduce((acc, t) => acc + t.accuracy, 0) / weakTopics.length;

            return {
                overallWeaknessScore: 100 - averageScore,
                criticalTopicsCount,
                performanceSummary: { averageScore },
                interventionRequired: criticalTopicsCount >= 2,
                interventionType: criticalTopicsCount >= 3 ? 'Immediate Peer Mentoring' : 'Additional AI Tutoring',
                weakTopics: weakTopics.slice(0, 6), // Top 6 weakest
                aiRecommendations: {
                    confidenceLevel: 85 + (submissions.length > 50 ? 10 : 0),
                    focusAreas: weakTopics.slice(0, 3).map(t => t.topic),
                    practiceStrategy: 'Spaced repetition with focus on edge-case testing and algorithmic complexity analysis.',
                    estimatedTimeToImprove: criticalTopicsCount * 4, // 4 hours per critical topic
                    studyPlan: `Phase 1: Concepts Review (${weakTopics[0]?.topic || 'General'})\nPhase 2: Pattern Recognition Exercises\nPhase 3: High-Complexity Problem Sets`
                }
            };
        } catch (error) {
            console.error('Diagnosis Error:', error);
            throw error;
        }
    }

    static generateRecommendations(topic, score) {
        if (score > 70) {
            return [
                `Re-review foundational videos for ${topic.topic}`,
                'Schedule a 1-on-1 AI Tutor session',
                'Attempt 5 "Easy" difficulty problems in this category'
            ];
        }
        if (score > 40) {
            return [
                'Analyze common errors in your previous submissions',
                'Use the AI Code Review tool on failed attempts',
                'Focus on "Medium" level problems'
            ];
        }
        return [
            'Maintain consistency with daily practice',
            'Try teaching this concept to a peer',
            'Explore advanced variants of these problems'
        ];
    }
}

module.exports = WeaknessDetectionService;
