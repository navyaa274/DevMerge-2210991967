const Course = require('../../models/academic/Course');
const CourseOutcome = require('../../models/academic/CourseOutcome');
const attainmentService = require('./attainmentService');
const Program = require('../../models/academic/Program');

/**
 * Accreditation Data Generator Service
 * Formats academic attainment for audit/compliance (NBA/NAAC)
 */

exports.getProgramAccreditationReport = async (programId) => {
    try {
        const program = await Program.findById(programId);
        if (!program) throw new Error('Program not found');

        const courses = await Course.find({ programId });

        const report = {
            programInfo: {
                name: program.name,
                code: program.code,
                duration: program.durationYears
            },
            courseAttainmentMatrix: [],
            programOverallAttainment: {},
            gapAnalysis: []
        };

        const allPOAttainments = {}; // Grouped by PO code

        for (const course of courses) {
            const attainment = await attainmentService.calculateCourseAttainment(course._id);

            // 1. Map Course to PO Matrix
            const courseRow = {
                courseCode: course.code,
                courseTitle: course.title,
                semester: course.semesterNumber,
                poAttainments: attainment.programOutcomes
            };
            report.courseAttainmentMatrix.push(courseRow);

            // 2. Aggregate for overall program level
            attainment.programOutcomes.forEach(po => {
                if (!allPOAttainments[po.code]) allPOAttainments[po.code] = [];
                allPOAttainments[po.code].push(po.attainment);
            });
        }

        // 3. Final Program Attainment
        report.programOverallAttainment = Object.entries(allPOAttainments).map(([code, values]) => ({
            code,
            averageAttainment: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
            courseCount: values.length
        }));

        // 4. Gap Analysis (Simple threshold-based)
        const THRESHOLD = 70; // 70% achievement target
        report.gapAnalysis = report.programOverallAttainment
            .filter(po => po.averageAttainment < THRESHOLD)
            .map(po => ({
                poCode: po.code,
                gap: parseFloat((THRESHOLD - po.averageAttainment).toFixed(2)),
                status: 'Underperforming',
                impact: 'Critical'
            }));

        return report;
    } catch (error) {
        console.error('[Accreditation Service Error]', error);
        throw error;
    }
};

exports.getCourseOutcomeAudit = async (courseId) => {
    try {
        const outcomes = await CourseOutcome.find({ course: courseId });
        const attainment = await attainmentService.calculateCourseAttainment(courseId);

        return {
            courseId,
            outcomes: outcomes.map(o => {
                const attData = attainment.courseOutcomes.find(a => a.code === o.code);
                return {
                    code: o.code,
                    description: o.description,
                    bloomsLevel: o.bloomsLevel,
                    attainment: attData ? attData.attainment : 0,
                    status: (attData?.attainment || 0) >= 70 ? 'Attained' : 'Not Attained'
                };
            })
        };
    } catch (error) {
        console.error('[Course Audit Error]', error);
        throw error;
    }
};
