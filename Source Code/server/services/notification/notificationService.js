const Notification = require("../../models/communication/Notification");
const mongoose = require("mongoose");

class NotificationService {
  async sendNotification(userId, type, title, message, data = {}) {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Development mode - create mock notification
      const mockNotification = {
        _id: `notif_${Date.now()}`,
        userId,
        type,
        title,
        message,
        data,
        isRead: false,
        createdAt: new Date(),
        devMode: true
      };

      // Emit real-time notification if socket is available
      if (this.io) {
        this.io.to(`user:${userId}`).emit('notification', mockNotification);
        this.io.to(`user:${userId}`).emit('notification_count', { unreadCount: 1 });
      }

      return mockNotification;
    }

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
    });
    await notification.save();

    // Emit real-time notification if socket is available
    if (this.io) {
      this.io.to(`user:${userId}`).emit('notification', notification);

      // Also emit updated unread count
      const unreadCount = await this.getUnreadCount(userId);
      this.io.to(`user:${userId}`).emit('notification_count', { unreadCount });
    }

    return notification;
  }

  async sendBulkNotifications(userIds, type, title, message, data = {}) {
    const notifications = userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      data,
      isRead: false,
    }));
    const result = await Notification.insertMany(notifications);

    // Emit real-time notifications for each user
    if (this.io && result.length > 0) {
      for (const notif of result) {
        this.io.to(`user:${notif.userId}`).emit('notification', notif);

        // Background update unread counts (async)
        this.getUnreadCount(notif.userId).then(count => {
          this.io.to(`user:${notif.userId}`).emit('notification_count', { unreadCount: count });
        });
      }
    }

    return result;
  }

  async getUserNotifications(userId, page = 1, limit = 20) {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Development mode - mock notifications
      const mockNotifications = [
        {
          _id: 'notif_1',
          userId,
          type: 'assignment',
          title: 'New Assignment Posted',
          message: 'A new assignment has been posted in Computer Science',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          devMode: true
        },
        {
          _id: 'notif_2',
          userId,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: 'You have earned the "Code Master" badge',
          isRead: false,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          devMode: true
        },
        {
          _id: 'notif_3',
          userId,
          type: 'system',
          title: 'Welcome to DevMerge',
          message: 'Your account has been successfully created',
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          devMode: true
        }
      ];

      return mockNotifications;
    }

    return await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async deleteNotification(notificationId) {
    return await Notification.findByIdAndDelete(notificationId);
  }

  async getUnreadCount(userId) {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      // Development mode - return mock unread count
      return 2; // Two unread notifications from mock data
    }

    return await Notification.countDocuments({
      userId,
      isRead: false,
    });
  }
  /**
   * Send a global broadcast to ALL connected users
   */
  async sendGlobalBroadcast(title, message, senderId) {
    if (this.io) {
      this.io.emit('broadcast', {
        title,
        message,
        senderId,
        type: 'SYSTEM_BROADCAST',
        timestamp: new Date()
      });
    }
  }

  /**
   * Send a course-specific broadcast
   */
  async sendCourseBroadcast(courseId, title, message, senderId) {
    if (this.io) {
      this.io.to(`course:${courseId}`).emit('broadcast', {
        title,
        message,
        courseId,
        senderId,
        type: 'COURSE_BROADCAST',
        timestamp: new Date()
      });
    }
  }

  /**
   * Initialize with Socket.IO instance
   */
  setIo(io) {
    this.io = io;
  }
}

module.exports = new NotificationService();
