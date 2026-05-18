const UserPoints = require("../../models/learning/gamification/UserPoints");

const pointsController = {
  getUserPoints: async (req, res) => {
    try {
      const { userId } = req.params;
      const userPoints = await UserPoints.findOne({ userId: userId }).populate(
        "userId",
        "name email",
      );

      if (!userPoints) {
        return res.json({
          success: true,
          data: { userId, totalPoints: 0, history: [] },
        });
      }

      res.json({ success: true, data: userPoints });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  addPoints: async (req, res) => {
    try {
      const { userId, points, reason, source } = req.body;

      let userPoints = await UserPoints.findOne({ userId });
      if (!userPoints) {
        userPoints = new UserPoints({ userId, totalPoints: 0, history: [] });
      }

      userPoints.totalPoints += points;
      userPoints.history.push({
        points,
        reason,
        source,
        date: new Date(),
      });

      await userPoints.save();
      res.json({ success: true, data: userPoints });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deductPoints: async (req, res) => {
    try {
      const { userId, points, reason } = req.body;

      const userPoints = await UserPoints.findOne({ userId });
      if (!userPoints || userPoints.totalPoints < points) {
        return res
          .status(400)
          .json({ success: false, message: "Insufficient points" });
      }

      userPoints.totalPoints -= points;
      userPoints.history.push({
        points: -points,
        reason,
        date: new Date(),
      });

      await userPoints.save();
      res.json({ success: true, data: userPoints });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getPointsLeaderboard: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await UserPoints.find()
        .populate("userId", "name email avatar")
        .sort({ totalPoints: -1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: leaderboard });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getPointsHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;

      const userPoints = await UserPoints.findOne({ userId });
      if (!userPoints) {
        return res.json({ success: true, data: [] });
      }

      const history = userPoints.history
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, parseInt(limit));

      res.json({ success: true, data: history });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = pointsController;
