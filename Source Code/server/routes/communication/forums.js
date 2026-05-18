const express = require('express');
const { authenticate } = require('../../middleware/auth');
const Discussion = require('../../models/communication/Discussion');
const logger = require('../../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/communication/forums/threads
 * @desc    Get all active forum threads with filtering
 */
router.get('/threads', authenticate, async (req, res) => {
  try {
    const { category, relatedId, search } = req.query;

    let query = {};
    if (category) query.category = category;
    if (relatedId) query.relatedId = relatedId;
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') }
      ];
    }

    const threads = await Discussion.find(query)
      .populate('authorId', 'name profilePicture department role')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: threads.length,
      data: threads.map(t => ({
        ...t,
        author: t.authorId?.name || 'Anonymous',
        repliesCount: t.replies?.length || 0
      }))
    });
  } catch (error) {
    logger.error('Failed to fetch forum threads', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/communication/forums/threads
 * @desc    Create a new academic discussion thread
 */
router.post('/threads', authenticate, async (req, res) => {
  try {
    const { title, content, category, relatedId, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const thread = await Discussion.create({
      title,
      content,
      category: category || 'general',
      relatedId,
      tags: tags || [],
      authorId: req.user.id
    });

    logger.info(`Forum thread created: ${title}`, { userId: req.user.id, threadId: thread._id });

    res.status(201).json({
      success: true,
      message: 'Thread created successfully',
      data: thread
    });
  } catch (error) {
    logger.error('Failed to create forum thread', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/communication/forums/threads/:threadId
 * @desc    Get detailed thread view with replies
 */
router.get('/threads/:threadId', authenticate, async (req, res) => {
  try {
    const thread = await Discussion.findById(req.params.threadId)
      .populate('authorId', 'name profilePicture department role')
      .populate('replies.authorId', 'name profilePicture');

    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Increment views
    thread.views = (thread.views || 0) + 1;
    await thread.save();

    res.json({ success: true, data: thread });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/communication/forums/threads/:threadId/replies
 * @desc    Post a reply to an existing discussion
 */
router.post('/threads/:threadId/replies', authenticate, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const thread = await Discussion.findById(req.params.threadId);
    if (!thread) {
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    thread.replies.push({
      authorId: req.user.id,
      content,
      likes: 0,
      createdAt: new Date()
    });

    await thread.save();
    logger.info(`Forum reply posted to thread: ${req.params.threadId}`, { userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Reply posted successfully',
      data: thread.replies[thread.replies.length - 1]
    });
  } catch (error) {
    logger.error('Failed to post reply', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /api/communication/forums/threads/:id/upvote
 * @desc    Upvote a discussion thread
 */
router.post('/threads/:id/upvote', authenticate, async (req, res) => {
  try {
    const thread = await Discussion.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.json({ success: true, likes: thread?.likes || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PATCH /api/communication/forums/threads/:id/solve
 * @desc    Mark a thread as solved (Author or Faculty only)
 */
router.patch('/threads/:id/solve', authenticate, async (req, res) => {
  try {
    const thread = await Discussion.findById(req.params.id);
    if (!thread) return res.status(404).json({ message: 'Thread not found' });

    if (thread.authorId.toString() !== req.user.id && !['faculty', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    thread.isSolved = true;
    await thread.save();
    res.json({ success: true, data: thread });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
