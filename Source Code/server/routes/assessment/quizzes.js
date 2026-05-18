const express = require('express');
const router = express.Router();
const Quiz = require('../../models/assessment/logic/Quiz');
const { authenticate, authorize } = require('../../middleware/auth');
const asyncHandler = require('../../errors/asyncHandler');

// Get all quizzes
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { learningPath, module } = req.query;
  const filter = { isPublished: true };

  if (learningPath) filter.learningPath = learningPath;
  if (module) filter.module = module;

  const quizzes = await Quiz.find(filter)
    .populate('createdBy', 'name')
    .select('-questions.correctAnswer'); // Don't send correct answers

  res.json(quizzes);
}));

// Get quiz by ID
router.get('/:quizId', authenticate, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId)
    .populate('createdBy', 'name')
    .select('-questions.correctAnswer'); // Don't send correct answers

  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  res.json(quiz);
}));

// Submit quiz attempt
router.post('/:quizId/submit', authenticate, asyncHandler(async (req, res) => {
  const { answers } = req.body;
  const quiz = await Quiz.findById(req.params.quizId);

  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  // Calculate score
  let correctCount = 0;
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  let earnedPoints = 0;

  quiz.questions.forEach((question, idx) => {
    if (answers[idx] === question.correctAnswer) {
      correctCount++;
      earnedPoints += question.points;
    }
  });

  const percentage = Math.round((earnedPoints / totalPoints) * 100);
  const passed = percentage >= quiz.passingScore;

  // Save attempt
  quiz.attempts.push({
    student: req.user.id,
    answers,
    score: earnedPoints,
    percentage,
    passed,
    completedAt: new Date()
  });

  await quiz.save();

  res.json({
    score: earnedPoints,
    totalPoints,
    percentage,
    passed,
    correctCount,
    totalQuestions: quiz.questions.length
  });
}));

// Get user's quiz attempts
router.get('/:quizId/attempts', authenticate, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });

  const userAttempts = quiz.attempts.filter(
    attempt => attempt.student.toString() === req.user.id
  );

  res.json(userAttempts);
}));

// Create quiz (faculty/admin only)
router.post('/', authenticate, authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const quiz = new Quiz({
    ...req.body,
    createdBy: req.user.id
  });

  await quiz.save();
  res.status(201).json(quiz);
}));

// Update quiz
router.put('/:quizId', authenticate, authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const quiz = await Quiz.findByIdAndUpdate(
    req.params.quizId,
    req.body,
    { new: true }
  );

  res.json(quiz);
}));

// Delete quiz
router.delete('/:quizId', authenticate, authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  await Quiz.findByIdAndDelete(req.params.quizId);
  res.json({ message: 'Quiz deleted successfully' });
}));

module.exports = router;
