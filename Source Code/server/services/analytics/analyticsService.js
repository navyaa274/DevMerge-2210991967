const Submission = require("../../models/assessment/problems/Submission");
const User = require("../../models/auth/User");
const Course = require("../../models/academic/Course");

class AnalyticsService {
  async getUserStats(userId) {
    const totalSubmissions = await Submission.countDocuments({ student: userId });
    const acceptedSubmissions = await Submission.countDocuments({
      student: userId,
      status: "accepted",
    });

    const submissions = await Submission.find({ student: userId });
    const avgScore =
      submissions.length > 0
        ? submissions.reduce((sum, s) => sum + (s.score || 0), 0) /
        submissions.length
        : 0;

    return {
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate:
        totalSubmissions > 0
          ? (acceptedSubmissions / totalSubmissions) * 100
          : 0,
      averageScore: avgScore.toFixed(2),
    };
  }

  async getCourseStats(courseId) {
    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    const enrollmentCount =
      await require("../../models/learning/enrollments/Enrollment").countDocuments({
        course: courseId,
      });
    const submissionCount = await Submission.countDocuments({
      course: courseId,
    });

    return {
      courseName: course.title,
      enrollmentCount,
      submissionCount,
    };
  }

  async getLeaderboard(limit = 10) {
    const leaderboard = await Submission.aggregate([
      { $match: { status: "accepted" } },
      { $group: { _id: "$student", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          solvedCount: "$count",
        },
      },
    ]);

    return leaderboard;
  }

  async getDailyActivityStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await Submission.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return stats;
  }

  async getSystemOverview() {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    return {
      totalUsers,
      totalCourses,
      totalSubmissions,
      timestamp: new Date(),
    };
  }
}

module.exports = new AnalyticsService();
