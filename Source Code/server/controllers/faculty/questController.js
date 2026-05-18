const ZeroDayQuest = require('../../models/learning/ZeroDayQuest');
const Notification = require('../../models/communication/Notification');
const User = require('../../models/auth/User');

/**
 * Quest Controller
 * Handles the deployment and reporting of Zero-Day Quests.
 */

exports.deployQuest = async (req, res) => {
    try {
        const { title, description, difficulty, baseXp, multiplier, timeLimitMinutes, colorTheme, courseId } = req.body;

        const expiresAt = new Date(Date.now() + timeLimitMinutes * 60000);

        const quest = new ZeroDayQuest({
            title,
            description,
            difficulty,
            baseXp,
            multiplier,
            timeLimitMinutes,
            colorTheme,
            courseId,
            createdBy: req.user._id,
            expiresAt
        });

        await quest.save();

        // Broadcast notification to all students if courseId is global or specific
        // For now, let's notify all students to create "hype"
        const students = await User.find({ role: 'student' });

        const notifications = students.map(student => ({
            recipient: student._id,
            type: 'quest',
            title: `🚀 NEW ZERO-DAY QUEST: ${title}`,
            message: `A new high-intensity challenge has been deployed! Earn ${baseXp * multiplier} XP in the next ${timeLimitMinutes} minutes.`,
            relatedId: quest._id,
            relatedType: 'ZeroDayQuest',
            priority: 'high'
        }));

        await Notification.insertMany(notifications);

        res.json({
            success: true,
            message: 'Quest deployed and broadcasted to all active nodes.',
            data: quest
        });
    } catch (error) {
        console.error('[Quest Controller Error]', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await ZeroDayQuest.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.checkAvailability = async (req, res) => {
    res.json({ success: true, available: true });
};
