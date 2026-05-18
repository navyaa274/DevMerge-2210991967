const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const aiTutorService = require('../../services/ai/aiTutorService');
const ultimateGenService = require('../../services/ai/ultimateProblemGeneratorService');

/**
 * AI Academic Hub
 * Consolidates all AI-powered educational features.
 */

// Sub-routers for specific vertical features
router.use('/curriculum', require('./curriculum'));
router.use('/viva', require('./viva'));
router.use('/plagiarism', require('./plagiarism'));

/**
 * @route   POST /api/ai/explain
 * @desc    Get an AI-powered explanation of a concept grounded in course context
 */
router.post('/explain', authenticate, async (req, res) => {
  try {
    const { query, message, courseId } = req.body;
    const answer = await aiTutorService.explainConcept(query || message, courseId);
    res.json({ success: true, answer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ai/hint
 * @desc    Get a progressive hint for a coding problem
 */
router.post('/hint', authenticate, async (req, res) => {
  try {
    const { problemDescription, studentCode, language } = req.body;
    const hintData = await aiTutorService.getCodeHint(problemDescription, studentCode, language);
    res.json({ success: true, ...hintData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ai/generate-problem
 * @desc    Generate a complex coding problem (Faculty only)
 */
router.post('/generate-problem', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const { topic, difficulty, subjectName } = req.body;
    const generatedProblem = await ultimateGenService.generateProblem({
      topic,
      difficulty: difficulty || 'Medium',
      subjectName: subjectName || 'Computer Science',
      userId: req.user.id
    });

    res.json({
      success: true,
      problem: generatedProblem
    });
  } catch (error) {
    console.error('Problem generation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ai/generate-lab
 * @desc    Generate a full laboratory manual / experiment (Faculty only)
 */
router.post('/generate-lab', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const { topic, difficulty, subjectName, semester, labNumber } = req.body;
    const lab = await ultimateGenService.generateLabManual({
      topic,
      subjectName,
      semester: semester || 1,
      difficulty: difficulty || 'Medium',
      labNumber: labNumber || 1,
      userId: req.user.id
    });
    res.json({ success: true, lab });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Back-compatibility route
router.post('/tutor', authenticate, async (req, res) => {
  return res.redirect(307, '/api/ai/explain');
});

module.exports = router;
