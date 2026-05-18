const express = require('express');
const router = express.Router();
const Achievement = require('../../../models/learning/gamification/Achievement');
const Badge = require('../../../models/learning/gamification/Badge');
const UserBadge = require('../../../models/learning/gamification/UserBadge');
const { authorize } = require('../middleware/rbac');
const asyncHandler = require('../errors/asyncHandler');

// Achievements Routes
router.get('/achievements/user/:userId', asyncHandler(async (req, res) => {
  const achievements = await Achievement.find({ userId: req.params.userId }).sort({ unlockedAt: -1 });
  res.json(achievements);
}));

router.post('/achievements/:userId/:type', asyncHandler(async (req, res) => {
  const { userId, type } = req.params;
  const { title, description, icon, points } = req.body;
  let achievement = await Achievement.findOne({ userId, type });
  if (!achievement) {
    achievement = new Achievement({ userId, type, title, description, icon, points });
    await achievement.save();
  }
  res.json(achievement);
}));

const ACHIEVEMENT_TEMPLATES = [
  { type: 'first_submission', title: 'First Deployment', description: 'Complete your first problem submission.', icon: '🚀', points: 50, requirement: 'Submit any problem solution' },
  { type: 'perfect_score', title: 'Flawless Execution', description: 'Pass all test cases on your first attempt.', icon: '💎', points: 100, requirement: '100% test pass on first try' },
  { type: 'streak_milestone', title: 'Consistent Coder', description: 'Maintain a 7-day problem-solving streak.', icon: '🔥', points: 200, requirement: '7 day activity streak' },
  { type: 'problem_master', title: 'Algorithm Architect', description: 'Solve 50 coding problems.', icon: '🧠', points: 500, requirement: '50 successful submissions' },
  { type: 'contest_winner', title: 'Champion Status', description: 'Win a university coding contest.', icon: '🏆', points: 1000, requirement: '1st place in any contest' },
  { type: 'helper', title: 'Peer Mentor', description: 'Get 5 helpful votes on your forum posts.', icon: '🤝', points: 150, requirement: '5 helpful markings' }
];

router.get('/achievements', asyncHandler(async (req, res) => {
  res.json(ACHIEVEMENT_TEMPLATES);
}));

// Leaderboard Routes (Gamification)
router.get('/leaderboard', authenticate, asyncHandler(async (req, res) => {
  // Get global leaderboard
  const leaderboard = [
    { rank: 1, user: 'Alice Johnson', points: 2500, achievements: 15 },
    { rank: 2, user: 'Bob Smith', points: 2200, achievements: 12 },
    { rank: 3, user: 'Charlie Brown', points: 2100, achievements: 11 }
  ];
  res.json({ success: true, data: leaderboard });
}));

router.get('/leaderboard/course/:courseId', authenticate, asyncHandler(async (req, res) => {
  // Get course-specific leaderboard
  const courseLeaderboard = [
    { rank: 1, user: 'Alice Johnson', points: 500, achievements: 3 },
    { rank: 2, user: 'Bob Smith', points: 450, achievements: 2 }
  ];
  res.json({ success: true, data: courseLeaderboard });
}));

// Enhanced Points Routes (Gamification)
router.get('/points/leaderboard', authenticate, asyncHandler(async (req, res) => {
  // Points-based leaderboard
  const pointsLeaderboard = [
    { rank: 1, user: 'Alice Johnson', totalPoints: 2500, monthlyPoints: 300 },
    { rank: 2, user: 'Bob Smith', totalPoints: 2200, monthlyPoints: 250 }
  ];
  res.json({ success: true, data: pointsLeaderboard });
}));

router.post('/points/award', authorize(['admin', 'faculty']), asyncHandler(async (req, res) => {
  const { userId, points, reason } = req.body;
  // Award points to user
  res.json({ success: true, message: `Awarded ${points} points to user`, data: { userId, points, reason } });
}));

// Streaks Routes (Gamification)
router.get('/streaks/:userId', authenticate, asyncHandler(async (req, res) => {
  // Get user streaks
  const streaks = {
    currentStreak: 7,
    longestStreak: 15,
    lastActivityDate: new Date(),
    streakHistory: [7, 6, 5, 4, 3, 2, 1]
  };
  res.json({ success: true, data: streaks });
}));

router.post('/streaks/update', authenticate, asyncHandler(async (req, res) => {
  // Update user streak after activity
  res.json({ success: true, message: 'Streak updated', data: { currentStreak: 8 } });
}));

// Badges Routes (Enhanced Gamification)
router.post('/badges/create', authorize(['admin']), asyncHandler(async (req, res) => {
  const { name, description, icon, criteria, rarity } = req.body;
  // Create new badge
  res.json({ success: true, message: 'Badge created', data: { name, description, icon, criteria, rarity } });
}));

router.post('/badges/:badgeId/award/:userId', authorize(['admin', 'faculty']), asyncHandler(async (req, res) => {
  const { badgeId, userId } = req.params;
  // Award badge to user
  res.json({ success: true, message: 'Badge awarded', data: { badgeId, userId } });
}));

// Achievement Templates (Enhanced)
const ENHANCED_ACHIEVEMENT_TEMPLATES = [
  ...ACHIEVEMENT_TEMPLATES,
  { type: 'first_leaderboard', title: 'Top Performer', description: 'Reach top 10 on leaderboard.', icon: '🏆', points: 300, requirement: 'Top 10 ranking' },
  { type: 'streak_master', title: 'Consistency King', description: 'Maintain 30-day activity streak.', icon: '🔥', points: 1000, requirement: '30 day streak' },
  { type: 'knowledge_sharer', title: 'Mentor Extraordinaire', description: 'Help 50 students with answers.', icon: '🎓', points: 750, requirement: '50 helpful responses' },
  { type: 'speed_demon', title: 'Lightning Fast', description: 'Complete assignment in under 30 minutes.', icon: '⚡', points: 200, requirement: 'Sub 30min completion' }
];

// Update achievements route to use enhanced templates
router.get('/achievements/templates', asyncHandler(async (req, res) => {
  res.json({ success: true, data: ENHANCED_ACHIEVEMENT_TEMPLATES });
}));

// Badges Routes
router.get('/badges', asyncHandler(async (req, res) => {
  const badges = await Badge.find().sort({ rarity: -1 });
  res.json(badges);
}));

router.get('/badges/user/:userId', asyncHandler(async (req, res) => {
  const userBadges = await UserBadge.find({ userId: req.params.userId })
    .populate('badgeId')
    .sort({ earnedAt: -1 });
  res.json(userBadges);
}));

router.post('/badges/:badgeId/award/:userId', authorize(['admin', 'faculty']), asyncHandler(async (req, res) => {
  const { badgeId, userId } = req.params;

  const badge = await Badge.findById(badgeId);
  if (!badge) return res.status(404).json({ error: 'Badge not found' });

  let userBadge = await UserBadge.findOne({ userId, badgeId });
  if (!userBadge) {
    userBadge = new UserBadge({ userId, badgeId, earnedAt: new Date() });
    await userBadge.save();
  }
  res.json(userBadge);
}));

// Points Routes
router.get('/points/:userId', asyncHandler(async (req, res) => {
  // Get user points
  res.json({ message: 'Get user points endpoint' });
}));

router.post('/points/award', authorize(['admin', 'faculty']), asyncHandler(async (req, res) => {
  // Award points to user
  res.json({ message: 'Award points endpoint' });
}));

// Streaks Routes
router.get('/streaks/:userId', asyncHandler(async (req, res) => {
  // Get user streaks
  res.json({ message: 'Get user streaks endpoint' });
}));

router.post('/streaks/update', asyncHandler(async (req, res) => {
  // Update user streak
  res.json({ message: 'Update streak endpoint' });
}));

// Attainment Routes
router.get('/attainment/:userId', asyncHandler(async (req, res) => {
  // Get user attainment
  res.json({ message: 'Get user attainment endpoint' });
}));

router.post('/attainment/update', authorize(['admin', 'faculty']), asyncHandler(async (req, res) => {
  // Update user attainment
  res.json({ message: 'Update attainment endpoint' });
}));

module.exports = router;
