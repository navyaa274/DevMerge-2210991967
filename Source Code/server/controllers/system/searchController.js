const User = require("../../models/auth/User");
const Course = require("../../models/academic/Course");
const Problem = require("../../models/assessment/problems/Problem");
const Submission = require("../../models/assessment/problems/Submission");
const Resource = require("../../models/learning/materials/Resource");

const searchController = {
  globalSearch: async (req, res) => {
    try {
      const { q, type, page = 1, limit = 10 } = req.query;

      if (!q || q.length < 2) {
        return res
          .status(400)
          .json({ success: false, message: "Search query too short" });
      }

      const searchRegex = new RegExp(q, "i");
      const results = {};
      const skip = (page - 1) * limit;

      if (!type || type === "all" || type === "users") {
        results.users = await User.find({
          $or: [{ name: searchRegex }, { email: searchRegex }],
        })
          .select("name email avatar role")
          .limit(parseInt(limit));
      }

      if (!type || type === "all" || type === "courses") {
        results.courses = await Course.find({
          $or: [{ title: searchRegex }, { description: searchRegex }],
        })
          .select("title description")
          .limit(parseInt(limit));
      }

      if (!type || type === "all" || type === "problems") {
        results.problems = await Problem.find({
          $or: [{ title: searchRegex }, { description: searchRegex }],
        })
          .select("title difficulty")
          .limit(parseInt(limit));
      }

      if (!type || type === "all" || type === "resources") {
        results.resources = await Resource.find({
          $or: [{ title: searchRegex }, { description: searchRegex }],
        })
          .select("title type url")
          .limit(parseInt(limit));
      }

      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  advancedSearch: async (req, res) => {
    try {
      const {
        query,
        types = ["users", "courses", "problems", "resources"],
        filters = {},
        page = 1,
        limit = 10,
      } = req.body;

      const searchRegex = new RegExp(query, "i");
      const results = {};
      const skip = (page - 1) * limit;

      for (const type of types) {
        switch (type) {
          case "users":
            results.users = await User.find({
              $or: [{ name: searchRegex }, { email: searchRegex }],
              ...filters.user,
            })
              .select("name email avatar role")
              .skip(skip)
              .limit(parseInt(limit));
            break;

          case "courses":
            results.courses = await Course.find({
              $or: [{ title: searchRegex }, { description: searchRegex }],
              ...filters.course,
            })
              .select("title description")
              .skip(skip)
              .limit(parseInt(limit));
            break;

          case "problems":
            results.problems = await Problem.find({
              $or: [{ title: searchRegex }, { description: searchRegex }],
              ...filters.problem,
            })
              .select("title difficulty")
              .skip(skip)
              .limit(parseInt(limit));
            break;

          case "resources":
            results.resources = await Resource.find({
              $or: [{ title: searchRegex }, { description: searchRegex }],
              ...filters.resource,
            })
              .select("title type url")
              .skip(skip)
              .limit(parseInt(limit));
            break;
        }
      }

      res.json({ success: true, data: results });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSearchSuggestions: async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.json({ success: true, data: [] });
      }

      const searchRegex = new RegExp(`^${q}`, "i");
      const suggestions = [];

      const users = await User.find({ name: searchRegex })
        .limit(3)
        .select("name");
      users.forEach((u) => suggestions.push({ type: "user", text: u.name }));

      const courses = await Course.find({ title: searchRegex })
        .limit(3)
        .select("title");
      courses.forEach((c) =>
        suggestions.push({ type: "course", text: c.title }),
      );

      res.json({ success: true, data: suggestions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = searchController;
