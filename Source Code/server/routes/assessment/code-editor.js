const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const EditorSession = require('../../models/assessment/sessions/EditorSession');
const systemExecutor = require('../../utils/systemExecutor');
const { v4: uuidv4 } = require('uuid');

// Create or get editor session
router.post('/session', authenticate, async (req, res) => {
    try {
        const { roomId } = req.body;

        if (!roomId) {
            return res.status(400).json({ success: false, error: 'Room ID is required' });
        }

        let session = await EditorSession.findOne({ roomId, userId: req.user.id });

        if (!session) {
            session = new EditorSession({
                roomId,
                userId: req.user.id,
                userName: req.user.name,
                files: [{ name: 'main.js', content: '// Write your code here', language: 'javascript' }],
                currentFile: 'main.js',
                currentLanguage: 'javascript'
            });
            await session.save();
        }

        res.json({ success: true, data: session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get session by room ID
router.get('/session/:roomId', authenticate, async (req, res) => {
    try {
        const session = await EditorSession.findOne({
            roomId: req.params.roomId,
            userId: req.user.id
        });

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        res.json({ success: true, data: session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Execute code with Docker
router.post('/execute', authenticate, async (req, res) => {
    try {
        const { code, language, roomId, input } = req.body;

        if (!code || !language) {
            return res.status(400).json({ success: false, error: 'Code and language are required' });
        }

        // Get file extension
        const fileName = `main.${systemExecutor.getFileExtension(language)}`;

        // Execute with system compilers (input is passed to executor for proper wrapping)
        const result = await systemExecutor.execute(code, language, fileName, input || '');

        // Save execution to editor session
        if (roomId) {
            try {
                const output = String(result.output || '');
                await EditorSession.findOneAndUpdate(
                    { roomId, userId: req.user.id },
                    {
                        $push: {
                            executions: {
                                code,
                                language,
                                output,
                                timestamp: new Date()
                            }
                        },
                        lastExecuted: new Date()
                    },
                    { upsert: true }
                );
            } catch (sessionError) {
                console.warn('Failed to save execution:', sessionError.message);
            }
        }

        const output = String(result.output || '');
        res.json({ success: true, output });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Save file
router.post('/save', authenticate, async (req, res) => {
    try {
        const { roomId, fileName, content, language } = req.body;

        if (!roomId || !fileName) {
            return res.status(400).json({ success: false, error: 'Room ID and file name are required' });
        }

        const session = await EditorSession.findOneAndUpdate(
            { roomId, userId: req.user.id },
            {
                $set: {
                    currentFile: fileName,
                    currentLanguage: language || 'javascript',
                    lastSaved: new Date()
                },
                $addToSet: {
                    files: { name: fileName, content, language: language || 'javascript' }
                }
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, message: 'File saved successfully', data: session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update file
router.put('/file', authenticate, async (req, res) => {
    try {
        const { roomId, fileName, content, language } = req.body;

        if (!roomId || !fileName) {
            return res.status(400).json({ success: false, error: 'Room ID and file name are required' });
        }

        const session = await EditorSession.findOneAndUpdate(
            { roomId, userId: req.user.id, 'files.name': fileName },
            {
                $set: {
                    'files.$.content': content,
                    'files.$.language': language || 'javascript',
                    lastSaved: new Date()
                }
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ success: false, error: 'File not found' });
        }

        res.json({ success: true, message: 'File updated successfully', data: session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete file
router.delete('/file', authenticate, async (req, res) => {
    try {
        const { roomId, fileName } = req.body;

        if (!roomId || !fileName) {
            return res.status(400).json({ success: false, error: 'Room ID and file name are required' });
        }

        const session = await EditorSession.findOneAndUpdate(
            { roomId, userId: req.user.id },
            {
                $pull: { files: { name: fileName } }
            },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        res.json({ success: true, message: 'File deleted successfully', data: session });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get execution history
router.get('/history/:roomId', authenticate, async (req, res) => {
    try {
        const session = await EditorSession.findOne({
            roomId: req.params.roomId,
            userId: req.user.id
        });

        if (!session) {
            return res.status(404).json({ success: false, error: 'Session not found' });
        }

        res.json({ success: true, data: session.executions || [] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
