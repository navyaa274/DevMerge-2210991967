const express = require('express');
const router = express.Router();
const courseMaterialController = require('../../controllers/faculty/facultyController');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const validateObjectId = require('../../middleware/validateObjectId');

router.get(
    '/course/:courseId',
    authenticate,
    validateObjectId('courseId'),
    courseMaterialController.getMaterials
);

router.post(
    '/course/:courseId',
    authenticate,
    validateObjectId('courseId'),
    authorizeRoles('faculty', 'admin', 'super_admin'),
    courseMaterialController.uploadMaterial
);

router.delete(
    '/:materialId',
    authenticate,
    validateObjectId('materialId'),
    authorizeRoles('faculty', 'admin', 'super_admin'),
    courseMaterialController.deleteMaterial
);

module.exports = router;
