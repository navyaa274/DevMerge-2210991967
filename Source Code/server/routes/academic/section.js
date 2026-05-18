const express = require('express');
const router = express.Router();
const sectionController = require('../../controllers/academic/sectionController');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const validateObjectId = require('../../middleware/validateObjectId');

/**
 * @route   POST /api/sections
 */
router.post(
    '/',
    authenticate,
    authorizeRoles('admin', 'super_admin', 'hod'),
    sectionController.createSection
);

/**
 * @route   GET /api/sections/semester/:semesterId
 */
router.get(
    '/semester/:semesterId',
    authenticate,
    validateObjectId('semesterId'),
    authorizeRoles('admin', 'super_admin', 'hod', 'faculty'),
    sectionController.getSectionsBySemester
);

/**
 * @route   GET /api/sections
 */
router.get(
    '/',
    authenticate,
    authorizeRoles('admin', 'super_admin', 'hod'),
    sectionController.getAllSections
);

/**
 * @route   PUT /api/sections/:id
 */
router.put(
    '/:id',
    authenticate,
    validateObjectId('id'),
    authorizeRoles('admin', 'super_admin', 'hod'),
    sectionController.updateSection
);

/**
 * @route   DELETE /api/sections/:id
 */
router.delete(
    '/:id',
    authenticate,
    validateObjectId('id'),
    authorizeRoles('admin', 'super_admin', 'hod'),
    sectionController.deleteSection
);

/**
 * @route   POST /api/sections/:id/assign-faculty
 */
router.post(
    '/:id/assign-faculty',
    authenticate,
    validateObjectId('id'),
    authorizeRoles('admin', 'super_admin', 'hod'),
    sectionController.assignFaculty
);

/**
 * @route   POST /api/sections/:id/enroll
 */
router.post(
    '/:id/enroll',
    authenticate,
    validateObjectId('id'),
    authorizeRoles('admin', 'super_admin', 'hod'),
    sectionController.enrollStudent
);

/**
 * @route   POST /api/sections/semester/:semesterId/auto-assign
 */
router.post(
    '/semester/:semesterId/auto-assign',
    authenticate,
    validateObjectId('semesterId'),
    authorizeRoles('admin', 'super_admin', 'hod'),
    sectionController.autoAssignStudents
);

module.exports = router;
