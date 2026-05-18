const LearningPath = require("../../models/learning/pathway/LearningPath");
const Course = require("../../models/academic/Course");

const learningPathController = {
  getAllPaths: async (req, res) => {
    try {
      const { category, difficulty, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;

      const paths = await LearningPath.find(filter)
        .populate("courses", "title")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await LearningPath.countDocuments(filter);

      res.json({
        success: true,
        data: paths,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getPathById: async (req, res) => {
    try {
      const path = await LearningPath.findById(req.params.id).populate(
        "courses",
        "title description",
      );

      if (!path) {
        return res
          .status(404)
          .json({ success: false, message: "Learning path not found" });
      }

      res.json({ success: true, data: path });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createPath: async (req, res) => {
    try {
      const path = new LearningPath(req.body);
      await path.save();
      res.status(201).json({ success: true, data: path });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updatePath: async (req, res) => {
    try {
      const path = await LearningPath.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!path) {
        return res
          .status(404)
          .json({ success: false, message: "Learning path not found" });
      }
      res.json({ success: true, data: path });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deletePath: async (req, res) => {
    try {
      const path = await LearningPath.findByIdAndDelete(req.params.id);
      if (!path) {
        return res
          .status(404)
          .json({ success: false, message: "Learning path not found" });
      }
      res.json({ success: true, message: "Learning path deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  addCourseToPath: async (req, res) => {
    try {
      const { courseId, order } = req.body;
      const path = await LearningPath.findById(req.params.id);

      if (!path) {
        return res
          .status(404)
          .json({ success: false, message: "Learning path not found" });
      }

      path.courses.push(courseId);
      if (order) path.courseOrder.push({ course: courseId, order });

      await path.save();
      res.json({ success: true, data: path });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getRecommendedPaths: async (req, res) => {
    try {
      const { userId } = req.params;
      const paths = await LearningPath.find({ isPublished: true })
        .populate("courses", "title")
        .sort({ enrollmentCount: -1 })
        .limit(5);

      res.json({ success: true, data: paths });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = learningPathController;
