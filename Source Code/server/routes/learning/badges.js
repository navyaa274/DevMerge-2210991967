const express = require('express');
const router = express.Router();
const Badge = require('../../models/learning/gamification/Badge');
const UserBadge = require('../../models/learning/gamification/UserBadge');
const { authorize } = require('../../middleware/rbac');
const asyncHandler = require('../../errors/asyncHandler');

// Get all badges
router.get('/', asyncHandler(async (req, res) => {
  const badges = await Badge.find().sort({ rarity: -1 });
  res.json(badges);
}));

// Get user badges
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const userBadges = await UserBadge.find({ userId: req.params.userId })
    .populate('badgeId')
    .sort({ earnedAt: -1 });
  res.json(userBadges);
}));

// Award badge to user
router.post('/:badgeId/award/:userId', authorize(['admin', 'faculty']), asyncHandler(async (req, res) => {
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

// Create badge (admin only)
router.post('/', authorize(['admin']), asyncHandler(async (req, res) => {
  const badge = new Badge(req.body);
  await badge.save();
  res.status(201).json(badge);
}));

// Update badge progress
router.put('/:badgeId/progress/:userId', asyncHandler(async (req, res) => {
  const { badgeId, userId } = req.params;
  const { progress } = req.body;

  const userBadge = await UserBadge.findOneAndUpdate(
    { userId, badgeId },
    { progress },
    { new: true }
  );

  res.json(userBadge);
}));

module.exports = router;
