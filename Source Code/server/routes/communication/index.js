const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const notificationService = require('../../services/notification/notificationService');

const announcementController = require('../../controllers/communication/announcementController');
const forumController = require('../../controllers/communication/forumController');
const teamController = require('../../controllers/communication/teamController');

router.get('/announcements', authenticate, announcementController.getAllAnnouncements);
router.get('/announcements/:id', authenticate, announcementController.getAnnouncementById);
router.post('/announcements', authenticate, authorize(['admin', 'faculty', 'hod']), announcementController.createAnnouncement);
router.put('/announcements/:id', authenticate, authorize(['admin', 'faculty', 'hod']), announcementController.updateAnnouncement);
router.delete('/announcements/:id', authenticate, authorize(['admin']), announcementController.deleteAnnouncement);
router.post('/announcements/:id/publish', authenticate, authorize(['admin', 'faculty', 'hod']), announcementController.publishAnnouncement);

router.get('/forums', authenticate, forumController.getAllDiscussions);
router.get('/forums/:id', authenticate, forumController.getDiscussionById);
router.post('/forums', authenticate, forumController.createDiscussion);
router.put('/forums/:id', authenticate, forumController.updateDiscussion);
router.delete('/forums/:id', authenticate, forumController.deleteDiscussion);
router.post('/forums/:id/reply', authenticate, forumController.addReply);
router.post('/forums/:id/like', authenticate, forumController.likeDiscussion);

router.use('/teams', require('./teams'));
router.use('/discussions', require('./discussions'));
router.use('/push-notifications', require('./push-notifications'));
router.use('/notifications-advanced', require('./notifications-advanced'));

// Basic Notifications API (compatibility with frontend)
router.get('/notifications/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const notifications = await notificationService.getUserNotifications(userId);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    const updated = await notificationService.markAsRead(req.params.id);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/notifications/read-all', authenticate, async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/notifications/:id', authenticate, async (req, res) => {
  try {
    await notificationService.deleteNotification(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/notifications/unread-count/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    if (req.user.role === 'student' && req.user.id !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const count = await notificationService.getUnreadCount(userId);
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
