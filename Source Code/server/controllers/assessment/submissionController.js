const Submission = require("../../models/assessment/problems/Submission");
const Problem = require("../../models/assessment/problems/Problem");
const UserPoints = require("../../models/learning/gamification/UserPoints");
const Department = require("../../models/academic/Department");
const User = require("../../models/auth/User");
const { executeCode } = require("../../utils/codeExecutor");

const submissionController = {
  getAllSubmissions: async (req, res) => {
    try {
      const { userId, problemId, status, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (userId) filter.student = userId;
      if (problemId) filter.problem = problemId;
      if (status) filter.status = status;

      const submissions = await Submission.find(filter)
        .populate("student", "name email")
        .populate("problem", "title difficulty")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ submittedAt: -1 });

      const total = await Submission.countDocuments(filter);

      res.json({
        success: true,
        data: submissions,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSubmissionById: async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.id)
        .populate("student", "name email")
        .populate("problem", "title difficulty");

      if (!submission) {
        return res
          .status(404)
          .json({ success: false, message: "Submission not found" });
      }

      res.json({ success: true, data: submission });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createSubmission: async (req, res) => {
    try {
      const { problem: problemId, code, language } = req.body;
      const problem = await Problem.findById(problemId);

      if (!problem) {
        return res
          .status(404)
          .json({ success: false, message: "Problem not found" });
      }

      // Execute code
      const testCases = problem.testCases && problem.testCases.length > 0
        ? problem.testCases
        : problem.examples || [];

      const executionResult = await executeCode(code, language, testCases);

      const submission = new Submission({
        student: req.user?.id,
        problem: problemId,
        code,
        language,
        status: executionResult.status,
        runtime: executionResult.runtime,
        memory: executionResult.memory,
        testsPassed: executionResult.testsPassed,
        totalTests: executionResult.totalTests,
        output: executionResult.output,
        error: executionResult.error,
        submittedAt: new Date(),
      });

      await submission.save();

      // Trigger Background Processes: Plagiarism & Student Analytics
      const studentAnalyticsService = require("../../services/learning/studentAnalyticsService");
      const plagiarismService = require("../../services/ai/plagiarismService");

      // We run these in background to keep API response fast
      Promise.all([
        studentAnalyticsService.analyzePerformance(req.user.id, problem.course),
        plagiarismService.checkPlagiarism(submission._id)
      ]).catch(err => {
        console.error("[Submission Background Services] Error:", err.message);
      });

      // Award points if accepted
      if (executionResult.status === "accepted") {
        const gamificationService = require("../../services/learning/gamificationService");

        // Multiplier logic can stay here or move to service. Let's keep it simple for now.
        const baseXP = 10;
        await gamificationService.awardXP(req.user.id, baseXP, 'problem');
      }

      res.status(201).json({ success: true, data: submission });
    } catch (error) {
      console.error('Submission error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateSubmissionStatus: async (req, res) => {
    try {
      const { status, score, executionTime, memoryUsed, testResults } =
        req.body;

      const submission = await Submission.findByIdAndUpdate(
        req.params.id,
        {
          status,
          score,
          executionTime,
          memoryUsed,
          testResults,
          evaluatedAt: new Date(),
        },
        { new: true },
      );

      if (!submission) {
        return res
          .status(404)
          .json({ success: false, message: "Submission not found" });
      }

      if (status === "accepted") {
        let userPoints = await UserPoints.findOne({ userId: submission.student });
        if (!userPoints) {
          userPoints = new UserPoints({
            userId: submission.student,
            experiencePoints: 0,
            totalPoints: 0
          });
        }

        // Calculate Multiplier
        let multiplier = 1.0;
        const userObj = await User.findById(submission.student).select('department');
        if (userObj?.department) {
          const dept = await Department.findById(userObj.department).select('gamificationConfig');
          if (dept?.gamificationConfig?.globalXpMultiplier && (!dept.gamificationConfig.multiplierExpiry || dept.gamificationConfig.multiplierExpiry > new Date())) {
            multiplier = dept.gamificationConfig.globalXpMultiplier;
          }
        }

        const xpAwarded = Math.floor(10 * multiplier);
        userPoints.experiencePoints += xpAwarded;
        userPoints.totalPoints += xpAwarded;
        userPoints.pointsBreakdown.problemsSolved += 1;
        userPoints.updateLevel();
        await userPoints.save();
      }

      res.json({ success: true, data: submission });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserSubmissions: async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 20 } = req.query;

      const submissions = await Submission.find({ student: userId })
        .populate("problem", "title difficulty")
        .sort({ submittedAt: -1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: submissions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getProblemSubmissions: async (req, res) => {
    try {
      const { problemId } = req.params;
      const { limit = 20 } = req.query;

      const submissions = await Submission.find({ problem: problemId })
        .populate("student", "name email")
        .sort({ submittedAt: -1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: submissions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getMyAllSubmissions: async (req, res) => {
    try {
      const filter = { student: req.user.id };
      if (req.query.status) {
        filter.status = req.query.status;
      }
      const submissions = await Submission.find(filter)
        .populate("problem", "difficulty title")
        .select("status problem language submittedAt runtime")
        .sort({ submittedAt: -1 })
        .limit(50)
        .lean();
      res.json({ success: true, data: submissions });
    } catch (error) {
      console.error("getMyAllSubmissions error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  getMyProblemSubmissions: async (req, res) => {
    try {
      const { problemId } = req.params;
      const submissions = await Submission.find({
        problem: problemId,
        student: req.user.id,
      })
        .sort({ submittedAt: -1 })
        .limit(10);

      res.json({ success: true, data: submissions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSubmissionsByCourse: async (req, res) => {
    try {
      const { courseId } = req.params;
      const { limit = 50 } = req.query;

      // 1. Find all problems associated with this course
      const problems = await Problem.find({ course: courseId }).select('_id');
      const problemIds = problems.map(p => p._id);

      // 2. Find all submissions for these problems
      const submissions = await Submission.find({ problem: { $in: problemIds } })
        .populate("student", "name email")
        .populate("problem", "title difficulty")
        .sort({ submittedAt: -1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: submissions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = submissionController;
