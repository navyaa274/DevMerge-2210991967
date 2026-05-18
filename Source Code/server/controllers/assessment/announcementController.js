const CourseAnnouncement = require('../../models/assessment/courseAnnouncements');
const AnnouncementRead = require('../../models/assessment/announcementReads');

class AnnouncementController {
  // Create a new announcement
  async createAnnouncement(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const {
        title,
        content,
        announcement_type,
        priority,
        is_pinned,
        expires_at,
        attachment_url,
        attachment_name,
        tags
      } = req.body;

      // Check if user has permission (faculty or admin)
      const allowedRoles = ['faculty', 'admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only faculty and administrators can create announcements'
        });
      }

      const newAnnouncement = new CourseAnnouncement({
        course_id: courseId,
        title,
        content,
        announcement_type: announcement_type || 'general',
        priority: priority || 'normal',
        is_pinned: is_pinned || false,
        expires_at: expires_at ? new Date(expires_at) : null,
        attachment_url,
        attachment_name,
        created_by: userId,
        tags: tags || []
      });

      const savedAnnouncement = await newAnnouncement.save();

      // Populate creator information
      await savedAnnouncement.populate('created_by', 'first_name last_name username');

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: savedAnnouncement
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create announcement',
        error: error.message
      });
    }
  }

  // Get announcements for a course
  async getCourseAnnouncements(req, res) {
    try {
      const { courseId } = req.params;
      const { include_expired = false, limit = 20, offset = 0 } = req.query;
      const userId = req.user.id;

      let filter = { course_id: courseId, is_published: true };

      if (!include_expired) {
        filter.$or = [
          { expires_at: null },
          { expires_at: { $gt: new Date() } }
        ];
      }

      const announcements = await CourseAnnouncement.find(filter)
        .populate('created_by', 'first_name last_name username')
        .sort({ is_pinned: -1, published_at: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit));

      // Get read status for each announcement
      const announcementIds = announcements.map(a => a._id);
      const readRecords = await AnnouncementRead.find({
        announcement_id: { $in: announcementIds },
        user_id: userId
      });

      const readMap = {};
      readRecords.forEach(record => {
        readMap[record.announcement_id.toString()] = record;
      });

      // Add read status to announcements
      const announcementsWithReadStatus = announcements.map(announcement => ({
        ...announcement.toObject(),
        is_read: !!readMap[announcement._id.toString()],
        read_at: readMap[announcement._id.toString()]?.read_at
      }));

      res.status(200).json({
        success: true,
        data: announcementsWithReadStatus,
        count: announcementsWithReadStatus.length
      });
    } catch (error) {
      console.error('Error fetching course announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course announcements',
        error: error.message
      });
    }
  }

  // Mark announcement as read
  async markAnnouncementRead(req, res) {
    try {
      const { announcementId } = req.params;
      const userId = req.user.id;
      const { read_duration_seconds, device_info } = req.body;

      // Get announcement to verify it exists and get course_id
      const announcement = await CourseAnnouncement.findById(announcementId);
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // Check if already read
      const existingRead = await AnnouncementRead.findOne({
        announcement_id: announcementId,
        user_id: userId
      });

      if (existingRead) {
        return res.status(200).json({
          success: true,
          message: 'Announcement already marked as read',
          data: existingRead
        });
      }

      // Create read record
      const readRecord = new AnnouncementRead({
        announcement_id: announcementId,
        user_id: userId,
        course_id: announcement.course_id,
        read_duration_seconds: read_duration_seconds || 0,
        device_info: device_info || req.headers['user-agent']
      });

      await readRecord.save();

      // Increment view count
      await CourseAnnouncement.findByIdAndUpdate(announcementId, {
        $inc: { view_count: 1 }
      });

      res.status(200).json({
        success: true,
        message: 'Announcement marked as read',
        data: readRecord
      });
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark announcement as read',
        error: error.message
      });
    }
  }

  // Update an announcement
  async updateAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const announcement = await CourseAnnouncement.findById(announcementId);
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // Check permissions (only creator or admin can update)
      const allowedRoles = ['admin', 'super_admin'];
      const isCreator = announcement.created_by.toString() === userId;

      if (!isCreator && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this announcement'
        });
      }

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.created_at;
      delete updateData.created_by;
      delete updateData.course_id;

      updateData.updated_at = Date.now();
      if (updateData.expires_at) {
        updateData.expires_at = new Date(updateData.expires_at);
      }

      const updatedAnnouncement = await CourseAnnouncement.findByIdAndUpdate(
        announcementId,
        updateData,
        { new: true, runValidators: true }
      ).populate('created_by', 'first_name last_name username');

      res.status(200).json({
        success: true,
        message: 'Announcement updated successfully',
        data: updatedAnnouncement
      });
    } catch (error) {
      console.error('Error updating announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update announcement',
        error: error.message
      });
    }
  }

  // Delete an announcement
  async deleteAnnouncement(req, res) {
    try {
      const { announcementId } = req.params;
      const userId = req.user.id;

      const announcement = await CourseAnnouncement.findById(announcementId);
      if (!announcement) {
        return res.status(404).json({
          success: false,
          message: 'Announcement not found'
        });
      }

      // Check permissions (only creator or admin can delete)
      const allowedRoles = ['admin', 'super_admin'];
      const isCreator = announcement.created_by.toString() === userId;

      if (!isCreator && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this announcement'
        });
      }

      // Soft delete by marking as unpublished
      await CourseAnnouncement.findByIdAndUpdate(announcementId, {
        is_published: false,
        updated_at: Date.now()
      });

      res.status(200).json({
        success: true,
        message: 'Announcement deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete announcement',
        error: error.message
      });
    }
  }

  // Get announcement statistics for faculty
  async getAnnouncementStats(req, res) {
    try {
      const { courseId } = req.params;

      // Check if user has permission to view stats
      const allowedRoles = ['faculty', 'admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const stats = await CourseAnnouncement.aggregate([
        { $match: { course_id: mongoose.Types.ObjectId(courseId), is_published: true } },
        {
          $group: {
            _id: null,
            total_announcements: { $sum: 1 },
            pinned_announcements: {
              $sum: { $cond: [{ $eq: ['$is_pinned', true] }, 1, 0] }
            },
            urgent_announcements: {
              $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] }
            },
            total_views: { $sum: '$view_count' }
          }
        }
      ]);

      const result = stats[0] || {
        total_announcements: 0,
        pinned_announcements: 0,
        urgent_announcements: 0,
        total_views: 0
      };

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching announcement stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcement stats',
        error: error.message
      });
    }
  }
}

module.exports = new AnnouncementController();
