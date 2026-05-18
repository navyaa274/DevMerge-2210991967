const StudentWeakness = require('../models/analytics/StudentWeakness');
const Course = require('../models/academic/Course');
const { recordAndAnalyze } = require('../services/analytics/trendAnalyzerService');

/**
 * Weakness Tagging Service
 * Hooks AI interactions into the student's weakness profile
 */

exports.tagInteractionWeakness = async (studentId, courseId, query) => {
    try {
        // 1. Keyword Extraction (Phase 2: Simple mapping)
        // In later phases, this will use NLP/LLM extraction
        const topics = await extractTopics(query, courseId);

        if (topics.length === 0) return;

        // 2. Update StudentWeakness Profile
        let profile = await StudentWeakness.findOne({ student: studentId, course: courseId });
        if (!profile) {
            profile = await StudentWeakness.create({ student: studentId, course: courseId, weakTopics: [] });
        }

        for (const topic of topics) {
            const existingTopic = profile.weakTopics.find(t => t.topic.toLowerCase() === topic.toLowerCase());

            if (existingTopic) {
                existingTopic.attempts = (existingTopic.attempts || 0) + 1;
                existingTopic.lastAttempt = new Date();

                // Record History Snapshot & Analyze Trend
                // For a doubt/query, we assume a baseline mastery of 50
                // This will be outweighed by real practice scores later
                await recordAndAnalyze(studentId, courseId, topic, 50, existingTopic.severity);
            } else {
                profile.weakTopics.push({
                    topic,
                    severity: 'Medium',
                    attempts: 1,
                    lastAttempt: new Date()
                });

                // Record initial snapshot
                await recordAndAnalyze(studentId, courseId, topic, 50, 'Medium');
            }
        }

        profile.updatedAt = new Date();
        await profile.save();

    } catch (error) {
        console.error('[Weakness Tagging Error]', error);
    }
};

/**
 * Helper: Extract relevant topics based on course content
 */
async function extractTopics(query, courseId) {
    // Strategy: Match words in query against course title/tags or common keywords
    // This is a placeholder for a more advanced mapping in Phase 3
    const commonKeywords = ['loop', 'variable', 'function', 'class', 'object', 'array', 'recursion', 'database', 'sql', 'api', 'react', 'node'];
    const queryLower = query.toLowerCase();

    return commonKeywords.filter(k => queryLower.includes(k));
}
