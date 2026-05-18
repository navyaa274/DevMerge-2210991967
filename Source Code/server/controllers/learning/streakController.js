const Streak = require("../../models/learning/gamification/Streak");

const streakController = {
  getUserStreak: async (req, res) => {
    try {
      const { userId } = req.params;
      let streak = await Streak.findOne({ userId }).populate(
        "userId",
        "name email",
      );

      if (!streak) {
        streak = new Streak({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActivityDate: null,
          activityLog: [],
        });
        await streak.save();
      }

      res.json({ success: true, data: streak });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  recordActivity: async (req, res) => {
    try {
      const { userId } = req.params;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = await Streak.findOne({ userId });
      if (!streak) {
        streak = new Streak({
          userId,
          currentStreak: 0,
          longestStreak: 0,
          activityLog: [],
        });
      }

      const lastActivity = streak.lastActivityDate
        ? new Date(streak.lastActivityDate)
        : null;
      if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActivity && lastActivity.getTime() === today.getTime()) {
        return res.json({
          success: true,
          data: streak,
          message: "Already recorded today",
        });
      }

      if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
        streak.currentStreak += 1;
      } else if (!lastActivity || lastActivity.getTime() !== today.getTime()) {
        streak.currentStreak = 1;
      }

      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      streak.lastActivityDate = today;
      streak.activityLog.push({ date: today, submissionsCount: 1 });

      await streak.save();
      res.json({ success: true, data: streak });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getStreakLeaderboard: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await Streak.find()
        .populate("userId", "name email avatar")
        .sort({ currentStreak: -1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: leaderboard });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  resetStreak: async (req, res) => {
    try {
      const { userId } = req.params;
      const streak = await Streak.findOneAndUpdate(
        { userId },
        { currentStreak: 0, lastActivityDate: null },
        { new: true },
      );

      if (!streak) {
        return res
          .status(404)
          .json({ success: false, message: "Streak not found" });
      }

      res.json({ success: true, data: streak });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = streakController;
