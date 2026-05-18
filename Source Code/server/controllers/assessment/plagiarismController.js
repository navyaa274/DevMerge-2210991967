const PlagiarismReport = require('../../models/assessment/plagiarismReports');
const PlagiarismMatch = require('../../models/assessment/plagiarismMatches');
const Submission = require('../../models/assessment/problems/Submission');
const Course = require('../../models/academic/Course');
const User = require('../../models/auth/User');
const mongoose = require('mongoose');

// Mock plagiarism detection function - replace with actual API calls
const detectPlagiarism = async (submission, allSubmissions) => {
  const matches = [];
  let totalSimilarity = 0;
  let matchCount = 0;

  // Simple text-based similarity check (replace with MOSS/Copyleaks integration)
  for (const otherSubmission of allSubmissions) {
    if (otherSubmission._id.toString() === submission._id.toString()) continue;
    if (otherSubmission.student.toString() === submission.student.toString()) continue;

    const similarity = calculateTextSimilarity(submission.code, otherSubmission.code);

    if (similarity > 10) { // Threshold for significant match
      matches.push({
        submission_id: submission._id,
        matched_submission_id: otherSubmission._id,
        user_id: submission.student,
        matched_user_id: otherSubmission.student,
        similarity_score: similarity,
        match_type: similarity > 70 ? 'exact' : similarity > 40 ? 'near_exact' : 'partial',
        matched_lines: [], // Would be populated by actual plagiarism detector
        matched_percentage: similarity,
        detection_method: 'internal',
        is_significant: similarity > 30
      });

      totalSimilarity += similarity;
      matchCount++;
    }
  }

  return {
    matches,
    averageSimilarity: matchCount > 0 ? totalSimilarity / matchCount : 0,
    maxSimilarity: matches.length > 0 ? Math.max(...matches.map(m => m.similarity_score)) : 0
  };
};

// Simple text similarity calculation (replace with proper algorithm)
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return (intersection.size / union.size) * 100;
};

/**
 * Plagiarism Detection Controller
 * Implements Phase 4 Item 32 (Smart Plagiarism Engine)
 */

class PlagiarismController {
  // Check a submission for plagiarism
  async checkSubmission(req, res) {
    try {
      const { submissionId } = req.body;
      const userId = req.user._id;

      if (!submissionId) {
        return res.status(400).json({
          success: false,
          message: 'Submission ID is required'
        });
      }

      // Get the submission
      const submission = await Submission.findById(submissionId)
        .populate('problem')
        .populate('student', 'name email');

      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }

      // Check if user has permission to check this submission
      const course = await Course.findById(submission.problem.course);
      const isInstructor = course.instructors.some(inst => inst.toString() === userId.toString());
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

      if (!isInstructor && !isAdmin && submission.student._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only check your own submissions or submissions in courses you teach.'
        });
      }

      // Check if plagiarism report already exists
      const existingReport = await PlagiarismReport.findOne({ submission_id: submissionId });
      if (existingReport) {
        return res.json({
          success: true,
          message: 'Plagiarism check already performed',
          data: existingReport
        });
      }

      // Get all submissions for the same problem
      const allSubmissions = await Submission.find({
        problem: submission.problem._id,
        status: 'completed'
      });

      // Perform plagiarism detection
      const detectionResult = await detectPlagiarism(submission, allSubmissions);

      // Create plagiarism report
      const report = new PlagiarismReport({
        submission_id: submissionId,
        user_id: submission.student._id,
        problem_id: submission.problem._id,
        course_id: submission.problem.course,
        plagiarism_score: detectionResult.averageSimilarity,
        confidence_level: detectionResult.maxSimilarity > 70 ? 'high' : detectionResult.maxSimilarity > 40 ? 'medium' : 'low',
        status: detectionResult.matches.length > 0 ? 'completed' : 'cleared',
        detection_method: 'internal',
        matches_found: detectionResult.matches.length,
        top_match_score: detectionResult.maxSimilarity,
        flagged_by_system: detectionResult.maxSimilarity > 50
      });

      await report.save();

      // Create plagiarism matches
      for (const match of detectionResult.matches) {
        const plagiarismMatch = new PlagiarismMatch({
          ...match,
          plagiarism_report_id: report._id
        });
        await plagiarismMatch.save();
      }

      // Populate and return the report
      await report.populate([
        { path: 'submission_id', populate: { path: 'student', select: 'name email' } },
        { path: 'user_id', select: 'name email' },
        { path: 'problem_id', select: 'title' },
        { path: 'course_id', select: 'title' }
      ]);

      res.json({
        success: true,
        message: 'Plagiarism check completed',
        data: report
      });

    } catch (error) {
      console.error('Error checking plagiarism:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error during plagiarism check',
        error: error.message
      });
    }
  }

  // Get all plagiarism reports with filtering
  async getReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        course_id,
        problem_id,
        status,
        flagged_only = false,
        user_id
      } = req.query;

      const userId = req.user._id;
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

      let filter = {};

      // If not admin, only show reports for courses user teaches or their own submissions
      if (!isAdmin) {
        const taughtCourses = await Course.find({ instructors: userId }).select('_id');
        const taughtCourseIds = taughtCourses.map(c => c._id);

        filter.$or = [
          { course_id: { $in: taughtCourseIds } },
          { user_id: userId }
        ];
      }

      if (course_id) filter.course_id = course_id;
      if (problem_id) filter.problem_id = problem_id;
      if (status) filter.status = status;
      if (flagged_only === 'true') filter.flagged_by_system = true;
      if (user_id) filter.user_id = user_id;

      const reports = await PlagiarismReport.find(filter)
        .populate('submission_id', 'code language status')
        .populate('user_id', 'name email')
        .populate('problem_id', 'title')
        .populate('course_id', 'title')
        .populate('reviewed_by', 'name')
        .sort({ created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();

      const total = await PlagiarismReport.countDocuments(filter);

      res.json({
        success: true,
        data: {
          reports,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error fetching plagiarism reports:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get a specific plagiarism report by ID
  async getReportById(req, res) {
    try {
      const { reportId } = req.params;
      const userId = req.user._id;
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

      const report = await PlagiarismReport.findById(reportId)
        .populate('submission_id')
        .populate('user_id', 'name email')
        .populate('problem_id', 'title')
        .populate('course_id', 'title')
        .populate('reviewed_by', 'name');

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Plagiarism report not found'
        });
      }

      // Check permissions
      if (!isAdmin) {
        const course = await Course.findById(report.course_id);
        const isInstructor = course.instructors.some(inst => inst.toString() === userId.toString());

        if (!isInstructor && report.user_id._id.toString() !== userId.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }

      // Get associated matches
      const matches = await PlagiarismMatch.find({ plagiarism_report_id: reportId })
        .populate('matched_user_id', 'name email')
        .populate('submission_id', 'language status')
        .populate('matched_submission_id', 'language status');

      res.json({
        success: true,
        data: {
          report,
          matches
        }
      });

    } catch (error) {
      console.error('Error fetching plagiarism report:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Review and update a plagiarism report
  async reviewReport(req, res) {
    try {
      const { reportId } = req.params;
      const { action_taken, review_notes, status } = req.body;
      const reviewerId = req.user._id;

      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

      const report = await PlagiarismReport.findById(reportId);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: 'Plagiarism report not found'
        });
      }

      // Check permissions - only instructors of the course or admins can review
      if (!isAdmin) {
        const course = await Course.findById(report.course_id);
        const isInstructor = course.instructors.some(inst => inst.toString() === reviewerId.toString());

        if (!isInstructor) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Only course instructors can review plagiarism reports.'
          });
        }
      }

      // Update the report
      report.reviewed_by = reviewerId;
      report.reviewed_at = new Date();
      if (review_notes) report.review_notes = review_notes;
      if (status) report.status = status;
      if (action_taken) report.action_taken = action_taken;
      report.updated_at = new Date();

      await report.save();

      // If action taken involves notifying user, mark as notified
      if (action_taken && action_taken !== 'none') {
        report.notified_user = true;
        await report.save();

        // TODO: Send notification to user about the plagiarism finding
        // This would integrate with the notification system
      }

      await report.populate('reviewed_by', 'name');

      res.json({
        success: true,
        message: 'Plagiarism report reviewed successfully',
        data: report
      });

    } catch (error) {
      console.error('Error reviewing plagiarism report:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new PlagiarismController();
