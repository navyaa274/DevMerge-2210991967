const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const aiTutorService = require('../../services/ai/aiTutorService');

/**
 * @route   POST /api/ai-tutor/query
 * @desc    Submit a question to the AI Tutor (Concept Explanation)
 */
router.post('/query', authenticate, async (req, res) => {
    try {
        const { query, message, courseId, sessionId } = req.body;
        const normalizedQuery = String(query || message || '').trim();

        if (!normalizedQuery) {
            return res.status(400).json({ success: false, message: 'Missing query' });
        }

        const answer = await aiTutorService.explainConcept(normalizedQuery, courseId);

        res.status(200).json({
            success: true,
            data: {
                sessionId: sessionId || 'session-' + Date.now(),
                answer,
                references: 1,
                pedagogicalMode: 'Explain'
            }
        });
    } catch (error) {
        console.error('AI Tutor Query Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/ai-tutor/hint
 * @desc    Get progressive hints for a coding problem
 */
router.post('/hint', authenticate, async (req, res) => {
    try {
        const { problemDescription, studentCode, language } = req.body;

        if (!problemDescription || !studentCode) {
            return res.status(400).json({ success: false, message: 'Missing problem description or student code' });
        }

        const hintData = await aiTutorService.getCodeHint(problemDescription, studentCode, language || 'javascript');

        res.status(200).json({
            success: true,
            data: hintData
        });
    } catch (error) {
        console.error('AI Tutor Hint Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/ai-tutor/modes
 * @desc    Get available AI Tutor modes
 */
router.get('/modes', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            modes: [
                { id: 'Explain', name: 'Concept Explainer', icon: 'book' },
                { id: 'Hint', name: 'Code Debugger', icon: 'code' },
                { id: 'Practice', name: 'Mock Quizzer', icon: 'edit' }
            ]
        }
    });
});

module.exports = router;
