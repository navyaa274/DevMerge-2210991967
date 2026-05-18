const WeaknessHistory = require('../../models/analytics/WeaknessHistory');
const StudentWeakness = require('../../models/analytics/StudentWeakness');
const { evaluateIntervention } = require('../academic/interventionEngineService');
const { adjustLearningPath } = require('../academic/adaptivePathService');

/**
 * Trend Analyzer Service
 * Calculates longitudinal academic signals from historical snapshots
 */
exports.analyzeTrend = async (studentId, courseId, topic) => {
    try {
        // 1. Fetch historical snapshots (Last 5 entries for a rolling window)
        const history = await WeaknessHistory.find({
            studentId,
            courseId,
            topic: { $regex: new RegExp(`^${topic}$`, 'i') }
        })
            .sort({ timestamp: -1 })
            .limit(5);

        if (history.length < 2) return 'Stable';

        // 2. Trend Calculation Logic (Deterministic)
        // We look at the delta between the latest and previous scores
        const latest = history[0];
        const previous = history[1];

        // Rolling average for stability
        const avgSnapshot = history.reduce((acc, curr) => acc + curr.score, 0) / history.length;
        const lastAvg = history.slice(1).reduce((acc, curr) => acc + curr.score, 0) / (history.length - 1);

        const delta = latest.score - lastAvg;

        let trend = 'Stable';

        if (delta >= 10) {
            trend = 'Improving';
        } else if (delta <= -20 && latest.severity === 'Critical') {
            trend = 'Critical';
        } else if (delta <= -10) {
            trend = 'Declining';
        }

        // 3. Update the StudentWeakness profile with the new trend
        await StudentWeakness.updateOne(
            { student: studentId, course: courseId, 'weakTopics.topic': topic },
            { $set: { 'weakTopics.$.improvementTrend': trend } }
        );

        // 4. Trigger Intervention & Adaptive Path Hooks
        if (trend === 'Declining' || trend === 'Critical' || trend === 'Improving') {
            evaluateIntervention(studentId, courseId, topic, trend)
                .catch(err => console.error('[Intervention Hook Error]', err));

            adjustLearningPath(studentId, courseId, trend)
                .catch(err => console.error('[Adaptive Path Hook Error]', err));
        }

        return trend;
    } catch (error) {
        console.error('[Trend Analysis Error]', error);
        return 'Stable';
    }
};

/**
 * Record a new history entry and trigger analysis
 */
exports.recordAndAnalyze = async (studentId, courseId, topic, score, severity) => {
    try {
        await WeaknessHistory.create({
            studentId,
            courseId,
            topic,
            score,
            severity
        });

        return await this.analyzeTrend(studentId, courseId, topic);
    } catch (error) {
        console.error('[Record History Error]', error);
    }
};
