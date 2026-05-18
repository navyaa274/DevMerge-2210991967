const Course = require('../../models/academic/Course');
const facultyInsightService = require('./facultyInsightService');
const Program = require('../../models/academic/Program');

/**
 * Program Insight Intelligence Service
 * Aggregates instructional signals at the degree/program level
 */

exports.getProgramOverview = async (programId) => {
    try {
        const program = await Program.findById(programId);
        if (!program) throw new Error('Program not found');

        const courses = await Course.find({ programId });

        const semesterAggregates = {};

        // Initialize semester buckets based on program duration
        for (let i = 1; i <= program.totalSemesters; i++) {
            semesterAggregates[i] = {
                courseCount: 0,
                totalStudents: 0,
                avgCriticalRate: 0,
                avgStruggleRate: 0,
                remedialCluster: 0,
                courses: []
            };
        }

        for (const course of courses) {
            const courseInsights = await facultyInsightService.getCourseInsights(course._id);
            const sem = course.semesterNumber;

            if (semesterAggregates[sem]) {
                semesterAggregates[sem].courseCount++;
                const stats = courseInsights.heatmap[0] || { criticalRate: 0, struggleRate: 0 };

                semesterAggregates[sem].avgCriticalRate += stats.criticalRate;
                semesterAggregates[sem].avgStruggleRate += stats.struggleRate;
                semesterAggregates[sem].remedialCluster += courseInsights.modeDistribution.remedial;

                semesterAggregates[sem].courses.push({
                    courseId: course._id,
                    title: course.title,
                    code: course.code,
                    criticalRate: stats.criticalRate
                });
            }
        }

        // Finalize averages
        const finalComparison = Object.entries(semesterAggregates).map(([sem, data]) => ({
            semester: parseInt(sem),
            courseCount: data.courseCount,
            criticalRate: data.courseCount > 0 ? Math.round(data.avgCriticalRate / data.courseCount) : 0,
            struggleRate: data.courseCount > 0 ? Math.round(data.avgStruggleRate / data.courseCount) : 0,
            remedialCluster: data.remedialCluster,
            riskLevel: (data.avgCriticalRate / (data.courseCount || 1)) > 15 ? 'High' : (data.avgCriticalRate / (data.courseCount || 1)) > 5 ? 'Medium' : 'Low'
        }));

        return {
            programName: program.name,
            programCode: program.code,
            totalSemesters: program.totalSemesters,
            semesterComparison: finalComparison
        };
    } catch (error) {
        console.error('[Program Insight Service Error]', error);
        throw error;
    }
};

exports.getProgramYearlyCluster = async (programId) => {
    try {
        const overview = await this.getProgramOverview(programId);

        // Group semesters into years (S1-2 = Y1, S3-4 = Y2, etc.)
        const yearStats = {};
        overview.semesterComparison.forEach(semData => {
            const year = Math.ceil(semData.semester / 2);
            if (!yearStats[year]) {
                yearStats[year] = { criticalRateSum: 0, count: 0, remedialSum: 0 };
            }
            yearStats[year].criticalRateSum += semData.criticalRate;
            yearStats[year].remedialSum += semData.remedialCluster;
            yearStats[year].count++;
        });

        return Object.entries(yearStats).map(([year, stats]) => ({
            year: parseInt(year),
            avgCriticalRate: Math.round(stats.criticalRateSum / stats.count),
            remedialDensity: stats.remedialSum
        }));
    } catch (error) {
        console.error('[Program Yearly Cluster Error]', error);
        throw error;
    }
};
