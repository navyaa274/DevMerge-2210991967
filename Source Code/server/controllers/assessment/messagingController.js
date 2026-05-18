const MessageThread = require('../../models/assessment/messageThreads');
const Message = require('../../models/assessment/messages');

class MessagingController {
  // Get user's message threads (inbox)
  async getUserThreads(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, type } = req.query;

      const skip = (page - 1) * limit;

      // Find threads where user is a participant
      let filter = {
        'participants.user_id': userId,
        'participants.is_active': true,
        status: 'active'
      };

      if (type) {
        filter.type = type;
      }

      const threads = await MessageThread.find(filter)
        .populate('participants.user_id', 'first_name last_name username')
        .populate('created_by', 'first_name last_name username')
        .populate('course_id', 'title code')
        .sort({ last_message_at: -1 })
        .skip(skip)
        .limit(limit);

      // Add unread count for each thread
      const threadsWithUnread = await Promise.all(
        threads.map(async (thread) => {
          const unreadCount = await this.getUnreadCount(thread._id, userId);
          return {
            ...thread.toObject(),
            unread_count: unreadCount
          };
        })
      );

      const totalThreads = await MessageThread.countDocuments(filter);

      res.status(200).json({
        success: true,
        data: threadsWithUnread,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalThreads,
          pages: Math.ceil(totalThreads / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching user threads:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch message threads',
        error: error.message
      });
    }
  }

  // Get messages in a thread
  async getThreadMessages(req, res) {
    try {
      const { threadId } = req.params;
      const userId = req.user.id;
      const { page = 1, limit = 50 } = req.query;

      const skip = (page - 1) * limit;

      // Verify user is participant in thread
      const thread = await MessageThread.findOne({
        _id: threadId,
        'participants.user_id': userId,
        'participants.is_active': true
      });

      if (!thread) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const messages = await Message.find({ thread_id: threadId, status: { $ne: 'deleted' } })
        .populate('sender_id', 'first_name last_name username')
        .populate('reply_to_message_id', 'content sender_id')
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit);

      const totalMessages = await Message.countDocuments({
        thread_id: threadId,
        status: { $ne: 'deleted' }
      });

      // Mark messages as read for this user
      await Message.updateMany(
        {
          thread_id: threadId,
          sender_id: { $ne: userId },
          'read_by.user_id': { $ne: userId }
        },
        {
          $push: {
            read_by: {
              user_id: userId,
              read_at: Date.now()
            }
          },
          status: 'read'
        }
      );

      // Update participant's last_read_at
      await MessageThread.updateOne(
        { _id: threadId, 'participants.user_id': userId },
        { $set: { 'participants.$.last_read_at': Date.now() } }
      );

      res.status(200).json({
        success: true,
        data: messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalMessages,
          pages: Math.ceil(totalMessages / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching thread messages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch thread messages',
        error: error.message
      });
    }
  }

  // Send a message
  async sendMessage(req, res) {
    try {
      const { threadId } = req.params;
      const userId = req.user.id;
      const { content, message_type, reply_to_message_id, attachments } = req.body;

      // Verify user is participant in thread
      const thread = await MessageThread.findOne({
        _id: threadId,
        'participants.user_id': userId,
        'participants.is_active': true
      });

      if (!thread) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Create message
      const message = new Message({
        thread_id: threadId,
        sender_id: userId,
        content,
        message_type: message_type || 'text',
        reply_to_message_id,
        attachments: attachments || [],
        read_by: [{
          user_id: userId,
          read_at: Date.now()
        }]
      });

      await message.save();

      // Update thread
      const messagePreview = content.length > 100 ? content.substring(0, 100) + '...' : content;
      await MessageThread.updateOne(
        { _id: threadId },
        {
          last_message_at: Date.now(),
          last_message_preview: messagePreview,
          $inc: { message_count: 1 }
        }
      );

      // Populate and return
      await message.populate('sender_id', 'first_name last_name username');

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: message
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: error.message
      });
    }
  }

  // Start a new conversation/thread
  async createThread(req, res) {
    try {
      const userId = req.user.id;
      const { recipient_ids, subject, content, course_id, type } = req.body;

      if (!recipient_ids || !Array.isArray(recipient_ids) || recipient_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one recipient is required'
        });
      }

      // Check if direct conversation already exists (for non-group threads)
      let existingThread = null;
      if (type === 'direct' && recipient_ids.length === 1) {
        existingThread = await MessageThread.findOne({
          type: 'direct',
          'participants.user_id': { $all: [userId, recipient_ids[0]], $size: 2 }
        });
      }

      if (existingThread) {
        // Send message to existing thread instead
        return await this.sendMessage({ params: { threadId: existingThread._id }, user: { id: userId }, body: { content } }, res);
      }

      // Create new thread
      const participants = [
        { user_id: userId, joined_at: Date.now(), last_read_at: Date.now() },
        ...recipient_ids.map(recipientId => ({
          user_id: recipientId,
          joined_at: Date.now(),
          last_read_at: new Date(0) // Set to old date so they see new messages
        }))
      ];

      const thread = new MessageThread({
        subject,
        participants,
        created_by: userId,
        course_id,
        type: type || 'direct',
        is_group: type === 'course_group' || recipient_ids.length > 1,
        last_message_at: Date.now(),
        last_message_preview: content.length > 100 ? content.substring(0, 100) + '...' : content,
        message_count: 1
      });

      await thread.save();

      // Create first message
      const message = new Message({
        thread_id: thread._id,
        sender_id: userId,
        content,
        read_by: [{
          user_id: userId,
          read_at: Date.now()
        }]
      });

      await message.save();

      // Populate and return
      await thread.populate('participants.user_id', 'first_name last_name username');
      await thread.populate('created_by', 'first_name last_name username');

      res.status(201).json({
        success: true,
        message: 'Conversation started successfully',
        data: thread
      });
    } catch (error) {
      console.error('Error creating thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
        error: error.message
      });
    }
  }

  // Archive a thread
  async archiveThread(req, res) {
    try {
      const { threadId } = req.params;
      const userId = req.user.id;

      const result = await MessageThread.updateOne(
        { _id: threadId, 'participants.user_id': userId },
        {
          $set: {
            'participants.$.is_active': false,
            status: 'archived'
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Thread not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Thread archived successfully'
      });
    } catch (error) {
      console.error('Error archiving thread:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive thread',
        error: error.message
      });
    }
  }

  // Helper method to get unread count for a thread
  async getUnreadCount(threadId, userId) {
    try {
      const thread = await MessageThread.findOne({
        _id: threadId,
        'participants.user_id': userId
      });

      if (!thread) return 0;

      const participant = thread.participants.find(p => p.user_id.toString() === userId.toString());
      if (!participant) return 0;

      const unreadCount = await Message.countDocuments({
        thread_id: threadId,
        sender_id: { $ne: userId },
        created_at: { $gt: participant.last_read_at },
        status: { $ne: 'deleted' }
      });

      return unreadCount;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Get unread messages count for user
  async getUnreadCountTotal(req, res) {
    try {
      const userId = req.user.id;

      const threads = await MessageThread.find({
        'participants.user_id': userId,
        'participants.is_active': true,
        status: 'active'
      });

      let totalUnread = 0;
      for (const thread of threads) {
        const participant = thread.participants.find(p => p.user_id.toString() === userId.toString());
        if (participant) {
          const unreadCount = await Message.countDocuments({
            thread_id: thread._id,
            sender_id: { $ne: userId },
            created_at: { $gt: participant.last_read_at },
            status: { $ne: 'deleted' }
          });
          totalUnread += unreadCount;
        }
      }

      res.status(200).json({
        success: true,
        data: { total_unread: totalUnread }
      });
    } catch (error) {
      console.error('Error getting total unread count:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count',
        error: error.message
      });
    }
  }
}

module.exports = new MessagingController();
