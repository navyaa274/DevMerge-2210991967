const StudentWeakness = require('../../models/analytics/StudentWeakness');
const StudentLearningState = require('../../models/learning/pathway/StudentLearningState');
const Intervention = require('../../models/learning/pathway/Intervention');
const Course = require('../../models/academic/Course');
const User = require('../../models/auth/User');

/**
 * Cross-Course Cognitive Load Analyzer
 * Identifies systemic student struggle across multi-course boundaries
 */

exports.getHighRiskCognitiveLoad = async (departmentId) => {
    try {
        // 1. Fetch Students in Department
        // Assuming students have departmentId or we fetch from department courses
        const courses = await Course.find({ department: departmentId });
        const courseIds = courses.map(c => c._id);

        // Fetch all unique students enrolled in these courses
        const enrollments = await StudentLearningState.find({ course: { $in: courseIds } });
        const studentIds = [...new Set(enrollments.map(e => e.student.toString()))];

        const riskRegistry = [];

        // 2. Evaluate Each Student
        for (const studentId of studentIds) {
            // A. Trends - Count critical/declining topics across all courses
            const weaknessProfiles = await StudentWeakness.find({ student: studentId, course: { $in: courseIds } });
            let criticalTopicsCount = 0;
            let decliningTopicsCount = 0;
            const strugglingCourses = new Set();

            weaknessProfiles.forEach(profile => {
                profile.weakTopics.forEach(wt => {
                    if (wt.improvementTrend === 'Critical') {
                        criticalTopicsCount++;
                        strugglingCourses.add(profile.course.toString());
                    } else if (wt.improvementTrend === 'Declining') {
                        decliningTopicsCount++;
                        strugglingCourses.add(profile.course.toString());
                    }
                });
            });

            // B. Adaptive Modes - How many courses are in remedial mode?
            const learningStates = await StudentLearningState.find({ student: studentId, course: { $in: courseIds } });
            const remedialCourses = learningStates.filter(s => s.adaptationMode === 'remedial');

            // C. Interventions - Active count across courses
            const activeInterventions = await Intervention.find({
                studentId,
                courseId: { $in: courseIds },
                status: { $ne: 'Resolved' }
            });

            // 3. Risk Scoring Logic (Deterministic)
            // Weighting: 
            // - Each Remedial course: 3 points
            // - Each Critical topic: 2 points
            // - Each Active Intervention: 2 points
            // - Each Declining topic: 1 point

            const riskScore = (remedialCourses.length * 3) +
                (criticalTopicsCount * 2) +
                (activeInterventions.length * 2) +
                (decliningTopicsCount * 1);

            // Only report if systemic struggle detected (Score > 5)
            if (riskScore > 5 || strugglingCourses.size >= 2) {
                const student = await User.findById(studentId).select('name role email');
                if (student) {
                    riskRegistry.push({
                        student: {
                            id: studentId,
                            name: student.name,
                            email: student.email
                        },
                        riskScore,
                        metricBreakdown: {
                            remedialCourseCount: remedialCourses.length,
                            criticalTopicsCount,
                            activeInterventionCount: activeInterventions.length,
                            strugglingCoursesCount: strugglingCourses.size
                        },
                        severity: riskScore > 15 ? 'Critical' : (riskScore > 8 ? 'High' : 'Moderate')
                    });
                }
            }
        }

        return riskRegistry.sort((a, b) => b.riskScore - a.riskScore);
    } catch (error) {
        console.error('[Cognitive Load Analyzer Error]', error);
        throw error;
    }
};
