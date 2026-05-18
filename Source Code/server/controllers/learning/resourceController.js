const Resource = require("../../models/learning/materials/Resource");

const resourceController = {
  getAllResources: async (req, res) => {
    try {
      const { type, courseId, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (type) filter.type = type;
      if (courseId) filter.course = courseId;

      const resources = await Resource.find(filter)
        .populate("course", "title")
        .populate("uploadedBy", "name email")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Resource.countDocuments(filter);

      res.json({
        success: true,
        data: resources,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getResourceById: async (req, res) => {
    try {
      const resource = await Resource.findById(req.params.id)
        .populate("course", "title")
        .populate("uploadedBy", "name email");

      if (!resource) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }

      res.json({ success: true, data: resource });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createResource: async (req, res) => {
    try {
      const resource = new Resource({
        ...req.body,
        uploadedBy: req.user?.id,
      });
      await resource.save();
      res.status(201).json({ success: true, data: resource });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateResource: async (req, res) => {
    try {
      const resource = await Resource.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!resource) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      res.json({ success: true, data: resource });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteResource: async (req, res) => {
    try {
      const resource = await Resource.findByIdAndDelete(req.params.id);
      if (!resource) {
        return res
          .status(404)
          .json({ success: false, message: "Resource not found" });
      }
      res.json({ success: true, message: "Resource deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  searchResources: async (req, res) => {
    try {
      const { q, type, limit = 20 } = req.query;
      const filter = {
        $or: [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
        ],
      };
      if (type) filter.type = type;

      const resources = await Resource.find(filter)
        .populate("course", "title")
        .limit(parseInt(limit));

      res.json({ success: true, data: resources });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = resourceController;
