const Department = require('../../models/academic/Department');
const departmentInsightService = require('./departmentInsightService');
const governanceEfficiencyService = require('../academic/governanceEfficiencyService');
const StudentLearningState = require('../../models/learning/pathway/StudentLearningState');
const cacheManager = require('../../utils/cacheManager');

/**
 * University Summary Engine
 * Highest level abstraction for institutional governance
 */

exports.getUniversitySummary = async () => {
    try {
        const cacheKey = cacheManager.generateKey('uni_summary', 'global');
        const cached = await cacheManager.get(cacheKey);
        if (cached) return cached;

        const departments = await Department.find();

        let totalCriticalRate = 0;
        let totalDecliningRate = 0;
        let totalStatsCount = 0;

        let totalResDays = 0;
        let totalFeedbackHours = 0;
        let totalEfficiencyScore = 0;
        let deptEfficiencyCount = 0;

        const deptDistributions = [];
        const combinedHeatmap = {};

        for (const dept of departments) {
            const deptOverview = await departmentInsightService.getDepartmentOverview(dept._id);
            const deptEfficiency = await governanceEfficiencyService.getDepartmentEfficiency(dept._id);

            // 1. Health Aggregation
            if (deptOverview.courseRankings.length > 0) {
                const avgCritical = deptOverview.courseRankings.reduce((a, b) => a + b.criticalRate, 0) / deptOverview.courseRankings.length;
                const avgDeclining = deptOverview.courseRankings.reduce((a, b) => a + b.decliningRate, 0) / deptOverview.courseRankings.length;

                totalCriticalRate += avgCritical;
                totalDecliningRate += avgDeclining;
                totalStatsCount++;

                // Health Index per Dept
                const healthIndex = Math.max(1, (10 - (avgCritical * 0.2) - (avgDeclining * 0.1)).toFixed(1));

                deptDistributions.push({
                    departmentId: dept._id,
                    name: dept.name,
                    code: dept.code,
                    healthIndex: parseFloat(healthIndex),
                    efficiencyScore: deptEfficiency.efficiencyScore
                });

                // Global Risk Map aggregation (Topic-based)
                // We'll aggregate the top topics from deptOverview heatmap if it exists
                (deptOverview.heatmap || []).forEach(h => {
                    if (!combinedHeatmap[h.topic]) combinedHeatmap[h.topic] = { criticalCount: 0, totalFlagged: 0 };
                    combinedHeatmap[h.topic].criticalCount += (h.totalFlagged * (h.criticalRate / 100)); // approx
                    combinedHeatmap[h.topic].totalFlagged += h.totalFlagged;
                });
            }

            // 2. Governance Aggregation
            if (deptEfficiency.interventionResolutionVelocityDays > 0) {
                totalResDays += deptEfficiency.interventionResolutionVelocityDays;
                totalFeedbackHours += deptEfficiency.feedbackTurnaroundHours;
                totalEfficiencyScore += deptEfficiency.efficiencyScore;
                deptEfficiencyCount++;
            }
        }

        // 3. Cognitive Load Distribution (University-Wide)
        const learningStates = await StudentLearningState.find();
        const cogLoad = { remedial: 0, normal: 0, accelerated: 0, total: learningStates.length };
        learningStates.forEach(s => {
            if (cogLoad[s.adaptationMode] !== undefined) cogLoad[s.adaptationMode]++;
        });

        // 4. Global Risk concentration
        const riskMap = Object.entries(combinedHeatmap).map(([topic, stats]) => ({
            topic,
            criticalIntensity: stats.criticalCount,
            totalFlagged: stats.totalFlagged
        })).sort((a, b) => b.criticalIntensity - a.criticalIntensity).slice(0, 5);

        // 5. University Indices
        const universityCritical = totalStatsCount > 0 ? (totalCriticalRate / totalStatsCount).toFixed(1) : 0;
        const universityDeclining = totalStatsCount > 0 ? (totalDecliningRate / totalStatsCount).toFixed(1) : 0;
        const academicHealthIndex = Math.max(1, (10 - (universityCritical * 0.2) - (universityDeclining * 0.1)).toFixed(1));

        const result = {
            universityAcademicHealth: {
                criticalRate: parseFloat(universityCritical),
                decliningRate: parseFloat(universityDeclining),
                academicHealthIndex: parseFloat(academicHealthIndex)
            },
            governanceResponsiveness: {
                avgResolutionDays: deptEfficiencyCount > 0 ? (totalResDays / deptEfficiencyCount).toFixed(1) : 0,
                avgFeedbackHours: deptEfficiencyCount > 0 ? (totalFeedbackHours / deptEfficiencyCount).toFixed(1) : 0,
                governanceIndex: deptEfficiencyCount > 0 ? (totalEfficiencyScore / deptEfficiencyCount).toFixed(1) : 0
            },
            cognitiveDistribution: {
                remedial: cogLoad.total > 0 ? Math.round((cogLoad.remedial / cogLoad.total) * 100) : 0,
                normal: cogLoad.total > 0 ? Math.round((cogLoad.normal / cogLoad.total) * 100) : 0,
                accelerated: cogLoad.total > 0 ? Math.round((cogLoad.accelerated / cogLoad.total) * 100) : 0
            },
            departmentDistributions: deptDistributions.sort((a, b) => b.healthIndex - a.healthIndex),
            topInstitutionalRisks: riskMap
        };

        await cacheManager.set(cacheKey, result, 15);
        return result;
    } catch (error) {
        console.error('[University Summary Service Error]', error);
        throw error;
    }
};
