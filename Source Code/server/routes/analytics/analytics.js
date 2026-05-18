const express = require('express');
const Submission = require('../../models/assessment/problems/Submission');
const User = require('../../models/auth/User');
const Problem = require('../../models/assessment/problems/Problem');
const Streak = require('../../models/learning/gamification/Streak');
const UserBadge = require('../../models/learning/gamification/UserBadge');
const Badge = require('../../models/learning/gamification/Badge');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

// Get student analytics
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // Get all submissions for basic stats
    const allSubmissions = await Submission.find({ student: studentId }).populate('problem');
    const acceptedSubmissions = allSubmissions.filter(s => s.status === 'Accepted');

    // Difficulty Distribution
    let easy = 0, medium = 0, hard = 0;
    const languages = new Set();

    acceptedSubmissions.forEach(s => {
      if (s.problem) {
        if (s.problem.difficulty === 'Easy') easy++;
        else if (s.problem.difficulty === 'Medium') medium++;
        else if (s.problem.difficulty === 'Hard') hard++;
      }
      if (s.language) languages.add(s.language.charAt(0).toUpperCase() + s.language.slice(1));
    });

    // Streak and Points
    const streakData = await Streak.findOne({ userId: studentId });

    // Calculate Percentile (simplified: based on solve count)
    const allStudentSubmissions = await Submission.aggregate([
      { $match: { status: 'Accepted' } },
      { $group: { _id: '$student', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const totalStudents = allStudentSubmissions.length || 1;
    const userRankIdx = allStudentSubmissions.findIndex(s => s._id.toString() === studentId);

    // Percentile logic: Better than X% of students who have solved at least one problem
    let percentile = 0;
    if (userRankIdx !== -1) {
      percentile = Math.floor(((totalStudents - userRankIdx) / totalStudents) * 100);
    }

    // Achievements
    const userBadges = await UserBadge.find({ userId: studentId }).populate('badgeId');
    const achievements = userBadges.map(ub => ({
      name: ub.badgeId?.name || 'Achievement',
      icon: ub.badgeId?.icon || '🏅'
    }));

    res.json({
      totalSubmissions: allSubmissions.length,
      acceptedSubmissions: acceptedSubmissions.length,
      problemsSolved: acceptedSubmissions.length,
      acceptanceRate: allSubmissions.length > 0 ? ((acceptedSubmissions.length / allSubmissions.length) * 100).toFixed(1) : 0,
      totalPoints: acceptedSubmissions.length * 10,
      currentStreak: streakData?.currentStreak || 0,
      easyProblems: easy,
      mediumProblems: medium,
      hardProblems: hard,
      topSkills: Array.from(languages).slice(0, 5),
      achievements: achievements.slice(0, 5),
      percentile: percentile
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student recent activity
router.get('/student/:studentId/recent', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const submissions = await Submission.find({ student: req.params.studentId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('problem', 'title difficulty');

    const activities = submissions.map(sub => ({
      type: 'submission',
      title: sub.status === 'Accepted' ? 'Problem Solved!' : 'Submission Made',
      description: `${sub.problem?.title || 'Problem'} - ${sub.status}`,
      timestamp: sub.createdAt,
      status: sub.status
    }));

    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty analytics
router.get('/faculty/:facultyId', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const problems = await Problem.find({ createdBy: req.params.facultyId });
    const totalProblems = problems.length;
    const avgAcceptanceRate = problems.length > 0
      ? (problems.reduce((sum, p) => sum + p.acceptanceRate, 0) / problems.length).toFixed(2)
      : 0;

    res.json({
      totalProblems,
      avgAcceptanceRate,
      problems: problems.map(p => ({
        title: p.title,
        difficulty: p.difficulty,
        acceptanceRate: p.acceptanceRate,
        totalSubmissions: p.totalSubmissions
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get faculty overview analytics (for analytics dashboard)
router.get('/faculty', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { course, range } = req.query;

    // Get faculty's courses
    const Course = require('../../models/academic/Course');
    let courseFilter = { faculty: facultyId };
    if (course && course !== 'all') {
      courseFilter._id = course;
    }
    const courses = await Course.find(courseFilter);
    const courseIds = courses.map(c => c._id);

    // Get enrollments
    const Enrollment = require('../../models/learning/enrollments/Enrollment');
    const enrollments = await Enrollment.find({ course: { $in: courseIds } });
    const totalStudents = new Set(enrollments.map(e => e.student.toString())).size;

    // Get assignments
    const Assignment = require('../../models/assessment/assignments/Assignment');
    const assignments = await Assignment.find({ course: { $in: courseIds } });
    const totalAssignments = assignments.length;

    // Get submissions
    const Submission = require('../../models/assessment/problems/Submission');
    const submissions = await Submission.find({
      assignment: { $in: assignments.map(a => a._id) }
    }).populate('assignment');

    // Calculate submission stats
    const now = new Date();
    let onTime = 0, late = 0, missing = 0;
    const grades = [];

    submissions.forEach(sub => {
      if (sub.grade !== undefined && sub.grade !== null) {
        grades.push(sub.grade);
      }
      if (sub.submittedAt && sub.assignment?.dueDate) {
        if (sub.submittedAt <= sub.assignment.dueDate) {
          onTime++;
        } else {
          late++;
        }
      }
    });

    // Calculate missing submissions
    const expectedSubmissions = totalStudents * totalAssignments;
    missing = Math.max(0, expectedSubmissions - submissions.length);

    // Calculate average grade
    const averageGrade = grades.length > 0
      ? (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(1)
      : 0;

    // Grade distribution
    const gradeRanges = [
      { range: '90-100', min: 90, max: 100, count: 0 },
      { range: '80-89', min: 80, max: 89, count: 0 },
      { range: '70-79', min: 70, max: 79, count: 0 },
      { range: '60-69', min: 60, max: 69, count: 0 },
      { range: 'Below 60', min: 0, max: 59, count: 0 }
    ];

    grades.forEach(grade => {
      const range = gradeRanges.find(r => grade >= r.min && grade <= r.max);
      if (range) range.count++;
    });

    const gradeDistribution = gradeRanges.map(r => ({
      range: r.range,
      count: r.count,
      percentage: grades.length > 0 ? ((r.count / grades.length) * 100).toFixed(1) : 0
    }));

    // Top students
    const studentGrades = {};
    submissions.forEach(sub => {
      if (sub.student && sub.grade !== undefined) {
        if (!studentGrades[sub.student]) {
          studentGrades[sub.student] = { grades: [], submissions: 0 };
        }
        studentGrades[sub.student].grades.push(sub.grade);
        studentGrades[sub.student].submissions++;
      }
    });

    const topStudentsData = await Promise.all(
      Object.entries(studentGrades)
        .map(([studentId, data]) => ({
          studentId,
          averageGrade: (data.grades.reduce((sum, g) => sum + g, 0) / data.grades.length).toFixed(1),
          submissions: data.submissions
        }))
        .sort((a, b) => b.averageGrade - a.averageGrade)
        .slice(0, 10)
        .map(async (s) => {
          const user = await User.findById(s.studentId).select('name email');
          return {
            _id: s.studentId,
            name: user?.name || 'Unknown',
            averageGrade: s.averageGrade,
            submissions: s.submissions
          };
        })
    );

    res.json({
      totalStudents,
      activeCourses: courses.length,
      totalAssignments,
      averageGrade,
      submissions: {
        onTime,
        late,
        missing
      },
      gradeDistribution,
      topStudents: topStudentsData,
      engagement: {
        forumPosts: 0,
        questions: 0,
        peerReviews: 0
      },
      resources: {
        downloads: 0,
        videosWatched: 0,
        avgTimeSpent: 0
      }
    });
  } catch (error) {
    console.error('Faculty analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get skill gap analysis
router.get('/skill-gap', authenticate, async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get all accepted submissions to determine strong/weak topics
    const accepted = await Submission.find({ student: studentId, status: 'Accepted' }).populate('problem');

    const initialTopics = ['Data Structures', 'Algorithms', 'Graph', 'Dynamic Programming', 'Database', 'Logic'];
    const topicProficiency = {};
    initialTopics.forEach(t => topicProficiency[t] = 0);

    accepted.forEach(sub => {
      if (sub.problem && sub.problem.topics) {
        sub.problem.topics.forEach(t => {
          const normalizedInput = t.trim().toLowerCase();

          let matchedKey = null;
          for (let key of initialTopics) {
            const normalizedKey = key.toLowerCase();
            // Direct match or partial containing match
            if (normalizedKey === normalizedInput ||
              normalizedInput.includes(normalizedKey) ||
              normalizedKey.includes(normalizedInput)) {
              matchedKey = key;
              break;
            }
          }

          if (matchedKey) {
            topicProficiency[matchedKey] = Math.min(100, (topicProficiency[matchedKey] || 0) + 25);
          } else {
            // New topic not in initial list, only add if it's substantial
            if (t.length > 2) {
              topicProficiency[t.trim()] = Math.min(100, (topicProficiency[t.trim()] || 0) + 25);
            }
          }
        });
      }
    });

    const proficiencyArray = Object.keys(topicProficiency).map(name => ({
      name,
      score: topicProficiency[name]
    })).sort((a, b) => b.score - a.score); // Sort by score DESC

    const sortedProficiency = [...proficiencyArray];
    const weakTopics = [...proficiencyArray].sort((a, b) => a.score - b.score).map(p => p.name);

    const latestProblems = await Problem.find({ isApproved: true }).limit(5);

    // Generate AI Recommendations based on the top 2 weak topics
    const recommendations = [];
    const topGapTopics = weakTopics.slice(0, 2);

    for (const topic of topGapTopics) {
      const topicProblem = await Problem.findOne({
        topics: topic,
        isApproved: true,
        _id: { $nin: accepted.map(s => s.problem?._id).filter(id => id) }
      }).select('slug title');

      if (topic === 'Graph') {
        recommendations.push({
          title: 'Master Graph Traversal',
          description: 'Your analysis shows a gap in pathfinding logic. Practice BFS and DFS to optimize graph exploration.',
          problemSlug: topicProblem?.slug || 'optimal-pathfinding'
        });
      } else if (topic === 'Dynamic Programming') {
        recommendations.push({
          title: 'Optimize with Memoization',
          description: 'You are losing points on time complexity. Learn to break down problems into overlapping subproblems.',
          problemSlug: topicProblem?.slug || 'knapsack-problem'
        });
      } else if (topic === 'Data Structures') {
        recommendations.push({
          title: 'Strengthen Linear Structs',
          description: 'Review Linked Lists and Arrays. Focus on in-place manipulations and sorting algorithms.',
          problemSlug: topicProblem?.slug || 'merge-sorted-arrays'
        });
      } else {
        recommendations.push({
          title: `Focus on ${topic}`,
          description: `Our AI detected low activity in ${topic}. Solving 2-3 Medium problems here will boost your composite score significantly.`,
          problemSlug: topicProblem?.slug || 'optimal-pathfinding'
        });
      }
    }

    const analysis = {
      overallScore: Math.floor(proficiencyArray.reduce((acc, curr) => acc + curr.score, 0) / (proficiencyArray.length || 1)),
      strongestTopic: sortedProficiency[0]?.name || 'N/A',
      weakestTopic: sortedProficiency[sortedProficiency.length - 1]?.name || 'N/A',
      topicProficiency: proficiencyArray,
      recommendations: recommendations.length > 0 ? recommendations : [
        {
          title: 'Start Your Journey',
          description: 'Solve your first few problems to let our AI analyze your coding patterns and identify gaps.',
          problemSlug: 'merge-sorted-arrays'
        }
      ]
    };

    res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
