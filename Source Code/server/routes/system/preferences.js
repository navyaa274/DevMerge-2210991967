const express = require('express');
const router = express.Router();
const UserPreferences = require('../../models/admin/UserPreferences');
const asyncHandler = require('../../errors/asyncHandler');

router.get('/user/:userId', asyncHandler(async (req, res) => {
  let preferences = await UserPreferences.findOne({ userId: req.params.userId });
  if (!preferences) {
    preferences = new UserPreferences({ userId: req.params.userId });
    await preferences.save();
  }
  res.json(preferences);
}));

router.put('/user/:userId', asyncHandler(async (req, res) => {
  const preferences = await UserPreferences.findOneAndUpdate(
    { userId: req.params.userId },
    { ...req.body, updatedAt: new Date() },
    { new: true, upsert: true }
  );
  res.json(preferences);
}));

router.patch('/user/:userId/theme', asyncHandler(async (req, res) => {
  const { theme } = req.body;
  const preferences = await UserPreferences.findOneAndUpdate(
    { userId: req.params.userId },
    { theme },
    { new: true, upsert: true }
  );
  res.json(preferences);
}));

router.patch('/user/:userId/notifications', asyncHandler(async (req, res) => {
  const { notifications } = req.body;
  const preferences = await UserPreferences.findOneAndUpdate(
    { userId: req.params.userId },
    { notifications },
    { new: true, upsert: true }
  );
  res.json(preferences);
}));

module.exports = router;
