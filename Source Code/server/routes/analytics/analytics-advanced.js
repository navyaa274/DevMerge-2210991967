const express = require('express');
const Analytics = require('../../models/analytics/Analytics');
const Submission = require('../../models/assessment/problems/Submission');
const Problem = require('../../models/assessment/problems/Problem');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

// Get student heatmap
router.get('/student/:studentId/heatmap', authenticate, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.params.studentId })
      .populate('problem', 'topics difficulty');

    const heatmap = {};
    submissions.forEach(sub => {
      const date = new Date(sub.submittedAt).toISOString().split('T')[0];
      heatmap[date] = (heatmap[date] || 0) + 1;
    });

    res.json(heatmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get topic weakness analysis
router.get('/student/:studentId/weakness', authenticate, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.params.studentId })
      .populate('problem', 'topics difficulty');

    const topicStats = {};
    submissions.forEach(sub => {
      sub.problem.topics.forEach(topic => {
        if (!topicStats[topic]) {
          topicStats[topic] = { attempts: 0, accepted: 0 };
        }
        topicStats[topic].attempts += 1;
        if (sub.status === 'Accepted') {
          topicStats[topic].accepted += 1;
        }
      });
    });

    const weakness = Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        successRate: (stats.accepted / stats.attempts * 100).toFixed(2),
        attempts: stats.attempts
      }))
      .sort((a, b) => a.successRate - b.successRate);

    res.json(weakness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get performance trend
router.get('/student/:studentId/trend', authenticate, async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.params.studentId })
      .sort({ submittedAt: 1 });

    const trend = submissions.map(sub => ({
      date: sub.submittedAt,
      status: sub.status,
      runtime: sub.runtime
    }));

    res.json(trend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course performance
router.get('/course/:courseId/performance', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const problems = await Problem.find({ course: req.params.courseId });
    const problemIds = problems.map(p => p._id);

    const submissions = await Submission.find({ problem: { $in: problemIds } })
      .populate('student', 'name email');

    const studentPerformance = {};
    submissions.forEach(sub => {
      if (!studentPerformance[sub.student._id]) {
        studentPerformance[sub.student._id] = {
          name: sub.student.name,
          email: sub.student.email,
          attempts: 0,
          accepted: 0
        };
      }
      studentPerformance[sub.student._id].attempts += 1;
      if (sub.status === 'Accepted') {
        studentPerformance[sub.student._id].accepted += 1;
      }
    });

    const performance = Object.values(studentPerformance)
      .map(p => ({
        ...p,
        successRate: (p.accepted / p.attempts * 100).toFixed(2)
      }))
      .sort((a, b) => b.successRate - a.successRate);

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get department comparison
router.get('/department/comparison', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const analytics = await Analytics.find({ type: 'department' })
      .populate('departmentId', 'name');

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
