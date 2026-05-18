const LessonProgress = require('../../models/assessment/lessonProgress');
const CourseProgress = require('../../models/assessment/courseProgress');
const Lesson = require('../../models/assessment/lessons');
const CourseModule = require('../../models/assessment/courseModules');

class LessonProgressController {
  // Mark a lesson as completed
  async completeLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;
      const { time_spent_seconds, score, feedback, metadata } = req.body;

      // Check if lesson exists
      const lesson = await Lesson.findById(lessonId);
      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      // Find or create lesson progress record
      let lessonProgress = await LessonProgress.findOne({
        user_id: userId,
        lesson_id: lessonId
      });

      const now = Date.now();
      const isFirstCompletion = !lessonProgress || !lessonProgress.completed;

      if (lessonProgress) {
        // Update existing progress
        lessonProgress.completed = true;
        lessonProgress.completed_at = now;
        lessonProgress.time_spent_seconds = (lessonProgress.time_spent_seconds || 0) + (time_spent_seconds || 0);
        lessonProgress.progress_percentage = 100;
        lessonProgress.attempts_count += 1;

        if (score !== undefined) lessonProgress.score = score;
        if (feedback) lessonProgress.feedback = feedback;
        if (metadata) lessonProgress.metadata = { ...lessonProgress.metadata, ...metadata };

        await lessonProgress.save();
      } else {
        // Create new progress record
        lessonProgress = new LessonProgress({
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: now,
          time_spent_seconds: time_spent_seconds || 0,
          progress_percentage: 100,
          attempts_count: 1,
          score: score || null,
          feedback: feedback || null,
          metadata: metadata || {}
        });

        await lessonProgress.save();
      }

      // Update course progress after lesson completion
      await this.updateCourseProgress(userId, lesson.module_id);

      res.status(200).json({
        success: true,
        message: 'Lesson completed successfully',
        data: lessonProgress,
        is_first_completion: isFirstCompletion
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete lesson',
        error: error.message
      });
    }
  }

  // Get lesson progress for a user
  async getLessonProgress(req, res) {
    try {
      const { lessonId } = req.params;
      const userId = req.user.id;

      const lessonProgress = await LessonProgress.findOne({
        user_id: userId,
        lesson_id: lessonId
      }).populate('lesson_id', 'title type duration');

      res.status(200).json({
        success: true,
        data: lessonProgress || null
      });
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lesson progress',
        error: error.message
      });
    }
  }

  // Get all lesson progress for a user in a course
  async getUserLessonProgress(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      // Get all lessons in the course
      const modules = await CourseModule.find({ course_id: courseId });
      const moduleIds = modules.map(m => m._id);

      const lessons = await Lesson.find({ module_id: { $in: moduleIds } });
      const lessonIds = lessons.map(l => l._id);

      // Get progress for all lessons
      const progressRecords = await LessonProgress.find({
        user_id: userId,
        lesson_id: { $in: lessonIds }
      }).populate('lesson_id', 'title type duration order_index module_id');

      // Create a map for quick lookup
      const progressMap = {};
      progressRecords.forEach(record => {
        progressMap[record.lesson_id._id.toString()] = record;
      });

      // Add progress info to lessons
      const lessonsWithProgress = lessons.map(lesson => ({
        ...lesson.toObject(),
        progress: progressMap[lesson._id.toString()] || null
      }));

      res.status(200).json({
        success: true,
        data: lessonsWithProgress
      });
    } catch (error) {
      console.error('Error fetching user lesson progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user lesson progress',
        error: error.message
      });
    }
  }

  // Update course progress when a lesson is completed
  async updateCourseProgress(userId, moduleId) {
    try {
      // Find the course for this module
      const module = await CourseModule.findById(moduleId);
      if (!module) return;

      const courseId = module.course_id;

      // Get all lessons in the course
      const modules = await CourseModule.find({ course_id: courseId });
      const moduleIds = modules.map(m => m._id);

      const allLessons = await Lesson.find({ module_id: { $in: moduleIds } });
      const totalLessons = allLessons.length;

      // Get completed lessons count
      const completedLessons = await LessonProgress.countDocuments({
        user_id: userId,
        lesson_id: { $in: allLessons.map(l => l._id) },
        completed: true
      });

      // Calculate module progress
      const moduleProgress = [];
      for (const mod of modules) {
        const moduleLessons = allLessons.filter(l => l.module_id.toString() === mod._id.toString());
        const moduleLessonIds = moduleLessons.map(l => l._id);

        const completedModuleLessons = await LessonProgress.countDocuments({
          user_id: userId,
          lesson_id: { $in: moduleLessonIds },
          completed: true
        });

        const moduleProgressPercentage = moduleLessons.length > 0
          ? Math.round((completedModuleLessons / moduleLessons.length) * 100)
          : 0;

        moduleProgress.push({
          module_id: mod._id,
          completed_lessons: completedModuleLessons,
          total_lessons: moduleLessons.length,
          progress_percentage: moduleProgressPercentage,
          completed: moduleProgressPercentage === 100,
          completed_at: moduleProgressPercentage === 100 ? Date.now() : null
        });
      }

      // Update or create course progress
      const courseProgressData = {
        user_id: userId,
        course_id: courseId,
        completed_lessons: completedLessons,
        total_lessons: totalLessons,
        completed_modules: moduleProgress.filter(m => m.completed).length,
        total_modules: modules.length,
        module_progress: moduleProgress,
        status: completedLessons === 0 ? 'not_started' :
                completedLessons === totalLessons ? 'completed' : 'in_progress'
      };

      await CourseProgress.findOneAndUpdate(
        { user_id: userId, course_id: courseId },
        courseProgressData,
        { upsert: true, new: true }
      );

    } catch (error) {
      console.error('Error updating course progress:', error);
    }
  }
}

module.exports = new LessonProgressController();
