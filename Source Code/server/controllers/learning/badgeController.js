const Badge = require("../../models/learning/gamification/Badge");
const UserBadge = require("../../models/learning/gamification/UserBadge");
const User = require("../../models/auth/User");

const badgeController = {
  getAllBadges: async (req, res) => {
    try {
      const badges = await Badge.find().sort({ category: 1, name: 1 });
      res.json({ success: true, data: badges });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getBadgeById: async (req, res) => {
    try {
      const badge = await Badge.findById(req.params.id);
      if (!badge) {
        return res
          .status(404)
          .json({ success: false, message: "Badge not found" });
      }
      res.json({ success: true, data: badge });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createBadge: async (req, res) => {
    try {
      const badge = new Badge(req.body);
      await badge.save();
      res.status(201).json({ success: true, data: badge });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateBadge: async (req, res) => {
    try {
      const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!badge) {
        return res
          .status(404)
          .json({ success: false, message: "Badge not found" });
      }
      res.json({ success: true, data: badge });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteBadge: async (req, res) => {
    try {
      const badge = await Badge.findByIdAndDelete(req.params.id);
      if (!badge) {
        return res
          .status(404)
          .json({ success: false, message: "Badge not found" });
      }
      res.json({ success: true, message: "Badge deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  awardBadge: async (req, res) => {
    try {
      const { userId, badgeId } = req.body;

      const existingAward = await UserBadge.findOne({
        user: userId,
        badge: badgeId,
      });
      if (existingAward) {
        return res
          .status(400)
          .json({ success: false, message: "Badge already awarded" });
      }

      const userBadge = new UserBadge({ user: userId, badge: badgeId });
      await userBadge.save();

      res.status(201).json({ success: true, data: userBadge });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserBadges: async (req, res) => {
    try {
      const { userId } = req.params;
      const userBadges = await UserBadge.find({ user: userId }).populate(
        "badge",
      );
      res.json({ success: true, data: userBadges });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = badgeController;
