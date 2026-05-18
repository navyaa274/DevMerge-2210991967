const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const interventionController = require('../../controllers/learning/interventionController');

/**
 * @route   POST /api/learning/interventions/analyze
 * @desc    Predictive risk analysis for a student
 * @access  Private (Faculty/HOD/Admin)
 */
router.post(
    '/analyze',
    authenticate,
    authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
    interventionController.runAnalysis
);

/**
 * @route   GET /api/learning/interventions/student
 * @desc    Get active interventions for student
 * @access  Private (Student)
 */
router.get(
    '/student',
    authenticate,
    interventionController.getStudentInterventions
);

/**
 * @route   PATCH /api/learning/interventions/:id
 * @desc    Resolve or update intervention
 * @access  Private (Faculty/Admin)
 */
router.patch(
    '/:id',
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    interventionController.resolveIntervention
);

/**
 * @route   GET /api/learning/interventions/department/:deptId
 * @desc    Get departmental risk clusters for HOD
 * @access  Private (HOD/Admin)
 */
router.get(
    '/department/:deptId',
    authenticate,
    authorizeRoles('hod', 'admin', 'super_admin'),
    interventionController.getDepartmentInterventions
);

/**
 * @route   GET /api/learning/interventions/study-path
 * @desc    Generate personalized study recommendations based on performance
 * @access  Private (Student)
 */
router.get(
    '/study-path',
    authenticate,
    interventionController.generateStudyPath
);

module.exports = router;
