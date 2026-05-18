const express = require('express');
const router = express.Router();
const enrollmentController = require('../../controllers/academic/enrollmentController');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const validateObjectId = require('../../middleware/validateObjectId');
const validateRequest = require('../../middleware/validateRequest');
const { enrollmentSchema } = require('../../validators/enrollmentValidator');

/**
 * @route   POST /api/enrollments
 */
router.post(
    '/',
    authenticate,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(enrollmentSchema),
    enrollmentController.createEnrollment
);

/**
 * @route   GET /api/enrollments/section/:sectionId
 */
router.get(
    '/section/:sectionId',
    authenticate,
    validateObjectId('sectionId'),
    authorizeRoles('admin', 'super_admin', 'hod', 'faculty'),
    enrollmentController.getEnrollmentsBySection
);

/**
 * @route   GET /api/enrollments/student/:studentId
 */
router.get(
    '/student/:studentId',
    authenticate,
    validateObjectId('studentId'),
    authorizeRoles('admin', 'super_admin', 'hod', 'student'),
    enrollmentController.getStudentEnrollments
);

module.exports = router;
