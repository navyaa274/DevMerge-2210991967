const Forum = require('../../models/assessment/forums');
const ForumThread = require('../../models/assessment/forumThreads');
const ForumReply = require('../../models/assessment/forumReplies');

class ForumController {
  // Create or get forum for a course
  async getOrCreateCourseForum(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      let forum = await Forum.findOne({ course_id: courseId });

      if (!forum) {
        // Create default forum for the course
        forum = new Forum({
          course_id: courseId,
          title: 'Course Discussion',
          description: 'General discussion forum for this course',
          created_by: userId,
          moderator_ids: [userId]
        });
        await forum.save();
      }

      // Populate course information
      await forum.populate('course_id', 'title code');
      await forum.populate('created_by', 'first_name last_name');
      await forum.populate('moderator_ids', 'first_name last_name');

      res.status(200).json({
        success: true,
        data: forum
      });
    } catch (error) {
      console.error('Error getting/creating course forum:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get course forum',
        error: error.message
      });
    }
  }

  // Update forum settings
  async updateForum(req, res) {
    try {
      const { forumId } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.created_at;

      updateData.updated_at = Date.now();

      const forum = await Forum.findByIdAndUpdate(
        forumId,
        updateData,
        { new: true, runValidators: true }
      ).populate('course_id', 'title code');

      if (!forum) {
        return res.status(404).json({
          success: false,
          message: 'Forum not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Forum updated successfully',
        data: forum
      });
    } catch (error) {
      console.error('Error updating forum:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update forum',
        error: error.message
      });
    }
  }

  // Create a new thread
  async createThread(req, res) {
    try {
      const { forumId } = req.params;
      const userId = req.user.id;
      const { title, content, tags, is_anonymous } = req.body;

      // Get forum to verify it exists and get course_id
      const forum = await Forum.findById(forumId);
      if (!forum) {
        return res.status(404).json({
          success: false,
          message: 'Forum not found'
        });
      }

      // Check if forum allows student posts
      if (!forum.allow_student_posts && req.user.role === 'student') {
        return res.status(403).json({
          success: false,
          message: 'Students are not allowed to create threads in this forum'
        });
      }

      const thread = new ForumThread({
        forum_id: forumId,
        course_id: forum.course_id,
        title,
        content,
        author_id: userId,
        tags: tags || [],
        is_anonymous: is_anonymous && forum.allow_anonymous_posts,
        last_reply_at: Date.now(),
        last_reply_author_id: userId
      });

      await thread.save();

      // Update forum thread count and last activity
      await Forum.findByIdAndUpdate(forumId, {
        $inc: { thread_count: 1 },
        last_activity_at: Date.now()
      });

      // Populate author information
      await thread.populate('author_id', 'first_name last_name username');
      await thread.populate('forum_id', 'title');

      res.status(201).json({
        success: true,
        message: 'Thread created successfully',
        data: thread
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create thread',
        error: error.message
      });
    }
  }

  // Get threads for a forum
  async getForumThreads(req, res) {
    try {
      const { forumId } = req.params;
      const { page = 1, limit = 20, sort = 'last_reply_at', order = 'desc' } = req.query;

      const skip = (page - 1) * limit;
      const sortOrder = order === 'asc' ? 1 : -1;

      const threads = await ForumThread.find({ forum_id: forumId, status: 'active' })
        .populate('author_id', 'first_name last_name username')
        .populate('last_reply_author_id', 'first_name last_name username')
        .sort({ [sort]: sortOrder, is_pinned: -1 })
        .skip(skip)
        .limit(limit);

      const totalThreads = await ForumThread.countDocuments({
        forum_id: forumId,
        status: 'active'
      });

      res.status(200).json({
        success: true,
        data: threads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalThreads,
          pages: Math.ceil(totalThreads / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching forum threads:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch forum threads',
        error: error.message
      });
    }
  }

  // Get a specific thread with replies
  async getThread(req, res) {
    try {
      const { threadId } = req.params;

      const thread = await ForumThread.findById(threadId)
        .populate('author_id', 'first_name last_name username')
        .populate('forum_id', 'title course_id')
        .populate('last_reply_author_id', 'first_name last_name username');

      if (!thread || thread.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      // Increment view count
      await ForumThread.findByIdAndUpdate(threadId, { $inc: { view_count: 1 } });

      // Get replies for this thread
      const replies = await ForumReply.find({
        thread_id: threadId,
        status: 'active'
      })
        .populate('author_id', 'first_name last_name username')
        .sort({ created_at: 1 });

      // Organize replies by level (nested structure)
      const organizedReplies = this.organizeReplies(replies);

      res.status(200).json({
        success: true,
        data: {
          thread: thread,
          replies: organizedReplies,
          reply_count: replies.length
        }
      });
    } catch (error) {
      console.error('Error fetching thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch thread',
        error: error.message
      });
    }
  }

  // Create a reply to a thread
  async createReply(req, res) {
    try {
      const { threadId } = req.params;
      const userId = req.user.id;
      const { content, parent_reply_id, is_anonymous } = req.body;

      // Get thread to verify it exists and get forum info
      const thread = await ForumThread.findById(threadId);
      if (!thread || thread.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      if (thread.is_locked) {
        return res.status(403).json({
          success: false,
          message: 'This thread is locked'
        });
      }

      // Get forum to check permissions
      const forum = await Forum.findById(thread.forum_id);
      if (!forum.allow_student_posts && req.user.role === 'student') {
        return res.status(403).json({
          success: false,
          message: 'Students are not allowed to reply in this forum'
        });
      }

      // Calculate reply level
      let replyLevel = 0;
      if (parent_reply_id) {
        const parentReply = await ForumReply.findById(parent_reply_id);
        if (parentReply) {
          replyLevel = Math.min(parentReply.reply_level + 1, 5); // Max nesting level of 5
        }
      }

      const reply = new ForumReply({
        thread_id: threadId,
        forum_id: thread.forum_id,
        course_id: thread.course_id,
        content,
        author_id: userId,
        parent_reply_id: parent_reply_id || null,
        reply_level: replyLevel,
        is_anonymous: is_anonymous && forum.allow_anonymous_posts
      });

      await reply.save();

      // Update thread reply count and last activity
      await ForumThread.findByIdAndUpdate(threadId, {
        $inc: { reply_count: 1 },
        last_reply_at: Date.now(),
        last_reply_author_id: userId
      });

      // Update forum last activity
      await Forum.findByIdAndUpdate(thread.forum_id, {
        last_activity_at: Date.now()
      });

      // Populate author information
      await reply.populate('author_id', 'first_name last_name username');

      res.status(201).json({
        success: true,
        message: 'Reply created successfully',
        data: reply
      });
    } catch (error) {
      console.error('Error creating reply:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create reply',
        error: error.message
      });
    }
  }

  // Update a thread (author or moderator only)
  async updateThread(req, res) {
    try {
      const { threadId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const thread = await ForumThread.findById(threadId);
      if (!thread) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      // Check permissions (author or forum moderator)
      const forum = await Forum.findById(thread.forum_id);
      const isAuthor = thread.author_id.toString() === userId;
      const isModerator = forum.moderator_ids.some(id => id.toString() === userId);
      const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

      if (!isAuthor && !isModerator && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to edit this thread'
        });
      }

      // Remove fields that shouldn't be updated
      delete updateData._id;
      delete updateData.created_at;
      delete updateData.author_id;
      delete updateData.forum_id;
      delete updateData.course_id;

      updateData.updated_at = Date.now();

      const updatedThread = await ForumThread.findByIdAndUpdate(
        threadId,
        updateData,
        { new: true, runValidators: true }
      ).populate('author_id', 'first_name last_name username');

      res.status(200).json({
        success: true,
        message: 'Thread updated successfully',
        data: updatedThread
      });
    } catch (error) {
      console.error('Error updating thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update thread',
        error: error.message
      });
    }
  }

  // Helper method to organize replies into nested structure
  organizeReplies(replies) {
    const replyMap = {};
    const rootReplies = [];

    // Create a map of all replies
    replies.forEach(reply => {
      replyMap[reply._id.toString()] = { ...reply.toObject(), replies: [] };
    });

    // Organize replies into nested structure
    replies.forEach(reply => {
      const replyId = reply._id.toString();
      const replyObj = replyMap[replyId];

      if (reply.parent_reply_id) {
        const parentId = reply.parent_reply_id.toString();
        if (replyMap[parentId]) {
          replyMap[parentId].replies.push(replyObj);
        }
      } else {
        rootReplies.push(replyObj);
      }
    });

    return rootReplies;
  }
}

module.exports = new ForumController();
