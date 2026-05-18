const CourseOutcome = require('../../models/academic/CourseOutcome');
const ProgramOutcome = require('../../models/academic/ProgramOutcome');
const Assignment = require('../../models/assessment/assignments/Assignment');
const AssignmentSubmission = require('../../models/assessment/assignments/AssignmentSubmission');

/**
 * CO-PO Attainment Engine
 * Deterministic calculation of curriculum outcomes achievement
 */

exports.calculateCourseAttainment = async (courseId) => {
    try {
        // 1. Fetch COs and Assignments
        const courseOutcomes = await CourseOutcome.find({ course: courseId });
        const assignments = await Assignment.find({ course: courseId });

        const results = [];

        for (const co of courseOutcomes) {
            let totalExpectedMarks = 0;
            let totalActualMarks = 0;
            let submissionCount = 0;

            // Find assignments/questions mapped to this CO
            for (const assignment of assignments) {
                const submissions = await AssignmentSubmission.find({
                    assignment: assignment._id,
                    grade: { $ne: null }
                });

                // Option A: Specific Question Mapping
                const coQuestionMarks = assignment.questions
                    .filter(q => q.coMapping.includes(co.code))
                    .reduce((sum, q) => sum + q.marks, 0);

                if (coQuestionMarks > 0) {
                    totalExpectedMarks += coQuestionMarks * submissions.length;
                    submissions.forEach(sub => {
                        // Weighted grade for the CO part
                        // (Usually requires per-question scoring, but if we only have total grade, we prorate)
                        totalActualMarks += (sub.grade * (coQuestionMarks / assignment.totalMarks));
                    });
                    submissionCount += submissions.length;
                }

                // Option B: Assignment Level Mapping (Fallback)
                const coMapping = assignment.coMappings.find(m => m.coCode === co.code);
                if (coMapping && coQuestionMarks === 0) {
                    const weight = coMapping.weightage || 1; // Assuming weight is factor of total
                    totalExpectedMarks += assignment.totalMarks * weight * submissions.length;
                    submissions.forEach(sub => {
                        totalActualMarks += sub.grade * weight;
                    });
                    submissionCount += submissions.length;
                }
            }

            const attainment = totalExpectedMarks > 0
                ? (totalActualMarks / totalExpectedMarks) * 100
                : 0;

            results.push({
                coId: co._id,
                code: co.code,
                description: co.description,
                attainment: parseFloat(attainment.toFixed(2)),
                submissionCount,
                programOutcomes: co.programOutcomes // Correlation data
            });
        }

        // 2. Aggregate to PO Level
        const poAttainment = await this.aggregateToProgramOutcomes(results);

        return {
            courseId,
            courseOutcomes: results,
            programOutcomes: poAttainment
        };
    } catch (error) {
        console.error('[Attainment Service Error]', error);
        throw error;
    }
};

exports.aggregateToProgramOutcomes = async (coResults) => {
    const poStats = {}; // { PO1: { sumWeightedAttainment: 0, sumCorrelation: 0 } }

    const correlationWeights = {
        'Low': 1,
        'Medium': 2,
        'High': 3
    };

    coResults.forEach(co => {
        co.programOutcomes.forEach(poMap => {
            if (!poStats[poMap.code]) {
                poStats[poMap.code] = { sumWeightedAttainment: 0, sumCorrelation: 0 };
            }
            const weight = correlationWeights[poMap.correlation] || 2;
            poStats[poMap.code].sumWeightedAttainment += (co.attainment * weight);
            poStats[poMap.code].sumCorrelation += weight;
        });
    });

    return Object.entries(poStats).map(([code, stats]) => ({
        code,
        attainment: stats.sumCorrelation > 0
            ? parseFloat((stats.sumWeightedAttainment / stats.sumCorrelation).toFixed(2))
            : 0
    }));
};

exports.getDepartmentAccreditation = async (departmentId) => {
    const Department = require('../../models/academic/Department');
    const Program = require('../../models/academic/Program');
    const Course = require('../../models/academic/Course');
    const ProgramOutcome = require('../../models/academic/ProgramOutcome');

    const courses = await Course.find({ department: departmentId });
    const courseIds = courses.map(c => c._id);

    // Aggregate PO achievements across all courses in department
    const aggregatedOutcomes = {}; // { PO1: [vals] }

    for (const id of courseIds) {
        const stats = await this.calculateCourseAttainment(id);
        stats.programOutcomes.forEach(po => {
            if (!aggregatedOutcomes[po.code]) aggregatedOutcomes[po.code] = [];
            aggregatedOutcomes[po.code].push(po.attainment);
        });
    }

    const outcomeAchievement = Object.entries(aggregatedOutcomes).map(([code, vals]) => ({
        outcomeCode: code,
        attainment: parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1))
    }));

    const avgCompliance = outcomeAchievement.length > 0
        ? (outcomeAchievement.reduce((a, b) => a + b.attainment, 0) / outcomeAchievement.length).toFixed(1)
        : 0;

    return {
        summary: {
            averageComplianceScore: avgCompliance,
            totalCoursesAudited: courses.length,
            attainmentStatus: avgCompliance > 70 ? 'Satisfactory' : 'Needs Optimization'
        },
        outcomeAchievement
    };
};
