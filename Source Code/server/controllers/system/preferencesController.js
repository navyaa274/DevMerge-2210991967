const UserPreferences = require("../../models/admin/UserPreferences");

const preferencesController = {
  getUserPreferences: async (req, res) => {
    try {
      const { userId } = req.params;
      let preferences = await UserPreferences.findOne({ user: userId });

      if (!preferences) {
        preferences = new UserPreferences({ user: userId });
        await preferences.save();
      }

      res.json({ success: true, data: preferences });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updatePreferences: async (req, res) => {
    try {
      const { userId } = req.params;
      const updates = req.body;

      let preferences = await UserPreferences.findOneAndUpdate(
        { user: userId },
        { $set: updates },
        { new: true, upsert: true },
      );

      res.json({ success: true, data: preferences });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateNotificationSettings: async (req, res) => {
    try {
      const { userId } = req.params;
      const { notifications } = req.body;

      const preferences = await UserPreferences.findOneAndUpdate(
        { user: userId },
        { $set: { notifications } },
        { new: true, upsert: true },
      );

      res.json({ success: true, data: preferences });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateTheme: async (req, res) => {
    try {
      const { userId } = req.params;
      const { theme, customColors } = req.body;

      const preferences = await UserPreferences.findOneAndUpdate(
        { user: userId },
        { $set: { theme, customColors } },
        { new: true, upsert: true },
      );

      res.json({ success: true, data: preferences });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  resetPreferences: async (req, res) => {
    try {
      const { userId } = req.params;

      const preferences = await UserPreferences.findOneAndUpdate(
        { user: userId },
        {
          theme: "light",
          language: "en",
          notifications: {
            email: true,
            push: true,
            inApp: true,
          },
          privacy: {
            showProfile: true,
            showProgress: true,
          },
        },
        { new: true },
      );

      res.json({ success: true, data: preferences });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = preferencesController;
