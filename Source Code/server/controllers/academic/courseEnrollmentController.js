const CourseEnrollment = require('../../models/learning/enrollments/CourseEnrollment');

/**
 * Enroll Student into Course
 */
exports.enrollInCourse = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;

        const existing = await CourseEnrollment.findOne({ studentId, courseId });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Student is already enrolled in this course"
            });
        }

        const enrollment = await CourseEnrollment.create(req.body);

        res.status(201).json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Students Enrolled in a Course
 */
exports.getCourseStudents = async (req, res) => {
    try {
        const enrollments = await CourseEnrollment.find({ courseId: req.params.courseId })
            .populate('studentId', 'firstName lastName email');

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments.map(e => ({
                ...e.toObject(),
                studentName: e.studentId
                    ? `${e.studentId.firstName || ''} ${e.studentId.lastName || ''}`.trim()
                    : null
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Enrolled Courses for a Student
 */
exports.getStudentCourses = async (req, res) => {
    try {
        const enrollments = await CourseEnrollment.find({ studentId: req.params.studentId })
            .populate('courseId', 'title code credits');

        res.status(200).json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
