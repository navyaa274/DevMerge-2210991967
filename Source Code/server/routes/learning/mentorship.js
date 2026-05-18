const express = require('express');
const router = express.Router();
const Mentorship = require('../../models/learning/mentorship/Mentorship');
const User = require('../../models/auth/User');
const { authenticate } = require('../../middleware/auth');
const asyncHandler = require('../../errors/asyncHandler');

// Get available mentors
router.get('/mentors', authenticate, asyncHandler(async (req, res) => {
  const mentors = await User.find({
    role: { $in: ['faculty', 'admin'] }
  })
    .select('name email department expertise')
    .populate('department', 'name')
    .limit(20);

  res.json(mentors);
}));

// Create mentorship request
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { mentorId, menteeId, goals, message } = req.body;

  const mentorship = new Mentorship({
    mentorId,
    menteeId,
    goals,
    message,
    status: 'pending'
  });

  await mentorship.save();
  res.status(201).json(mentorship);
}));

// Get mentorship requests for user
router.get('/user/:userId', authenticate, asyncHandler(async (req, res) => {
  const mentorships = await Mentorship.find({
    $or: [{ mentorId: req.params.userId }, { menteeId: req.params.userId }]
  })
    .populate('mentorId', 'name email department')
    .populate('menteeId', 'name email department')
    .populate('mentorId.department', 'name')
    .populate('menteeId.department', 'name')
    .sort({ createdAt: -1 });

  res.json(mentorships);
}));

// Accept mentorship
router.put('/:mentorshipId/accept', authenticate, asyncHandler(async (req, res) => {
  const mentorship = await Mentorship.findByIdAndUpdate(
    req.params.mentorshipId,
    {
      status: 'active',
      startDate: new Date()
    },
    { new: true }
  );

  res.json(mentorship);
}));

// End mentorship
router.put('/:mentorshipId/end', authenticate, asyncHandler(async (req, res) => {
  const mentorship = await Mentorship.findByIdAndUpdate(
    req.params.mentorshipId,
    {
      status: 'completed',
      endDate: new Date()
    },
    { new: true }
  );

  res.json(mentorship);
}));

// Reject mentorship
router.put('/:mentorshipId/reject', authenticate, asyncHandler(async (req, res) => {
  const mentorship = await Mentorship.findByIdAndUpdate(
    req.params.mentorshipId,
    { status: 'rejected' },
    { new: true }
  );

  res.json(mentorship);
}));

// Add session
router.post('/:mentorshipId/session', authenticate, asyncHandler(async (req, res) => {
  const { date, duration, topic, notes } = req.body;

  const mentorship = await Mentorship.findByIdAndUpdate(
    req.params.mentorshipId,
    {
      $push: {
        sessions: { date, duration, topic, notes }
      }
    },
    { new: true }
  );

  res.json(mentorship);
}));

// Complete mentorship
router.put('/:mentorshipId/complete', authenticate, asyncHandler(async (req, res) => {
  const { rating, review } = req.body;

  const mentorship = await Mentorship.findByIdAndUpdate(
    req.params.mentorshipId,
    {
      status: 'completed',
      endDate: new Date(),
      rating,
      review
    },
    { new: true }
  );

  res.json(mentorship);
}));

module.exports = router;
