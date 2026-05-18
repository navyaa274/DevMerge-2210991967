const Announcement = require("../../models/communication/Announcement");

const announcementController = {
  getAllAnnouncements: async (req, res) => {
    try {
      const { courseId, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (courseId) filter.course = courseId;
      if (!req.user || req.user.role === "student") {
        filter.isPublished = true;
      }

      const announcements = await Announcement.find(filter)
        .populate("author", "name email")
        .populate("course", "title")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Announcement.countDocuments(filter);

      res.json({
        success: true,
        data: announcements,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAnnouncementById: async (req, res) => {
    try {
      const announcement = await Announcement.findById(req.params.id)
        .populate("author", "name email")
        .populate("course", "title");

      if (!announcement) {
        return res
          .status(404)
          .json({ success: false, message: "Announcement not found" });
      }

      res.json({ success: true, data: announcement });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createAnnouncement: async (req, res) => {
    try {
      const announcement = new Announcement({
        ...req.body,
        author: req.user?.id,
      });
      await announcement.save();
      res.status(201).json({ success: true, data: announcement });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateAnnouncement: async (req, res) => {
    try {
      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!announcement) {
        return res
          .status(404)
          .json({ success: false, message: "Announcement not found" });
      }
      res.json({ success: true, data: announcement });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteAnnouncement: async (req, res) => {
    try {
      const announcement = await Announcement.findByIdAndDelete(req.params.id);
      if (!announcement) {
        return res
          .status(404)
          .json({ success: false, message: "Announcement not found" });
      }
      res.json({ success: true, message: "Announcement deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  publishAnnouncement: async (req, res) => {
    try {
      const announcement = await Announcement.findByIdAndUpdate(
        req.params.id,
        { isPublished: true, publishedAt: new Date() },
        { new: true },
      );
      if (!announcement) {
        return res
          .status(404)
          .json({ success: false, message: "Announcement not found" });
      }
      res.json({ success: true, data: announcement });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = announcementController;
