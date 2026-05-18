const Course = require('../../models/academic/Course');
const facultyInsightService = require('./facultyInsightService');
const Intervention = require('../../models/learning/pathway/Intervention');
const cacheManager = require('../../utils/cacheManager');

/**
 * Department Intelligence Service
 * Aggregates instructional signals for HOD-level governance
 */

exports.getDepartmentOverview = async (departmentId) => {
    try {
        const cacheKey = cacheManager.generateKey('dept_overview', departmentId);
        const cached = await cacheManager.get(cacheKey);
        if (cached) return cached;

        // 1. Fetch all courses belonging to the department
        const courses = await Course.find({ department: departmentId });
        const courseIds = courses.map(c => c._id);

        const departmentMetrics = {
            totalCourses: courses.length,
            courseRankings: [],
            interventionTotals: {
                active: 0,
                critical: 0,
                avgResTime: 0
            },
            remedialDensity: {
                total: 0,
                remedial: 0,
                normal: 0,
                accelerated: 0
            },
            heatmap: []
        };

        const combinedHeatmap = {};

        let totalResTime = 0;

        // 2. Aggregate Course Metrics
        for (const course of courses) {
            const courseInsights = await facultyInsightService.getCourseInsights(course._id);
            const assignmentInsights = await facultyInsightService.getAssignmentInsights(course._id);

            // Calculate Difficulty Index (Avg of assignment scores)
            const avgScore = assignmentInsights.length > 0
                ? (assignmentInsights.reduce((acc, curr) => acc + curr.averageScore, 0) / assignmentInsights.length)
                : 100;

            departmentMetrics.courseRankings.push({
                courseId: course._id,
                title: course.title,
                code: course.code,
                criticalRate: courseInsights.heatmap[0]?.criticalRate || 0,
                struggleRate: courseInsights.heatmap[0]?.struggleRate || 0,
                remedialRate: Math.round((courseInsights.modeDistribution.remedial / (Object.values(courseInsights.modeDistribution).reduce((a, b) => a + b, 0) || 1)) * 100),
                difficultyIndex: Math.round(avgScore)
            });

            // Aggregate Adaptive Modes
            departmentMetrics.remedialDensity.remedial += courseInsights.modeDistribution.remedial;
            departmentMetrics.remedialDensity.normal += courseInsights.modeDistribution.normal;
            departmentMetrics.remedialDensity.accelerated += courseInsights.modeDistribution.accelerated;
            departmentMetrics.remedialDensity.total += (courseInsights.modeDistribution.remedial + courseInsights.modeDistribution.normal + courseInsights.modeDistribution.accelerated);

            // Aggregate Heatmap
            courseInsights.heatmap.forEach(h => {
                if (!combinedHeatmap[h.topic]) {
                    combinedHeatmap[h.topic] = { totalFlagged: 0, criticalCount: 0 };
                }
                combinedHeatmap[h.topic].totalFlagged += h.totalFlagged;
                combinedHeatmap[h.topic].criticalCount += (h.totalFlagged * (h.criticalRate / 100)); // approx
            });
        }

        // Convert aggregated heatmap to array format
        departmentMetrics.heatmap = Object.entries(combinedHeatmap).map(([topic, stats]) => ({
            topic,
            totalFlagged: stats.totalFlagged,
            criticalRate: Math.round((stats.criticalCount / (departmentMetrics.remedialDensity.total || 1)) * 100)
        })).sort((a, b) => b.totalFlagged - a.totalFlagged).slice(0, 5);

        // 3. Intervention Velocity (Dept Wide)
        const interventions = await Intervention.find({
            courseId: { $in: courseIds }
        });

        const active = interventions.filter(i => i.status !== 'Resolved');
        const resolved = interventions.filter(i => i.status === 'Resolved' && i.updatedAt);

        resolved.forEach(i => {
            totalResTime += (i.updatedAt - i.createdAt) / (1000 * 60 * 60 * 24);
        });

        departmentMetrics.interventionTotals.active = active.length;
        departmentMetrics.interventionTotals.critical = active.filter(i => i.triggerTrend === 'Critical').length;
        departmentMetrics.interventionTotals.avgResTime = resolved.length > 0 ? (totalResTime / resolved.length).toFixed(1) : 0;

        // 4. Sort Rankings by highest critical rate
        departmentMetrics.courseRankings.sort((a, b) => b.criticalRate - a.criticalRate);

        await cacheManager.set(cacheKey, departmentMetrics, 15);
        return departmentMetrics;
    } catch (error) {
        console.error('[Department Insight Service Error]', error);
        throw error;
    }
};

exports.getDepartmentCourses = async (departmentId) => {
    const courses = await Course.find({ department: departmentId }).populate('facultyIds', 'name');
    return courses;
};

exports.getDepartmentFacultyPerformance = async (departmentId) => {
    const User = require('../../models/auth/User');
    const Course = require('../../models/academic/Course');
    const Submission = require('../../models/assessment/problems/Submission');

    const faculty = await User.find({ department: departmentId, role: 'faculty' });
    const performance = [];

    for (const member of faculty) {
        const memberCourses = await Course.find({ facultyIds: member._id });
        const courseIds = memberCourses.map(c => c._id);

        const acceptedSubmissions = await Submission.countDocuments({
            course: { $in: courseIds },
            status: 'Accepted'
        });

        const totalStudents = memberCourses.reduce((sum, c) => sum + (c.studentIds?.length || 0), 0);

        performance.push({
            _id: member._id,
            name: member.name,
            courses: memberCourses.length,
            students: totalStudents,
            acceptedSubmissions,
            rating: (4.5 + Math.random() * 0.5).toFixed(1) // Placeholder rating
        });
    }

    return performance.sort((a, b) => b.acceptedSubmissions - a.acceptedSubmissions);
};
