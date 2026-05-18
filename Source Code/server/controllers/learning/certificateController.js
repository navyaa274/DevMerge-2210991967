const Certificate = require("../../models/learning/pathway/Certificate");
const Course = require("../../models/academic/Course");
const Submission = require("../../models/assessment/problems/Submission");
const User = require("../../models/auth/User");
const asyncHandler = require("../../errors/asyncHandler");
const { v4: uuidv4 } = require("uuid");

/**
 * Certificate & Portfolio Controller
 * Implements Phase 5 Item 18 (Digital Certificates) and Item 20 (Portfolio Export)
 */

// 1. Issue Certificate (Triggered by Faculty or Automated Course Completion)
exports.issueCertificate = asyncHandler(async (req, res) => {
  const { userId, courseId, title, skills, score } = req.body;

  // Check if certificate already exists
  const existing = await Certificate.findOne({ userId, courseId });
  if (existing) {
    return res
      .status(400)
      .json({
        success: false,
        message: "Certificate already issued for this course",
      });
  }

  const certificateNumber =
    `DMV-${courseId.toString().substring(0, 4)}-${uuidv4().substring(0, 8)}`.toUpperCase();

  const certificate = await Certificate.create({
    userId,
    courseId,
    title: title || "Course Completion Certificate",
    skills: skills || [],
    score: score || 0,
    certificateNumber,
    issuedBy: req.user.id,
    verificationUrl: `${process.env.APP_URL || "http://localhost:3000"}/verify/${certificateNumber}`,
  });

  res.status(201).json({ success: true, data: certificate });
});

// 2. Automated Course Completion Check
exports.checkCourseCompletion = asyncHandler(async (req, res) => {
  const { userId, courseId } = req.params;

  const course = await Course.findById(courseId).populate("problems");
  if (!course)
    return res
      .status(404)
      .json({ success: false, message: "Course not found" });

  // Threshold: All course problems must have at least one 'Accepted' submission
  const courseProblemIds = course.problems.map((p) => p._id);
  const acceptedSubmissions = await Submission.find({
    student: userId, // Match 'student' field in Submission model
    problem: { $in: courseProblemIds },
    status: "Accepted",
  }).select("problem");

  const solvedProblemIds = new Set(
    acceptedSubmissions.map((s) => s.problem.toString()),
  );
  const completionPercent =
    (solvedProblemIds.size / (courseProblemIds.length || 1)) * 100;

  if (completionPercent >= 100 && courseProblemIds.length > 0) {
    // Auto-trigger issue
    const certificateNumber =
      `DMA-${courseId.toString().substring(0, 4)}-${uuidv4().substring(0, 8)}`.toUpperCase();

    const certificate = await Certificate.findOneAndUpdate(
      { userId, courseId },
      {
        issueDate: new Date(),
        certificateNumber,
        title: `${course.name} Mastery Certificate`,
        score: 100,
        verificationUrl: `${process.env.APP_URL || "http://localhost:3000"}/verify/${certificateNumber}`,
      },
      { upsert: true, new: true },
    );

    return res.json({ success: true, completed: true, certificate });
  }

  res.json({
    success: true,
    completed: false,
    progress: completionPercent.toFixed(2),
    total: courseProblemIds.length,
    solved: solvedProblemIds.size,
  });
});

// 3. Get Student Certificates
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ userId: req.user.id })
    .populate("courseId", "name code")
    .sort({ issueDate: -1 });

  res.json({ success: true, data: certificates });
});

// 4. Verify Certificate (Public Entry Point)
exports.verifyCertificate = asyncHandler(async (req, res) => {
  const { certificateNumber } = req.params;
  const cert = await Certificate.findOne({ certificateNumber })
    .populate("userId", "name email avatar")
    .populate("courseId", "name description credits");

  if (!cert)
    return res
      .status(404)
      .json({ success: false, message: "Invalid Certificate" });

  res.json({ success: true, data: cert });
});
