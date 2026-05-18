const express = require('express');
const Submission = require('../../models/assessment/problems/Submission');
const Problem = require('../../models/assessment/problems/Problem');
const UserPoints = require('../../models/learning/gamification/UserPoints');
const Achievement = require('../../models/learning/gamification/Achievement');
const { authenticate, authorize } = require('../../middleware/auth');
const { paginate, paginatedResponse } = require('../../middleware/pagination');
const { cache, cacheKeys, invalidateCache } = require('../../utils/cache');

const router = express.Router();

// Get current user's submission history with filters
router.get('/', authenticate, async (req, res) => {
  try {
    const { filter } = req.query;
    const query = { student: req.user.id };

    if (filter && filter !== 'all') {
      if (filter === 'accepted') query.status = 'Accepted';
      else if (filter === 'pending') query.status = 'Pending';
      else if (filter === 'rejected') query.status = { $in: ['Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'] };
      else if (filter === 'graded') query.grade = { $ne: null };
    }

    const submissions = await Submission.find(query)
      .populate('problem', 'title difficulty')
      .populate('student', 'name email')
      .sort({ submittedAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ALL of the current user's submissions across all problems (for dashboard stats)
// Must be before /:id routes
// Optional query: ?status=Accepted to filter by status
router.get('/problem/all/my', authenticate, async (req, res) => {
  try {
    const filter = { student: req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const submissions = await Submission.find(filter)
      .populate('problem', 'difficulty title')
      .select('status problem language submittedAt runtime')
      .sort({ submittedAt: -1 })
      .limit(50)
      .lean();
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user's submissions for a specific problem
router.get('/problem/:problemId/my', authenticate, async (req, res) => {
  try {
    const { problemId } = req.params;
    let actualProblemId = problemId;

    // Resolve slug to ID if it's not a valid ObjectId
    if (!problemId.match(/^[0-9a-fA-F]{24}$/)) {
      const problem = await Problem.findOne({ slug: problemId }).select('_id');
      if (!problem) return res.status(404).json({ message: 'Problem not found' });
      actualProblemId = problem._id;
    }

    const submissions = await Submission.find({
      problem: actualProblemId,
      student: req.user.id
    }).sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create submission
router.post('/', authenticate, async (req, res) => {
  try {
    console.log('Submission Body:', req.body);
    let { problem, code, language, status, runtime, memory, testResults } = req.body;

    // Resolve slug to ID if it's not a valid ObjectId
    if (problem && !problem.toString().match(/^[0-9a-fA-F]{24}$/)) {
      const problemDoc = await Problem.findOne({ slug: problem }).select('_id');
      if (!problemDoc) return res.status(404).json({ message: 'Problem not found' });
      problem = problemDoc._id;
    } else if (!problem) {
      return res.status(400).json({ message: 'Problem ID or slug is required' });
    }

    // Sanitize status to match model enum
    const validStatuses = ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'];
    let sanitizedStatus = status;
    if (status === 'Failed' || status === 'Failure') sanitizedStatus = 'Wrong Answer';
    if (!validStatuses.includes(sanitizedStatus)) sanitizedStatus = 'Pending';

    const submission = new Submission({
      problem,
      student: req.user.id,
      code,
      language,
      status: sanitizedStatus,
      runtime: Number(runtime) || 0,
      memory: Number(memory) || 0,
      testResults: Array.isArray(testResults) ? testResults : [],
      submittedAt: new Date()
    });

    await submission.save();

    // Update problem stats
    const update = { $inc: { totalSubmissions: 1 } };
    if (status === 'Accepted') {
      update.$inc.acceptedSubmissions = 1;
    }

    await Problem.findByIdAndUpdate(problem, update);

    // Unified Gamification Engine Trigger (Phase 5 Item 19)
    const gamificationService = require('../../services/learning/gamificationService');
    await gamificationService.processGamification(req.user.id, {
      type: 'problem_solve',
      status: sanitizedStatus,
      problemId: problem
    });

    invalidateCache.submissions(req.user.id);
    invalidateCache.problem(problem);

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all submissions for a specific course (Faculty)
router.get('/course/:courseId', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const { courseId } = req.params;

    // Find all problems for this course
    const problems = await Problem.find({ course: courseId }).select('_id');
    const problemIds = problems.map(p => p._id);

    // Fetch submissions for these problems
    const submissions = await Submission.find({ problem: { $in: problemIds } })
      .populate('student', 'name email')
      .populate('problem', 'title difficulty')
      .lean()
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      submissions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get problem submissions with pagination (faculty/admin only)
router.get('/problem/:problemId', authenticate, authorize(['faculty', 'admin']), paginate, async (req, res) => {
  try {
    const { page, limit, skip } = req.pagination;
    let { problemId } = req.params;

    // Resolve slug to ID if it's not a valid ObjectId
    if (!problemId.match(/^[0-9a-fA-F]{24}$/)) {
      const problem = await Problem.findOne({ slug: problemId }).select('_id');
      if (!problem) return res.status(404).json({ message: 'Problem not found' });
      problemId = problem._id;
    }

    // Get total count
    const total = await Submission.countDocuments({ problem: problemId });

    // Get paginated results
    const submissions = await Submission.find({ problem: problemId })
      .populate('student', 'name email')
      .lean()
      .skip(skip)
      .limit(limit)
      .sort({ submittedAt: -1 });

    const response = paginatedResponse(submissions, total, page, limit);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get submission by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem')
      .populate('student', 'name email')
      .lean();

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update submission status (for code execution results)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const submission = await Submission.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    invalidateCache.submissions(submission.student);
    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manual grade for problem submission (faculty only)
router.put('/:id/grade', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }
    submission.grade = grade;
    submission.feedback = feedback;
    submission.gradedBy = req.user.id;
    submission.gradedAt = new Date();
    await submission.save();
    invalidateCache.submissions(submission.student);
    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle submission visibility (Peer Learning - Phase 6 Item 12)
router.patch('/:id/public', authenticate, async (req, res) => {
  try {
    const submission = await Submission.findOne({ _id: req.params.id, student: req.user.id });
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.isPublic = !submission.isPublic;
    await submission.save();
    res.json({ success: true, isPublic: submission.isPublic });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/submissions/problem/:problemId/solutions
 * @desc    Get public solutions for a problem (Only if user has solved it)
 */
router.get('/problem/:problemId/solutions', authenticate, async (req, res) => {
  try {
    const { problemId } = req.params;

    // 1. Spoilers Check: Has the user solved it?
    const userSolved = await Submission.exists({
      problem: problemId,
      student: req.user.id,
      status: 'Accepted'
    });

    if (!userSolved) {
      return res.status(403).json({
        message: 'Neural Lock: You must solve this problem yourself before viewing peer solutions.'
      });
    }

    // 2. Fetch public solutions
    const solutions = await Submission.find({
      problem: problemId,
      isPublic: true,
      status: 'Accepted'
    })
      .populate('student', 'name profilePicture')
      .sort({ 'likes.length': -1, submittedAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: solutions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
