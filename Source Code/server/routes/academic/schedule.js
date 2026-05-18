const express = require('express');
const router = express.Router();
const Schedule = require('../../models/academic/Schedule');
const asyncHandler = require('../../errors/asyncHandler');

router.post('/', asyncHandler(async (req, res) => {
  const { title, description, type, startTime, endTime, location, meetingLink, reminders } = req.body;
  const schedule = new Schedule({ userId: req.user.id, title, description, type, startTime, endTime, location, meetingLink, reminders });
  await schedule.save();
  res.status(201).json(schedule);
}));

router.get('/user/:userId', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const filter = { userId: req.params.userId };
  if (startDate && endDate) filter.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
  const schedules = await Schedule.find(filter).sort({ startTime: 1 });
  res.json(schedules);
}));

router.get('/upcoming/:userId', asyncHandler(async (req, res) => {
  const now = new Date();
  const schedules = await Schedule.find({ userId: req.params.userId, startTime: { $gte: now } }).sort({ startTime: 1 }).limit(10);
  res.json(schedules);
}));

router.put('/:scheduleId', asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndUpdate(req.params.scheduleId, req.body, { new: true });
  res.json(schedule);
}));

router.delete('/:scheduleId', asyncHandler(async (req, res) => {
  await Schedule.findByIdAndDelete(req.params.scheduleId);
  res.json({ message: 'Schedule deleted' });
}));

module.exports = router;
