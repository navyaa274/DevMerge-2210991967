const Course = require('../../models/academic/Course');
const Syllabus = require('../../models/academic/Syllabus');
const attainmentService = require('../analytics/attainmentService');
const facultyInsightService = require('../analytics/facultyInsightService');
const facultyWorkloadService = require('./facultyWorkloadService');

/**
 * Curriculum Optimization Suggester
 * Provides data-driven structural recommendations for syllabus refinement
 */

exports.getOptimizationSuggestions = async (courseId) => {
    try {
        const course = await Course.findById(courseId);
        if (!course) throw new Error('Course not found');

        // 1. Fetch Key Signals
        const attainment = await attainmentService.calculateCourseAttainment(courseId);
        const insights = await facultyInsightService.getCourseInsights(courseId);
        const assignments = await facultyInsightService.getAssignmentInsights(courseId);

        const suggestions = [];

        // 2. Identify Performance Gaps (Attainment < 60%)
        attainment.courseOutcomes.forEach(co => {
            if (co.attainment < 60) {
                suggestions.push({
                    type: 'ATTAINMENT_GAP',
                    target: co.code,
                    priority: co.attainment < 40 ? 'CRITICAL' : 'HIGH',
                    observation: `Attainment for ${co.code} is currently at ${co.attainment}%.`,
                    recommendation: `Increase formative assessment density for topics mapped to ${co.code} and review Bloom's level alignment.`
                });
            }
        });

        // 3. Identify Instructional Bottlenecks (Heatmap Risks)
        insights.heatmap.forEach(topicRisk => {
            if (topicRisk.criticalRate > 20) {
                suggestions.push({
                    type: 'INSTRUCTIONAL_BOTTLENECK',
                    target: topicRisk.topic,
                    priority: 'CRITICAL',
                    observation: `${topicRisk.topic} has a 20%+ critical failure rate across the class.`,
                    recommendation: `Inject remedial practice modules and consider de-weighting this concept in high-stakes exams until mastery improves.`
                });
            }
        });

        // 4. Identify Pacing Risks (High Remedial Density)
        const totalStudents = Object.values(insights.modeDistribution).reduce((a, b) => a + b, 0);
        const remedialDensity = (insights.modeDistribution.remedial / (totalStudents || 1)) * 100;

        if (remedialDensity > 30) {
            suggestions.push({
                type: 'PACING_ALERT',
                target: 'Course Syllabus',
                priority: 'HIGH',
                observation: `${Math.round(remedialDensity)}% of the class is in remedial mode. Current pacing may be too aggressive.`,
                recommendation: `Extend the duration of current unit or introduce a revision week before proceeding to advanced modules.`
            });
        }

        // 5. Workload Correlation
        // (Optional: identify cases where low attainment correlates with high faculty grading load)

        return {
            courseId,
            courseTitle: course.title,
            overallPedagogicalHealth: remedialDensity < 15 ? 'POOR' : (remedialDensity < 10 ? 'HEALTHY' : 'STRESSED'),
            suggestions: suggestions.sort((a, b) => {
                const priorityMap = { 'CRITICAL': 0, 'HIGH': 1, 'NORMAL': 2 };
                return priorityMap[a.priority] - priorityMap[b.priority];
            })
        };
    } catch (error) {
        console.error('[Curriculum Optimization Error]', error);
        throw error;
    }
};
