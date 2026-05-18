const AuditLog = require('../../models/admin/AuditLog');
const RolePermission = require('../../models/auth/RolePermission');
const BlockedIP = require('../../models/auth/BlockedIP');

/**
 * Handle Audit Logs
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const { userId, action, startDate, endDate, limit = 50 } = req.query;
        const filter = {};
        if (userId) filter.userId = userId;
        if (action) filter.action = action;
        if (startDate && endDate) filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };

        const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(parseInt(limit));
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get Public Audit Logs
 */
exports.getPublicAuditLogs = async (req, res) => {
    try {
        const { limit = 8 } = req.query;
        const logs = await AuditLog.find({})
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('action createdAt')
            .lean();
        res.json(logs);
    } catch (error) {
        res.json([]);
    }
};

/**
 * Manage Blocked IPs (WAF)
 */
exports.getBlockedIPs = async (req, res) => {
    try {
        const ips = await BlockedIP.find().sort({ createdAt: -1 });
        res.json(ips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.blockIP = async (req, res) => {
    try {
        const newIp = new BlockedIP(req.body);
        await newIp.save();
        res.status(201).json(newIp);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Role Permissions
 */
exports.getRoles = async (req, res) => {
    try {
        const roles = await RolePermission.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const role = await RolePermission.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
