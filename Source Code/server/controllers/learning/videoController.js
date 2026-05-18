const Video = require("../../models/learning/materials/Video");
const Course = require("../../models/academic/Course");

const videoController = {
  getAllVideos: async (req, res) => {
    try {
      const { courseId, page = 1, limit = 20 } = req.query;
      const filter = courseId ? { course: courseId } : {};

      const videos = await Video.find(filter)
        .populate("course", "title")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Video.countDocuments(filter);

      res.json({
        success: true,
        data: videos,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getVideoById: async (req, res) => {
    try {
      const video = await Video.findById(req.params.id).populate(
        "course",
        "title",
      );
      if (!video) {
        return res
          .status(404)
          .json({ success: false, message: "Video not found" });
      }
      res.json({ success: true, data: video });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createVideo: async (req, res) => {
    try {
      const video = new Video(req.body);
      await video.save();
      res.status(201).json({ success: true, data: video });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateVideo: async (req, res) => {
    try {
      const video = await Video.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!video) {
        return res
          .status(404)
          .json({ success: false, message: "Video not found" });
      }
      res.json({ success: true, data: video });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteVideo: async (req, res) => {
    try {
      const video = await Video.findByIdAndDelete(req.params.id);
      if (!video) {
        return res
          .status(404)
          .json({ success: false, message: "Video not found" });
      }
      res.json({ success: true, message: "Video deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  recordWatchProgress: async (req, res) => {
    try {
      const { videoId } = req.params;
      const { userId, watchedSeconds } = req.body;

      const video = await Video.findById(videoId);
      if (!video) {
        return res
          .status(404)
          .json({ success: false, message: "Video not found" });
      }

      if (!video.watchProgress) video.watchProgress = [];

      const existingProgress = video.watchProgress.find(
        (p) => p.user.toString() === userId,
      );
      if (existingProgress) {
        existingProgress.watchedSeconds = watchedSeconds;
        existingProgress.lastWatched = new Date();
      } else {
        video.watchProgress.push({
          user: userId,
          watchedSeconds,
          lastWatched: new Date(),
        });
      }

      await video.save();
      res.json({ success: true, data: video });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = videoController;
