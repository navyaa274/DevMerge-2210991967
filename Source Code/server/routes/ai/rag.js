const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const { retrieveContext } = require('../../utils/vectorRetriever');
const validateObjectId = require('../../middleware/validateObjectId');

/**
 * @route   POST /api/rag/test
 * @desc    Test RAG retrieval without LLM generation
 * @access  Private (Admin/Faculty)
 */
router.post(
    '/test',
    authenticate,
    authorizeRoles('admin', 'super_admin', 'faculty'),
    async (req, res) => {
        try {
            const { query, courseId } = req.body;

            if (!query || !courseId) {
                return res.status(400).json({ success: false, message: "Missing query or courseId" });
            }

            const context = await retrieveContext(query, { courseId });

            res.status(200).json({
                success: true,
                query,
                context
            });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
);

module.exports = router;
