/**
 * Study Priority Algorithm
 * Deterministic logic to rank syllabus topics by academic risk/need
 */

exports.calculateTopicPriorities = (syllabusTopics, weaknessProfile, upcomingExams = []) => {
    return syllabusTopics.map(topic => {
        let score = 0;
        const topicName = topic.title || topic;

        // 1. Weakness Match
        const weakness = weaknessProfile?.weakTopics.find(
            wt => wt.topic.toLowerCase() === topicName.toLowerCase()
        );

        if (weakness) {
            // Severity Weight
            const severityWeights = { 'Critical': 5, 'High': 3, 'Medium': 2, 'Low': 1 };
            score += severityWeights[weakness.severity] || 0;

            // Trend Weight
            if (weakness.improvementTrend === 'Declining') score += 2;
            if (weakness.improvementTrend === 'Improving') score -= 1;
        }

        // 2. Exam Proximity
        // If the topic is part of an upcoming exam (within 10 days)
        const isExamTopic = upcomingExams.some(exam =>
            exam.description.toLowerCase().includes(topicName.toLowerCase()) ||
            exam.title.toLowerCase().includes('mid-term') ||
            exam.title.toLowerCase().includes('final')
        );

        if (isExamTopic) score += 3;

        return {
            topic: topicName,
            score,
            reason: weakness ? `Identified as ${weakness.severity} weakness` : 'General syllabus progression'
        };
    }).sort((a, b) => b.score - a.score);
};
