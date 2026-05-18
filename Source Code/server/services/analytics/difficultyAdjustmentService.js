const ChatSession = require('../../models/communication/ChatSession');
const UserProgress = require('../../models/analytics/UserProgress');

/**
 * Dynamic Difficulty Engine
 * Calculates a proficiency drift based on recent performance
 */
exports.calculateDynamicDifficulty = async (studentId, courseId) => {
    try {
        // 1. Fetch Latest Interaction Context
        const session = await ChatSession.findOne({ student: studentId, course: courseId, isActive: true })
            .sort({ updatedAt: -1 });

        // 2. Fetch Latest Performance Data
        const progress = await UserProgress.findOne({ user: studentId });

        // Baseline Level (from existing classifier logic)
        let proficiencyScore = 50; // Neutral baseline

        // 3. Interaction Drift Logic (Last 5 messages)
        if (session && session.messages.length > 0) {
            const recentMessages = session.messages.slice(-5);

            // Simple logic: If student is asking "Explain", "I don't understand", etc. - scaffolding increases
            const confusionKeywords = ['understand', 'confused', 'dont know', 'explain again', 'simpler'];
            const masteryKeywords = ['understood', 'next', 'challenge', 'advanced', 'complex'];

            recentMessages.forEach(msg => {
                if (msg.role === 'user') {
                    const text = msg.content.toLowerCase();
                    if (confusionKeywords.some(k => text.includes(k))) proficiencyScore -= 10;
                    if (masteryKeywords.some(k => text.includes(k))) proficiencyScore += 10;
                }
            });
        }

        // 4. Assessment Performance Drift (Last 3 scores)
        if (progress && progress.completedContent.length > 0) {
            const recentScores = progress.completedContent
                .filter(c => c.score !== null)
                .slice(-3);

            const avgScore = recentScores.reduce((a, b) => a + b.score, 0) / (recentScores.length || 1);

            if (avgScore > 80) proficiencyScore += 15;
            if (avgScore < 40) proficiencyScore -= 15;
        }

        // 5. Categorize the Drift
        if (proficiencyScore <= 35) return 'Remedial'; // Extra simple
        if (proficiencyScore <= 65) return 'Standard'; // Balanced
        return 'Advanced'; // Challenge mode

    } catch (error) {
        console.error('[Difficulty Drift Error]', error);
        return 'Standard';
    }
};
