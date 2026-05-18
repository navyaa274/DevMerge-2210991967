const CourseProgress = require('../../models/assessment/courseProgress');
const CourseModule = require('../../models/assessment/courseModules');
const Lesson = require('../../models/assessment/lessons');
const LessonProgress = require('../../models/assessment/lessonProgress');

class CourseProgressController {
  // Get course progress for a user
  async getUserProgress(req, res) {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user.id;

      // Only allow users to view their own progress or faculty/admin to view any progress
      if (requestingUserId !== userId && !['faculty', 'admin', 'super_admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const progressRecords = await CourseProgress.find({ user_id: userId })
        .populate('course_id', 'title code description')
        .populate('current_module_id', 'title')
        .populate('current_lesson_id', 'title')
        .sort({ last_activity_at: -1 });

      res.status(200).json({
        success: true,
        data: progressRecords
      });
    } catch (error) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user progress',
        error: error.message
      });
    }
  }

  // Get detailed progress for a specific course
  async getCourseProgress(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      let courseProgress = await CourseProgress.findOne({
        user_id: userId,
        course_id: courseId
      }).populate('course_id', 'title code description')
        .populate('current_module_id', 'title')
        .populate('current_lesson_id', 'title')
        .populate('module_progress.module_id', 'title description');

      // If no progress record exists, initialize it
      if (!courseProgress) {
        courseProgress = await this.initializeCourseProgress(userId, courseId);
      }

      res.status(200).json({
        success: true,
        data: courseProgress
      });
    } catch (error) {
      console.error('Error fetching course progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course progress',
        error: error.message
      });
    }
  }

  // Initialize course progress for a user
  async initializeCourseProgress(userId, courseId) {
    try {
      // Get all modules for the course
      const modules = await CourseModule.find({ course_id: courseId }).sort({ order_index: 1 });

      // Get all lessons for these modules
      const moduleIds = modules.map(m => m._id);
      const lessons = await Lesson.find({ module_id: { $in: moduleIds } });

      // Calculate module progress
      const moduleProgress = [];
      let totalLessons = 0;

      for (const module of modules) {
        const moduleLessons = lessons.filter(l => l.module_id.toString() === module._id.toString());
        const lessonCount = moduleLessons.length;
        totalLessons += lessonCount;

        moduleProgress.push({
          module_id: module._id,
          completed_lessons: 0,
          total_lessons: lessonCount,
          progress_percentage: 0,
          completed: false,
          completed_at: null
        });
      }

      // Create course progress record
      const courseProgress = new CourseProgress({
        user_id: userId,
        course_id: courseId,
        completed_lessons: 0,
        total_lessons: totalLessons,
        completed_modules: 0,
        total_modules: modules.length,
        module_progress: moduleProgress,
        status: 'not_started',
        current_module_id: modules.length > 0 ? modules[0]._id : null,
        current_lesson_id: null
      });

      await courseProgress.save();

      // Populate and return
      return await CourseProgress.findById(courseProgress._id)
        .populate('course_id', 'title code description')
        .populate('current_module_id', 'title')
        .populate('module_progress.module_id', 'title description');

    } catch (error) {
      console.error('Error initializing course progress:', error);
      throw error;
    }
  }

  // Update current position in course
  async updateCurrentPosition(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;
      const { moduleId, lessonId } = req.body;

      const updateData = {
        last_activity_at: Date.now()
      };

      if (moduleId) updateData.current_module_id = moduleId;
      if (lessonId) updateData.current_lesson_id = lessonId;

      const courseProgress = await CourseProgress.findOneAndUpdate(
        { user_id: userId, course_id: courseId },
        updateData,
        { new: true, upsert: false }
      ).populate('course_id', 'title code')
        .populate('current_module_id', 'title')
        .populate('current_lesson_id', 'title');

      if (!courseProgress) {
        return res.status(404).json({
          success: false,
          message: 'Course progress not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Current position updated',
        data: courseProgress
      });
    } catch (error) {
      console.error('Error updating current position:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update current position',
        error: error.message
      });
    }
  }

  // Get progress statistics for a course (for faculty)
  async getCourseProgressStats(req, res) {
    try {
      const { courseId } = req.params;

      const stats = await CourseProgress.aggregate([
        { $match: { course_id: mongoose.Types.ObjectId(courseId) } },
        {
          $group: {
            _id: null,
            total_students: { $sum: 1 },
            completed_students: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            in_progress_students: {
              $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
            },
            not_started_students: {
              $sum: { $cond: [{ $eq: ['$status', 'not_started'] }, 1, 0] }
            },
            average_progress: { $avg: '$progress_percentage' },
            average_time_spent: { $avg: '$time_spent_seconds' }
          }
        }
      ]);

      const result = stats[0] || {
        total_students: 0,
        completed_students: 0,
        in_progress_students: 0,
        not_started_students: 0,
        average_progress: 0,
        average_time_spent: 0
      };

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error fetching course progress stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course progress stats',
        error: error.message
      });
    }
  }
}

module.exports = new CourseProgressController();
