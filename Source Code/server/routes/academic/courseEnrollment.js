const express = require('express');
const router = express.Router();
const courseEnrollmentController = require('../../controllers/academic/courseEnrollmentController');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const validateObjectId = require('../../middleware/validateObjectId');
const validateRequest = require('../../middleware/validateRequest');
const { courseEnrollmentSchema } = require('../../validators/courseEnrollmentValidator');

/**
 * @route   POST /api/course-enrollments
 */
router.post(
    '/',
    authenticate,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(courseEnrollmentSchema),
    courseEnrollmentController.enrollInCourse
);

/**
 * @route   GET /api/course-enrollments/course/:courseId
 */
router.get(
    '/course/:courseId',
    authenticate,
    validateObjectId('courseId'),
    authorizeRoles('admin', 'super_admin', 'hod', 'faculty'),
    courseEnrollmentController.getCourseStudents
);

/**
 * @route   GET /api/course-enrollments/student/:studentId
 */
router.get(
    '/student/:studentId',
    authenticate,
    validateObjectId('studentId'),
    authorizeRoles('admin', 'super_admin', 'hod', 'student'),
    courseEnrollmentController.getStudentCourses
);

module.exports = router;
