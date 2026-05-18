const Discussion = require("../../models/communication/Discussion");

const forumController = {
  getAllDiscussions: async (req, res) => {
    try {
      const { category, page = 1, limit = 20 } = req.query;
      const filter = category ? { category } : {};

      const discussions = await Discussion.find(filter)
        .populate("author", "name email avatar")
        .populate("course", "title")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Discussion.countDocuments(filter);

      res.json({
        success: true,
        data: discussions,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getDiscussionById: async (req, res) => {
    try {
      const discussion = await Discussion.findById(req.params.id)
        .populate("author", "name email avatar")
        .populate("replies.author", "name email avatar");

      if (!discussion) {
        return res
          .status(404)
          .json({ success: false, message: "Discussion not found" });
      }

      res.json({ success: true, data: discussion });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createDiscussion: async (req, res) => {
    try {
      const discussion = new Discussion({
        ...req.body,
        author: req.user?.id,
      });
      await discussion.save();
      res.status(201).json({ success: true, data: discussion });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateDiscussion: async (req, res) => {
    try {
      const discussion = await Discussion.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!discussion) {
        return res
          .status(404)
          .json({ success: false, message: "Discussion not found" });
      }
      res.json({ success: true, data: discussion });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteDiscussion: async (req, res) => {
    try {
      const discussion = await Discussion.findByIdAndDelete(req.params.id);
      if (!discussion) {
        return res
          .status(404)
          .json({ success: false, message: "Discussion not found" });
      }
      res.json({ success: true, message: "Discussion deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  addReply: async (req, res) => {
    try {
      const { content } = req.body;
      const discussion = await Discussion.findById(req.params.id);

      if (!discussion) {
        return res
          .status(404)
          .json({ success: false, message: "Discussion not found" });
      }

      discussion.replies.push({
        content,
        author: req.user?.id,
      });

      await discussion.save();
      res.json({ success: true, data: discussion });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  likeDiscussion: async (req, res) => {
    try {
      const discussion = await Discussion.findById(req.params.id);
      if (!discussion) {
        return res
          .status(404)
          .json({ success: false, message: "Discussion not found" });
      }

      const userId = req.user?.id;
      const likeIndex = discussion.likes.indexOf(userId);

      if (likeIndex > -1) {
        discussion.likes.splice(likeIndex, 1);
      } else {
        discussion.likes.push(userId);
      }

      await discussion.save();
      res.json({ success: true, data: { likes: discussion.likes.length } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = forumController;
