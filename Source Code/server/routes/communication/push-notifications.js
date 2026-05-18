const express = require('express');
const router = express.Router();
const PushNotification = require('../../models/communication/PushNotification');
const asyncHandler = require('../../errors/asyncHandler');

router.get('/user/:userId', asyncHandler(async (req, res) => {
  const notifications = await PushNotification.find({ userId: req.params.userId })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(notifications);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { userId, title, body, type, relatedId } = req.body;
  const notification = new PushNotification({ userId, title, body, type, relatedId });
  await notification.save();
  res.status(201).json(notification);
}));

router.put('/:notificationId/read', asyncHandler(async (req, res) => {
  const notification = await PushNotification.findByIdAndUpdate(
    req.params.notificationId,
    { readAt: new Date() },
    { new: true }
  );
  res.json(notification);
}));

module.exports = router;
