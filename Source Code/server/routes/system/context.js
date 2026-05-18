const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const { retrieveContext } = require('../../utils/vectorRetriever');
const { buildTutorContext } = require('../../utils/contextBuilder');

/**
 * @route   POST /api/context/test
 * @desc    Test prompt synthesis (Retrieval + Metadata Injection)
 * @access  Private (Student)
 */
router.post(
    '/test',
    authenticate,
    authorizeRoles('student', 'faculty', 'admin'),
    async (req, res) => {
        try {
            const { query, courseId } = req.body;
            const studentId = req.user.id;

            if (!query || !courseId) {
                return res.status(400).json({ success: false, message: "Missing query or courseId" });
            }

            // 1. Retrieve raw chunks from RAG foundation
            const chunks = await retrieveContext(query, { courseId });

            // 2. Synthesize with metadata and enrollment guards
            const promptPayload = await buildTutorContext(studentId, courseId, chunks);

            res.status(200).json({
                success: true,
                query,
                promptPayload
            });
        } catch (error) {
            res.status(403).json({ success: false, message: error.message });
        }
    }
);

module.exports = router;
