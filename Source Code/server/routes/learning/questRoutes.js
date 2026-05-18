const express = require('express');
const router = express.Router();
const Quest = require('../../models/learning/gamification/Quest');
const Course = require('../../models/academic/Course');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../errors/asyncHandler');

router.get('/ping', (req, res) => res.json({ success: true, message: 'Quest Router Active' }));

const seedStarterQuestsIfEmpty = async (userId) => {
  const activeCount = await Quest.countDocuments({
    isActive: true,
    expiresAt: { $gt: new Date() }
  });

  if (activeCount > 0) return;

  const course = await Course.findOne({ isActive: true }).select('_id').lean();
  const now = Date.now();

  const starterQuests = [
    {
      title: 'Debug the Infinite Loop',
      description: 'Find and fix the loop condition bug in the assignment starter code.',
      issuer: userId,
      courseId: course?._id || null,
      difficulty: 'Hard',
      baseXp: 500,
      timeLimitMinutes: 180,
      multiplier: 2.5,
      tags: ['algorithms', 'debugging'],
      colorTheme: 'rose',
      expiresAt: new Date(now + 180 * 60 * 1000)
    },
    {
      title: 'Optimize Query Performance',
      description: 'Reduce query latency by indexing and improving pipeline design.',
      issuer: userId,
      courseId: course?._id || null,
      difficulty: 'Medium',
      baseXp: 300,
      timeLimitMinutes: 240,
      multiplier: 1.8,
      tags: ['database', 'sql'],
      colorTheme: 'amber',
      expiresAt: new Date(now + 240 * 60 * 1000)
    },
    {
      title: 'Responsive UI Repair',
      description: 'Fix mobile breakpoints and alignment issues for the dashboard card grid.',
      issuer: userId,
      courseId: course?._id || null,
      difficulty: 'Easy',
      baseXp: 180,
      timeLimitMinutes: 300,
      multiplier: 1.3,
      tags: ['frontend', 'css'],
      colorTheme: 'emerald',
      expiresAt: new Date(now + 300 * 60 * 1000)
    }
  ];

  await Quest.insertMany(starterQuests);
};

const getActiveQuestsHandler = asyncHandler(async (req, res) => {
  await seedStarterQuestsIfEmpty(req.user.id);

  const quests = await Quest.find({
    isActive: true,
    expiresAt: { $gt: new Date() }
  }).populate('issuer', 'name firstName lastName').sort({ expiresAt: 1 });

  res.json({ success: true, count: quests.length, data: quests });
});

const acceptQuestHandler = asyncHandler(async (req, res) => {
  const quest = await Quest.findById(req.params.id);

  if (!quest) {
    return res.status(404).json({ success: false, message: 'Quest not found.' });
  }

  if (quest.expiresAt < new Date() || !quest.isActive) {
    return res.status(400).json({ success: false, message: 'Quest is no longer active.' });
  }

  const alreadyAccepted = quest.acceptedBy.find(a => a.studentId.toString() === req.user.id);
  if (alreadyAccepted) {
    return res.status(200).json({ success: true, message: 'Quest already accepted.', alreadyAccepted: true, data: quest });
  }

  quest.acceptedBy.push({
    studentId: req.user.id,
    acceptedAt: new Date(),
    status: 'In Progress'
  });

  await quest.save();

  res.json({ success: true, message: 'Quest accepted successfully.', data: quest });
});

router.get('/quests', authenticate, authorize(['student']), getActiveQuestsHandler);
router.get('/general/quests', authenticate, authorize(['student']), getActiveQuestsHandler);

router.post('/quests/:id/accept', authenticate, authorize(['student']), acceptQuestHandler);
router.post('/general/quests/:id/accept', authenticate, authorize(['student']), acceptQuestHandler);

router.post('/faculty/quests', authenticate, authorize(['faculty', 'hod']), asyncHandler(async (req, res) => {
  const { title, description, courseId, difficulty, baseXp, timeLimitMinutes, multiplier, tags, colorTheme, targetSections } = req.body;

  const quest = new Quest({
    title,
    description,
    issuer: req.user.id,
    courseId: courseId || null,
    targetSections: targetSections || [],
    difficulty,
    baseXp,
    timeLimitMinutes,
    multiplier,
    tags,
    colorTheme,
    expiresAt: new Date(Date.now() + (timeLimitMinutes * 60 * 1000))
  });

  await quest.save();

  res.status(201).json({ success: true, message: 'Zero-Day Quest deployed successfully.', data: quest });
}));

router.get('/faculty/quests/history', authenticate, authorize(['faculty', 'hod']), asyncHandler(async (req, res) => {
  const quests = await Quest.find({ issuer: req.user.id })
    .populate('courseId', 'title code')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: quests.length, data: quests });
}));

module.exports = router;
