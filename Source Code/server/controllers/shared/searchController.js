const User = require("../../models/auth/User");
const Course = require("../../models/academic/Course");
const Problem = require("../../models/assessment/problems/Problem");
const asyncHandler = require("../../errors/asyncHandler");

/**
 * Universal Global Search Engine
 * @route GET /api/shared/search
 */
exports.globalSearch = asyncHandler(async (req, res) => {
  const { query, type = "all", limit = 10 } = req.query;

  if (!query || query.trim().length < 2) {
    return res.json({
      success: true,
      results: { users: [], courses: [], problems: [] },
    });
  }

  const searchRegex = new RegExp(query, "i");
  const results = {};

  // 1. Search Users (Students/Faculty)
  if (type === "all" || type === "user") {
    results.users = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { employeeId: searchRegex },
        { registerNumber: searchRegex },
      ],
    })
      .select("name email role profilePicture department")
      .limit(limit)
      .lean();
  }

  // 2. Search Courses
  if (type === "all" || type === "course") {
    results.courses = await Course.find({
      $or: [
        { title: searchRegex },
        { code: searchRegex },
        { description: searchRegex },
      ],
      isTemplate: false, // Don't show templates in global search
    })
      .select("title code credits department version")
      .limit(limit)
      .lean();
  }

  // 3. Search Coding Problems
  if (type === "all" || type === "problem") {
    results.problems = await Problem.find({
      $or: [
        { title: searchRegex },
        { topics: searchRegex },
        { description: searchRegex },
      ],
      isApproved: true,
      status: "Published",
    })
      .select("title difficulty topics slug score")
      .limit(limit)
      .lean();
  }

  res.json({
    success: true,
    query,
    count: Object.values(results).flat().length,
    results,
  });
});
