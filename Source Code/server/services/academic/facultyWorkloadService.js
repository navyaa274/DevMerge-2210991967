const Course = require('../../models/academic/Course');
const Assignment = require('../../models/assessment/assignments/Assignment');
const AssignmentSubmission = require('../../models/assessment/assignments/AssignmentSubmission');
const Intervention = require('../../models/learning/pathway/Intervention');
const CopilotUsageLog = require('../../models/analytics/CopilotUsageLog');
const User = require('../../models/auth/User');

/**
 * Faculty Workload Analytics Service
 * Evaluates instructional density and operational load
 */

exports.getFacultyWorkload = async (facultyId) => {
    try {
        // 1. Fetch Assigned Courses
        const courses = await Course.find({ facultyIds: facultyId });
        const courseIds = courses.map(c => c._id);

        // 2. Instructional Density
        let totalStudents = 0;
        let totalCredits = 0;
        courses.forEach(c => {
            totalStudents += c.students.length;
            totalCredits += c.credits;
        });

        // 3. Evaluation Load (Last 30 Days)
        const assignments = await Assignment.find({
            course: { $in: courseIds },
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const assignmentIds = assignments.map(a => a._id);
        const gradedSubmissions = await AssignmentSubmission.find({
            assignment: { $in: assignmentIds },
            grade: { $ne: null }
        });

        // 4. AI Adoption Velocity
        const copilotActions = await CopilotUsageLog.countDocuments({
            faculty: facultyId,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        // 5. Intervention Responsibility
        const activeInterventions = await Intervention.countDocuments({
            courseId: { $in: courseIds },
            status: { $ne: 'Resolved' }
        });

        return {
            facultyId,
            instructionalDensity: {
                activeCourseCount: courses.length,
                totalStudentCoverage: totalStudents,
                totalCreditsManaged: totalCredits
            },
            evaluationLoad30Days: {
                assignmentsCreated: assignments.length,
                submissionsGraded: gradedSubmissions.length
            },
            operationalLoad: {
                activeInterventionCount: activeInterventions,
                copilotUsageCount: copilotActions
            },
            loadIntensityScore: calculateLoadIntensity(courses.length, totalStudents, gradedSubmissions.length)
        };
    } catch (error) {
        console.error('[Faculty Workload Error]', error);
        throw error;
    }
};

exports.getDepartmentWorkloadDistribution = async (departmentId) => {
    try {
        const facultyMembers = await User.find({ department: departmentId, role: 'faculty' });
        const distribution = [];

        for (const faculty of facultyMembers) {
            const workload = await this.getFacultyWorkload(faculty._id);
            distribution.push({
                facultyName: faculty.name,
                facultyId: faculty._id,
                ...workload
            });
        }

        return distribution.sort((a, b) => b.loadIntensityScore - a.loadIntensityScore);
    } catch (error) {
        console.error('[Dept Workload Distribution Error]', error);
        throw error;
    }
};

/**
 * Deterministic Load Intensity Score (1-10)
 * Weighted: Courses (30%), Students (40%), Grading Volume (30%)
 */
function calculateLoadIntensity(courseCount, studentCount, gradingCount) {
    // Normalization factors
    const normCourses = Math.min(courseCount / 5, 1); // 5 courses is "max"
    const normStudents = Math.min(studentCount / 300, 1); // 300 students is "max"
    const normGrading = Math.min(gradingCount / 100, 1); // 100 graded per month is "max"

    const score = (normCourses * 3) + (normStudents * 4) + (normGrading * 3);
    return parseFloat(score.toFixed(1));
}
