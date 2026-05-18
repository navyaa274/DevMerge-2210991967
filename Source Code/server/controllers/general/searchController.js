const User = require("../../models/auth/User");
const Course = require("../../models/academic/Course");
const Problem = require("../../models/assessment/problems/Problem");

/**
 * Global Search Engine
 * Searches across Users, Courses, and Problems.
 */
exports.globalSearch = async (req, res) => {
  try {
    const { q, type } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const queryStr = q.trim();
    const regex = new RegExp(queryStr, "i");

    let results = [];

    // Determine which types to search based on filter. Defaults to all types.
    const searchUsers = !type || type === "user" || type === "all";
    const searchCourses = !type || type === "course" || type === "all";
    const searchProblems = !type || type === "problem" || type === "all";

    const promises = [];

    if (searchUsers) {
      promises.push(
        User.find({
          $or: [
            { name: regex },
            { email: regex },
            { studentId: regex },
            { employeeId: regex },
          ],
        })
          .select("name email role studentId employeeId profilePicture")
          .limit(10)
          .lean()
          .then((users) => users.map((u) => ({ ...u, _type: "user" }))),
      );
    }

    if (searchCourses) {
      promises.push(
        Course.find({
          $or: [{ name: regex }, { code: regex }, { title: regex }],
          isActive: true,
        })
          .select("name title code description")
          .limit(10)
          .lean()
          .then((courses) =>
            courses.map((c) => ({
              _id: c._id,
              name: c.name || c.title,
              code: c.code,
              description: c.description,
              _type: "course",
            })),
          ),
      );
    }

    if (searchProblems) {
      promises.push(
        Problem.find({
          $or: [{ title: regex }, { topics: regex }],
          isApproved: true,
        })
          .select("title slug difficulty topics acceptanceRate")
          .limit(10)
          .lean()
          .then((problems) =>
            problems.map((p) => ({ ...p, _type: "problem" })),
          ),
      );
    }

    const settledPromises = await Promise.all(promises);
    results = settledPromises.flat();

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("[Global Search Error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Advanced Search Engine
 * Implementation for specific filters and deep searching.
 */
exports.advancedSearch = async (req, res) => {
  try {
    const { query, type, difficulty, tags, department } = req.body;
    const regex = new RegExp(query || "", "i");

    let results = [];

    if (type === "problem") {
      const filter = { $or: [{ title: regex }, { description: regex }] };
      if (difficulty) filter.difficulty = difficulty;
      if (tags && tags.length > 0) filter.topics = { $in: tags };

      results = await Problem.find(filter).limit(50).lean();
    } else if (type === "course") {
      const filter = { $or: [{ name: regex }, { description: regex }] };
      if (department) filter.department = department;

      results = await Course.find(filter).limit(50).lean();
    } else {
      // Default to global search logic if type is not specified
      return exports.globalSearch(req, res);
    }

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("[Advanced Search Error]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
