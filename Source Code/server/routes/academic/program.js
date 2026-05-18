const express = require('express');
const router = express.Router();
const programController = require('../../controllers/academic/programController');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const departmentGuard = require('../../middleware/departmentGuard');
const validateObjectId = require('../../middleware/validateObjectId');
const validateRequest = require('../../middleware/validateRequest');
const { createProgramSchema, updateProgramSchema } = require('../../validators/programValidator');

/**
 * @route   POST /api/programs
 */
router.post(
    '/',
    authenticate,
    authorizeRoles('admin', 'super_admin', 'hod'),
    validateRequest(createProgramSchema),
    programController.createProgram
);

/**
 * @route   GET /api/programs
 */
router.get(
    '/',
    authenticate,
    authorizeRoles('admin', 'super_admin', 'hod'),
    programController.getAllPrograms
);

/**
 * @route   GET /api/programs/department/:departmentId
 */
router.get(
    '/department/:departmentId',
    authenticate,
    validateObjectId('departmentId'),
    authorizeRoles('admin', 'super_admin', 'hod', 'faculty'),
    departmentGuard((req) => req.params.departmentId),
    programController.getProgramsByDepartment
);

/**
 * @route   PUT /api/programs/:id
 */
router.put(
    '/:id',
    authenticate,
    validateObjectId('id'),
    authorizeRoles('admin', 'super_admin', 'hod'),
    validateRequest(updateProgramSchema),
    programController.updateProgram
);

/**
 * @route   DELETE /api/programs/:id
 */
router.delete(
    '/:id',
    authenticate,
    validateObjectId('id'),
    authorizeRoles('admin', 'super_admin', 'hod'),
    programController.deleteProgram
);

module.exports = router;
