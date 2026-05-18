const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const interviewerController = require('../../controllers/learning/interviewerController');

/**
 * @route   POST /api/learning/-interviews/start
 * @desc    Initialize a new AI  interview session
 * @access  Private (Student)
 */
router.post('/start', authenticate, interviewerController.startSession);

/**
 * @route   POST /api/learning/-interviews/respond
 * @desc    Submit student response to AI
 * @access  Private (Student)
 */
router.post('/respond', authenticate, interviewerController.submitResponse);

/**
 * @route   GET /api/learning/-interviews/history
 * @desc    Get student's interview history
 * @access  Private (Student)
 */
router.get('/history', authenticate, interviewerController.getStudentHistory);

/**
 * @route   GET /api/learning/-interviews/:id
 * @desc    Get session details and evaluation
 * @access  Private (Student/Admin)
 */
router.get('/:id', authenticate, interviewerController.getSession);

module.exports = router;
