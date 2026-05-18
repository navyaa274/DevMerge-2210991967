const Intervention = require('../../models/learning/pathway/Intervention');
const WeaknessHistory = require('../../models/analytics/WeaknessHistory');

/**
 * Intervention Engine Service
 * Determines when to escalate academic risks to the governance layer
 */

exports.evaluateIntervention = async (studentId, courseId, topic, trend) => {
    try {
        // 1. Cooldown & Active Check
        // Don't create if a Pending/Acknowledged intervention exists for this student/topic
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const existingActive = await Intervention.findOne({
            studentId,
            courseId,
            topic,
            status: { $in: ['Pending', 'Acknowledged'] },
            createdAt: { $gte: sevenDaysAgo }
        });

        if (existingActive) return; // Cooldown or active intervention in progress

        // 2. Fetch History Count for Persistence check
        const historyCount = await WeaknessHistory.countDocuments({ studentId, courseId, topic });

        // 3. Rule Matrix
        let recommendation = null;

        if (trend === 'Critical') {
            recommendation = {
                type: 'faculty_review',
                message: `CRITICAL RISK: Student has experienced a severe drop in ${topic}. Immediate 1-on-1 review or conceptual remediation suggested.`,
                severity: 'High'
            };
        } else if (trend === 'Declining' && historyCount >= 3) {
            // Persistent decline
            recommendation = {
                type: 'faculty_review',
                message: `PERSISTENT DECLINE: Performance in ${topic} has declined over 3+ interactions. Suggest personalized support.`,
                severity: 'Medium'
            };
        } else if (trend === 'Declining') {
            // Initial decline
            recommendation = {
                type: 'extra_practice',
                message: `Initial performance drop in ${topic}. System has flagged for extra practice modules.`,
                severity: 'Low'
            };
        }

        // 4. Persistence
        if (recommendation) {
            await Intervention.create({
                studentId,
                courseId,
                topic,
                triggerTrend: trend,
                recommendationType: recommendation.type,
                message: recommendation.message,
                severityLevel: recommendation.severity
            });
            console.log(`[Intervention Engine] Flagged ${studentId} for ${topic} (${trend})`);
        }

    } catch (error) {
        console.error('[Intervention Engine Error]', error);
    }
};
