const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const ModerationFlag = require('../../models/admin/ModerationFlag');

// Allow admin and super_admin
router.use(authenticate, authorize(['admin', 'super_admin']));

router.get('/flags', async (req, res) => {
    try {
        // Populate user info
        const flags = await ModerationFlag.find().populate('userId', 'name email').sort({ createdAt: -1 });
        res.json(flags);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/flags/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const flag = await ModerationFlag.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(flag);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
