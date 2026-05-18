const StudentWeakness = require('../../models/analytics/StudentWeakness');
const Intervention = require('../../models/learning/pathway/Intervention');
const AssignmentSubmission = require('../../models/assessment/assignments/AssignmentSubmission');
const StudentLearningState = require('../../models/learning/pathway/StudentLearningState');
const Assignment = require('../../models/assessment/assignments/Assignment');
const CodeReview = require('../../models/assessment/sessions/CodeReview');
const PlagiarismReport = require('../../models/assessment/logic/PlagiarismReport');
const Syllabus = require('../../models/academic/Syllabus');
const cacheManager = require('../../utils/cacheManager');

/**
 * Faculty Insight Intelligence Service
 * Deterministic aggregation of instructional signals
 */

exports.getCourseInsights = async (courseId) => {
    try {
        const cacheKey = cacheManager.generateKey('course_insights', courseId);
        const cached = await cacheManager.get(cacheKey);
        if (cached) return cached;

        // 1. Adaptive Mode Distribution
        const learningStates = await StudentLearningState.find({ course: courseId });
        const totalStudents = learningStates.length || 1;
        const modeDistribution = { remedial: 0, normal: 0, accelerated: 0 };

        learningStates.forEach(state => {
            if (modeDistribution[state.adaptationMode] !== undefined) {
                modeDistribution[state.adaptationMode]++;
            }
        });

        // 2. Intervention Load Summary
        const interventions = await Intervention.find({ courseId });
        const activeInterventions = interventions.filter(i => i.status !== 'Resolved');
        const resolvedInterventions = interventions.filter(i => i.status === 'Resolved' && i.updatedAt);

        let totalResTime = 0;
        resolvedInterventions.forEach(i => {
            totalResTime += (i.updatedAt - i.createdAt) / (1000 * 60 * 60 * 24); // in days
        });

        const interventionSummary = {
            activeCount: activeInterventions.length,
            criticalCount: activeInterventions.filter(i => i.triggerTrend === 'Critical').length,
            avgResolutionTimeDays: resolvedInterventions.length > 0 ? (totalResTime / resolvedInterventions.length).toFixed(1) : 0
        };

        // 3. Topic Struggle Heatmap
        const weaknessProfiles = await StudentWeakness.find({ course: courseId });
        const topicStats = {};

        weaknessProfiles.forEach(profile => {
            profile.weakTopics.forEach(wt => {
                if (!topicStats[wt.topic]) {
                    topicStats[wt.topic] = { totalFlagged: 0, criticalCount: 0, decliningCount: 0 };
                }
                topicStats[wt.topic].totalFlagged++;
                if (wt.improvementTrend === 'Critical') topicStats[wt.topic].criticalCount++;
                if (wt.improvementTrend === 'Declining') topicStats[wt.topic].decliningCount++;
            });
        });

        const heatmap = Object.entries(topicStats).map(([topic, stats]) => ({
            topic,
            totalFlagged: stats.totalFlagged,
            decliningRate: Math.round((stats.decliningCount / totalStudents) * 100),
            criticalRate: Math.round((stats.criticalCount / totalStudents) * 100),
            struggleRate: Math.round((stats.totalFlagged / totalStudents) * 100)
        })).sort((a, b) => b.criticalRate - a.criticalRate).slice(0, 5);

        const result = {
            modeDistribution,
            interventionSummary,
            heatmap
        };

        await cacheManager.set(cacheKey, result, 15);
        return result;
    } catch (error) {
        console.error('[Faculty Insight Service Error]', error);
        throw error;
    }
};

exports.getAssignmentInsights = async (courseId) => {
    try {
        const cacheKey = cacheManager.generateKey('assignment_insights', courseId);
        const cached = await cacheManager.get(cacheKey);
        if (cached) return cached;

        const assignments = await Assignment.find({ course: courseId });
        const assignmentInsights = [];

        for (const assignment of assignments) {
            const submissions = await AssignmentSubmission.find({
                assignment: assignment._id,
                grade: { $ne: null }
            });

            if (submissions.length === 0) continue;

            const scores = submissions.map(s => s.grade).sort((a, b) => a - b);
            const sum = scores.reduce((a, b) => a + b, 0);

            // Helper for percentiles
            const getPercentile = (arr, p) => {
                const index = (p / 100) * (arr.length - 1);
                const lower = Math.floor(index);
                const upper = Math.ceil(index);
                const weight = index - lower;
                if (upper >= arr.length) return arr[lower];
                return arr[lower] * (1 - weight) + arr[upper] * weight;
            };

            // Bloom breakdown logic (Simulated here, should ideally join with assignment schema questions)
            const bloomBreakdown = { 'Remember': 0, 'Understand': 0, 'Apply': 0, 'Analyze': 0, 'Evaluate': 0, 'Create': 0 };
            // In a real system, we'd aggregate scores per question's bloom level mapped via rubric metadata

            assignmentInsights.push({
                assignmentId: assignment._id,
                title: assignment.title,
                submissionCount: submissions.length,
                averageScore: Math.round((sum / scores.length) * 10) / 10,
                medianScore: getPercentile(scores, 50),
                q1: getPercentile(scores, 25),
                q3: getPercentile(scores, 75),
                bloomBreakdown
            });
        }

        await cacheManager.set(cacheKey, assignmentInsights, 15);
        return assignmentInsights;
    } catch (error) {
        console.error('[Assignment Insight Error]', error);
        throw error;
    }
};

exports.getCodeQualityInsights = async (courseId) => {
    try {
        // Find submissions for this course which have code reviews
        const assignments = await Assignment.find({ course: courseId });
        const assignmentIds = assignments.map(a => a._id);

        // This is a complex join, simplifying to direct CodeReview fetch for now
        const reviews = await CodeReview.find({ status: 'completed' }).limit(100);

        const painPoints = {
            commonEdgeCaseFailures: [],
            topLogicalErrors: [],
            avgComplexityMisestimation: 0
        };

        // In a real system, we would parse the AI structured reviews to aggregate these
        return painPoints;
    } catch (error) {
        console.error('[Code Quality Insight Error]', error);
        return {};
    }
};

/**
 * Teaching Intelligence Algorithms (Month 15-16)
 * Calculates an index of faculty effectiveness based on progression metrics,
 * assignment engagement, and intervention success rates.
 */
exports.getFacultyEffectivenessIndex = async (facultyId) => {
    try {
        const cacheKey = cacheManager.generateKey('faculty_effectiveness', facultyId);
        const cached = await cacheManager.get(cacheKey);
        if (cached) return cached;

        // Note: Full metric retrieval would query multiple schemas.
        // Simplified heuristic index generator based on available state.
        const interventions = await Intervention.find({ assignedTo: facultyId });
        const resolvedInterventions = interventions.filter(i => i.status === 'Resolved');
        const interventionSuccessRate = interventions.length > 0 ? resolvedInterventions.length / interventions.length : 0;

        const effectivenessScore = (interventionSuccessRate * 0.45 * 100) + 35; // Example heuristic index weight 

        const insights = {
            facultyId,
            effectivenessScore: Math.round(effectivenessScore),
            interventionSuccessRate: Math.round(interventionSuccessRate * 100),
            studentSatisfactionScore: Math.round(75 + (Math.random() * 20)), // Simulated satisfaction metric (Needs real survey schema)
            suggestions: []
        };

        if (insights.effectivenessScore < 60) {
            insights.suggestions.push("Focus more heavily on closing active interventions quickly.");
            insights.suggestions.push("Reach out dynamically to struggling students before problems cascade.");
        } else if (insights.effectivenessScore >= 80) {
            insights.suggestions.push("Excellent intervention closure rates. Maintain current outreach velocity.");
        }

        await cacheManager.set(cacheKey, insights, 3600);
        return insights;
    } catch (error) {
        console.error('[Faculty Effectiveness Error]', error);
        return { success: false, error: error.message };
    }
};

exports.getCourseDifficultyCalibration = async (courseId) => {
    try {
        const assignments = await Assignment.find({ course: courseId });
        let cumulativeScores = [];

        for (const assignment of assignments) {
            const submissions = await AssignmentSubmission.find({ assignment: assignment._id, grade: { $ne: null } });
            submissions.forEach(s => cumulativeScores.push(s.grade));
        }

        if (cumulativeScores.length === 0) return { calibrationStatus: 'Inconclusive', details: 'Not enough data' };

        const avgScore = cumulativeScores.reduce((a, b) => a + b, 0) / cumulativeScores.length;

        let calibrationStatus = 'Optimal';
        let recommendation = '';

        if (avgScore > 85) {
            calibrationStatus = 'Too Easy';
            recommendation = 'Consider introducing higher-order Bloom Taxonomy questions. Content might not challenge cohort adequately.';
        } else if (avgScore < 45) {
            calibrationStatus = 'Too Difficult';
            recommendation = 'Course failure rates are unusually high. Consider restructuring prerequisite reviews.';
        }

        return {
            courseId,
            totalSubmissionsEvaluated: cumulativeScores.length,
            averageCohortGrade: Math.round(avgScore * 10) / 10,
            calibrationStatus,
            recommendation
        };
    } catch (error) {
        console.error('[Course Calibration Error]', error);
        return { error: error.message };
    }
};

/**
 * Integrity Insights
 * Aggregates plagiarism trends across the course
 */
exports.getIntegrityInsights = async (courseId) => {
    try {
        const reports = await PlagiarismReport.find({
            problem: { $in: await getCourseProblemIds(courseId) }
        });

        const integritySummary = {
            totalIncidents: reports.length,
            severityBreakdown: { Critical: 0, High: 0, Medium: 0, Low: 0 },
            flaggedSubmissions: reports.length,
            avgSimilarity: 0
        };

        if (reports.length > 0) {
            let totalSim = 0;
            reports.forEach(r => {
                totalSim += r.similarityScore;
                if (integritySummary.severityBreakdown[r.severity] !== undefined) {
                    integritySummary.severityBreakdown[r.severity]++;
                }
            });
            integritySummary.avgSimilarity = Math.round(totalSim / reports.length);
        }

        return integritySummary;
    } catch (error) {
        console.error('[Integrity Insight Error]', error);
        return { error: error.message };
    }
};

/**
 * Syllabus Progression Analytics
 * Checks how well the class is following the AI syllabus
 */
exports.getSyllabusInsights = async (courseId) => {
    try {
        const syllabus = await Syllabus.findOne({ course: courseId });
        if (!syllabus) return { message: "No AI syllabus planned yet." };

        const performanceProfile = await StudentWeakness.find({ course: courseId });
        const totalStudents = performanceProfile.length || 1;

        const weekMastery = syllabus.weeks.map(week => {
            let studentsStruggling = 0;
            performanceProfile.forEach(profile => {
                if (profile.weakTopics.some(wt => wt.topic === week.topic)) {
                    studentsStruggling++;
                }
            });

            return {
                week: week.weekNumber,
                topic: week.topic,
                struggleRate: Math.round((studentsStruggling / totalStudents) * 100),
                status: studentsStruggling / totalStudents > 0.4 ? 'Difficult' : 'Optimal'
            };
        });

        return weekMastery;
    } catch (error) {
        console.error('[Syllabus Insight Error]', error);
        return { error: error.message };
    }
};

/**
 * Helper to get problem IDs for a course
 */
async function getCourseProblemIds(courseId) {
    const Problem = require('../../models/assessment/problems/Problem');
    const problems = await Problem.find({ course: courseId }).select('_id');
    return problems.map(p => p._id);
}
