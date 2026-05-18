const User = require("../../models/auth/User");
const Submission = require("../../models/assessment/problems/Submission");
const Problem = require("../../models/assessment/problems/Problem");
const Course = require("../../models/academic/Course");
const Enrollment = require("../../models/learning/enrollments/Enrollment");
const Assignment = require("../../models/assessment/assignments/Assignment");

const analyticsController = {
  getDashboardStats: async (req, res) => {
    try {
      const [totalUsers, totalSubmissions, totalCourses, totalEnrollments] =
        await Promise.all([
          User.countDocuments(),
          Submission.countDocuments(),
          Course.countDocuments(),
          Enrollment.countDocuments(),
        ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalSubmissions,
          totalCourses,
          totalEnrollments,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserAnalytics: async (req, res) => {
    try {
      const { period = "30d" } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period) || 30);

      const userStats = await User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({ success: true, data: userStats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSubmissionAnalytics: async (req, res) => {
    try {
      const { period = "30d" } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(period) || 30);

      const submissionStats = await Submission.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({ success: true, data: submissionStats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getCourseAnalytics: async (req, res) => {
    try {
      const courseStats = await Course.aggregate([
        {
          $lookup: {
            from: "enrollments",
            localField: "_id",
            foreignField: "course",
            as: "enrollments",
          },
        },
        {
          $project: {
            title: 1,
            enrollmentCount: { $size: "$enrollments" },
          },
        },
        { $sort: { enrollmentCount: -1 } },
        { $limit: 10 },
      ]);

      res.json({ success: true, data: courseStats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = analyticsController;
