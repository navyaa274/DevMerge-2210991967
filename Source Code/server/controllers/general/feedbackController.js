const Feedback = require("../../models/admin/Feedback");

const feedbackController = {
  createFeedback: async (req, res) => {
    try {
      const feedback = new Feedback({
        ...req.body,
        user: req.user?.id,
      });
      await feedback.save();
      res.status(201).json({ success: true, data: feedback });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAllFeedback: async (req, res) => {
    try {
      const { type, status, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;

      const feedback = await Feedback.find(filter)
        .populate("user", "name email")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Feedback.countDocuments(filter);

      res.json({
        success: true,
        data: feedback,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserFeedback: async (req, res) => {
    try {
      const { userId } = req.params;
      const feedback = await Feedback.find({ user: userId }).sort({
        createdAt: -1,
      });
      res.json({ success: true, data: feedback });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateFeedback: async (req, res) => {
    try {
      const feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!feedback) {
        return res
          .status(404)
          .json({ success: false, message: "Feedback not found" });
      }
      res.json({ success: true, data: feedback });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  respondToFeedback: async (req, res) => {
    try {
      const { response } = req.body;
      const feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        {
          response,
          status: "responded",
          respondedAt: new Date(),
        },
        { new: true },
      );
      if (!feedback) {
        return res
          .status(404)
          .json({ success: false, message: "Feedback not found" });
      }
      res.json({ success: true, data: feedback });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = feedbackController;
