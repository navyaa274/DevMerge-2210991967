const express = require('express');
const router = express.Router();
const asyncHandler = require('../../errors/asyncHandler');

router.get('/', asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  const results = { problems: [], courses: [], users: [], discussions: [] };
  res.json(results);
}));

router.get('/problems', asyncHandler(async (req, res) => {
  const { q, difficulty, topic } = req.query;
  res.json([]);
}));

router.get('/courses', asyncHandler(async (req, res) => {
  const { q } = req.query;
  res.json([]);
}));

router.get('/users', asyncHandler(async (req, res) => {
  const { q } = req.query;
  res.json([]);
}));

router.get('/discussions', asyncHandler(async (req, res) => {
  const { q } = req.query;
  res.json([]);
}));

module.exports = router;
