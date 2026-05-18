const express = require('express');
const router = express.Router();
const Feedback = require('../../models/admin/Feedback');
const { authorize } = require('../../middleware/rbac');
const asyncHandler = require('../../errors/asyncHandler');

router.post('/', asyncHandler(async (req, res) => {
  const { type, title, description, rating } = req.body;
  const feedback = new Feedback({ userId: req.user.id, type, title, description, rating });
  await feedback.save();
  res.status(201).json(feedback);
}));

router.get('/', authorize(['admin']), asyncHandler(async (req, res) => {
  const { status, priority } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  const feedbacks = await Feedback.find(filter).populate('userId', 'name email').sort({ priority: -1, createdAt: -1 });
  res.json(feedbacks);
}));

router.get('/user/:userId', asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ userId: req.params.userId }).sort({ createdAt: -1 });
  res.json(feedbacks);
}));

router.put('/:feedbackId', authorize(['admin']), asyncHandler(async (req, res) => {
  const { status, priority } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(req.params.feedbackId, { status, priority }, { new: true });
  res.json(feedback);
}));

router.post('/:feedbackId/respond', authorize(['admin']), asyncHandler(async (req, res) => {
  const { message } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.feedbackId,
    { $push: { responses: { responderId: req.user.id, message, createdAt: new Date() } } },
    { new: true }
  );
  res.json(feedback);
}));

module.exports = router;
