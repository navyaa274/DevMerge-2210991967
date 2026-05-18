const ModerationFlag = require("../../models/admin/ModerationFlag");

const moderationController = {
  getAllFlags: async (req, res) => {
    try {
      const { status, type, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (type) filter.contentType = type;

      const flags = await ModerationFlag.find(filter)
        .populate("reporter", "name email")
        .populate("contentOwner", "name email")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await ModerationFlag.countDocuments(filter);

      res.json({
        success: true,
        data: flags,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createFlag: async (req, res) => {
    try {
      const flag = new ModerationFlag({
        ...req.body,
        reporter: req.user?.id,
      });
      await flag.save();
      res.status(201).json({ success: true, data: flag });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  resolveFlag: async (req, res) => {
    try {
      const { resolution, action } = req.body;
      const flag = await ModerationFlag.findByIdAndUpdate(
        req.params.id,
        {
          status: "resolved",
          resolution,
          action,
          resolvedBy: req.user?.id,
          resolvedAt: new Date(),
        },
        { new: true },
      );

      if (!flag) {
        return res
          .status(404)
          .json({ success: false, message: "Flag not found" });
      }

      res.json({ success: true, data: flag });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getFlagById: async (req, res) => {
    try {
      const flag = await ModerationFlag.findById(req.params.id)
        .populate("reporter", "name email")
        .populate("contentOwner", "name email");

      if (!flag) {
        return res
          .status(404)
          .json({ success: false, message: "Flag not found" });
      }

      res.json({ success: true, data: flag });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getFlagStats: async (req, res) => {
    try {
      const stats = await ModerationFlag.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const typeStats = await ModerationFlag.aggregate([
        { $group: { _id: "$contentType", count: { $sum: 1 } } },
      ]);

      res.json({ success: true, data: { byStatus: stats, byType: typeStats } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = moderationController;
