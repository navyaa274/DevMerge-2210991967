const express = require('express');
const router = express.Router();
const Discussion = require('../../models/communication/Discussion');
const asyncHandler = require('../../errors/asyncHandler');

router.post('/', asyncHandler(async (req, res) => {
  const { title, content, category, relatedId, tags } = req.body;
  const discussion = new Discussion({ title, content, category, relatedId, tags, authorId: req.user.id });
  await discussion.save();
  res.status(201).json(discussion);
}));

router.get('/', asyncHandler(async (req, res) => {
  const { category, tag, search } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }];
  const discussions = await Discussion.find(filter).populate('authorId', 'name email').sort({ isPinned: -1, createdAt: -1 });
  res.json(discussions);
}));

router.get('/:discussionId', asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(req.params.discussionId, { $inc: { views: 1 } }, { new: true })
    .populate('authorId', 'name email').populate('replies.authorId', 'name email');
  if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
  res.json(discussion);
}));

router.post('/:discussionId/reply', asyncHandler(async (req, res) => {
  const { content } = req.body;
  const discussion = await Discussion.findByIdAndUpdate(
    req.params.discussionId,
    { $push: { replies: { authorId: req.user.id, content, createdAt: new Date() } } },
    { new: true }
  );
  res.json(discussion);
}));

router.post('/:discussionId/like', asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(req.params.discussionId, { $inc: { likes: 1 } }, { new: true });
  res.json(discussion);
}));

router.put('/:discussionId/solve', asyncHandler(async (req, res) => {
  const discussion = await Discussion.findByIdAndUpdate(req.params.discussionId, { isSolved: true }, { new: true });
  res.json(discussion);
}));

module.exports = router;
