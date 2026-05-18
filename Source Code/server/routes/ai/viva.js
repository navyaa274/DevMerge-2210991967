const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const vivaService = require('../../services/ai/vivaVoceService');

/**
 * @route   POST /api/ai/viva/start
 * @desc    Initialize a new AI Viva session for a student
 */
router.post('/start', authenticate, async (req, res) => {
    try {
        const { courseId, topic, labId } = req.body;
        if (!courseId || !topic) {
            return res.status(400).json({ success: false, message: "Course and Topic are required" });
        }

        const session = await vivaService.startSession(req.user.id, courseId, topic, labId);
        res.json({
            success: true,
            message: "Viva session started. Answer the questions one by one.",
            data: session
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/ai/viva/submit
 * @desc    Submit an answer to a viva question and get scoring
 */
router.post('/submit', authenticate, async (req, res) => {
    try {
        const { sessionId, questionId, studentAnswer } = req.body;
        if (!sessionId || !questionId || !studentAnswer) {
            return res.status(400).json({ success: false, message: "Missing sessionId, questionId or answer" });
        }

        const result = await vivaService.submitAnswer(sessionId, questionId, studentAnswer);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/ai/viva/complete/:sessionId
 * @desc    Finalize the viva session and get overall feedback
 */
router.post('/complete/:sessionId', authenticate, async (req, res) => {
    try {
        const session = await vivaService.completeSession(req.params.sessionId);
        res.json({
            success: true,
            data: session
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
