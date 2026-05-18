const mongoose = require('mongoose');
const SystemConfig = require('../../models/admin/SystemConfig');

/**
 * Get DB Stats
 */
exports.getDBStats = async (req, res) => {
    try {
        const stats = await mongoose.connection.db.stats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get Settings
 */
exports.getSettings = async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create({});
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update Settings
 */
exports.updateSettings = async (req, res) => {
    try {
        let config = await SystemConfig.findOne();
        if (!config) {
            config = await SystemConfig.create(req.body);
        } else {
            config = await SystemConfig.findByIdAndUpdate(config._id, req.body, { new: true });
        }
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
