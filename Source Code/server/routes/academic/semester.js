const express = require('express');
const router = express.Router();
const semesterController = require('../../controllers/academic/semesterController');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const validateObjectId = require('../../middleware/validateObjectId');
const validateRequest = require('../../middleware/validateRequest');
const { semesterSchema } = require('../../validators/semesterValidator');

/**
 * @route   POST /api/semesters
 */
router.post(
    '/',
    authenticate,
    authorizeRoles('admin', 'super_admin'),
    validateRequest(semesterSchema),
    semesterController.createSemester
);

/**
 * @route   GET /api/semesters/program/:programId
 */
router.get(
    '/program/:programId',
    authenticate,
    validateObjectId('programId'),
    authorizeRoles('admin', 'super_admin', 'hod', 'faculty'),
    semesterController.getSemestersByProgram
);

/**
 * @route   GET /api/semesters/current
 */
router.get(
    '/current',
    authenticate,
    authorizeRoles('admin', 'super_admin', 'hod', 'faculty'),
    semesterController.getCurrentSemesters
);

module.exports = router;
