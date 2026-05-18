const mongoose = require("mongoose");
const User = require("../../models/auth/User");
const Submission = require("../../models/assessment/problems/Submission");
const Problem = require("../../models/assessment/problems/Problem");
const Course = require("../../models/academic/Course");
const asyncHandler = require("../../errors/asyncHandler");
const adminAiService = require("../../services/analytics/adminAiService");

/**
 * Admin & HOD Analytics Controller
 * Implements Phase 7 Item 40 (Admin Dashboard) and Item 19 (Faculty Insights)
 */

exports.getSystemOverview = asyncHandler(async (req, res) => {
  // 1. Core Counts
  const [userCount, problemCount, courseCount, submissionCount] =
    await Promise.all([
      User.countDocuments(),
      Problem.countDocuments(),
      Course.countDocuments(),
      Submission.countDocuments(),
    ]);

  // 2. Growth Metrics (Last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await User.countDocuments({
    lastActive: { $gte: thirtyDaysAgo },
  });
  const newSubmissions = await Submission.countDocuments({
    submittedAt: { $gte: thirtyDaysAgo },
  });

  // 3. Departmental Distribution (Item 1 - Phase 1 context)
  const deptDistribution = await User.aggregate([
    { $group: { _id: "$department", count: { $sum: 1 } } },
  ]);

  // 4. Global Performance Trends
  const performanceTrend = await Submission.aggregate([
    { $match: { submittedAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
        total: { $sum: 1 },
        accepted: { $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    summary: {
      totalUsers: userCount,
      totalProblems: problemCount,
      totalCourses: courseCount,
      totalSubmissions: submissionCount,
      activeUsersLast30Days: activeUsers,
      newSubmissionsLast30Days: newSubmissions,
    },
    deptDistribution,
    performanceTrend,
  });
});

/**
 * AI-Powered Retention & Risk Analysis for Admins
 */
exports.getRetentionInsights = asyncHandler(async (req, res) => {
  const { departmentId } = req.query;
  const insights = await adminAiService.predictRetentionRisks(departmentId);
  res.json({ success: true, data: insights });
});

/**
 * AI-Powered Resource & Scholarship Audit
 */
exports.getInstitutionalAudit = asyncHandler(async (req, res) => {
  const { departmentId, type } = req.query; // type: 'scholarship' or 'resource'

  let data;
  if (type === 'scholarship') {
    data = await adminAiService.auditScholarshipCandidates(departmentId);
  } else {
    // For resource, we might need a specific course or global
    // Defaulting to a general audit for now or specific if courseId provided
    data = { message: "Specify audit type: scholarship" };
  }

  res.json({ success: true, data });
});

exports.getDepartmentAnalytics = asyncHandler(async (req, res) => {
  const { departmentId } = req.params;

  // Enforcement: HODs can only see their own department
  if (
    req.user.role === "hod" &&
    req.user.department.toString() !== departmentId
  ) {
    return res
      .status(403)
      .json({ success: false, message: "Not authorized for this department" });
  }

  const [studentsCount, facultyCount] = await Promise.all([
    User.countDocuments({ department: departmentId, role: "student" }),
    User.countDocuments({ department: departmentId, role: "faculty" }),
  ]);

  // Submission stats for students in this department (single aggregation, no N+1)
  const stats = await User.aggregate([
    {
      $match: {
        department: new mongoose.Types.ObjectId(departmentId),
        role: "student",
      },
    },
    {
      $lookup: {
        from: "submissions",
        localField: "_id",
        foreignField: "student",
        as: "subs",
      },
    },
    { $unwind: "$subs" },
    { $group: { _id: "$subs.status", count: { $sum: 1 } } },
  ]);

  res.json({
    success: true,
    departmentId,
    metrics: {
      students: studentsCount,
      faculty: facultyCount,
      submissionStats: stats,
    },
  });
});

exports.getStudentProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  // Detailed timeline of student performance
  const timeline = await Submission.find({ student: studentId })
    .populate("problem", "title difficulty topics")
    .sort({ submittedAt: -1 })
    .limit(50)
    .lean();

  res.json({
    success: true,
    studentId,
    timeline: timeline.map((t) => ({
      problem: t.problem?.title,
      difficulty: t.problem?.difficulty,
      status: t.status,
      date: t.submittedAt,
      language: t.language,
    })),
  });
});
