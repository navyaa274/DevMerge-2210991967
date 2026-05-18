const Lesson = require('../../models/assessment/lessons');

class LessonsController {
  // Create a new lesson for a module
  async createLesson(req, res) {
    try {
      const { moduleId } = req.params;
      const {
        title,
        type,
        content,
        content_url,
        duration,
        order_index,
        is_published,
        is_required,
        prerequisites,
        metadata,
        tags
      } = req.body;

      // Get the highest order_index for this module to auto-increment if not provided
      let lessonOrderIndex = order_index;
      if (lessonOrderIndex === undefined || lessonOrderIndex === null) {
        const lastLesson = await Lesson.findOne({ module_id: moduleId })
          .sort({ order_index: -1 })
          .select('order_index');
        lessonOrderIndex = lastLesson ? lastLesson.order_index + 1 : 0;
      }

      const newLesson = new Lesson({
        module_id: moduleId,
        title,
        type: type || 'text',
        content,
        content_url,
        duration: duration || 0,
        order_index: lessonOrderIndex,
        is_published: is_published !== undefined ? is_published : true,
        is_required: is_required !== undefined ? is_required : true,
        prerequisites: prerequisites || [],
        metadata: metadata || {},
        tags: tags || []
      });

      const savedLesson = await newLesson.save();

      // Populate module reference for response
      await savedLesson.populate('module_id', 'title');
      await savedLesson.populate('prerequisites', 'title');

      res.status(201).json({
        success: true,
        message: 'Lesson created successfully',
        data: savedLesson
      });
    } catch (error) {
      console.error('Error creating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create lesson',
        error: error.message
      });
    }
  }

  // Get all lessons for a module
  async getModuleLessons(req, res) {
    try {
      const { moduleId } = req.params;
      const { include_unpublished = false } = req.query;

      let filter = { module_id: moduleId };
      if (!include_unpublished) {
        filter.is_published = true;
      }

      const lessons = await Lesson.find(filter)
        .populate('module_id', 'title')
        .populate('prerequisites', 'title')
        .sort({ order_index: 1 });

      res.status(200).json({
        success: true,
        data: lessons,
        count: lessons.length
      });
    } catch (error) {
      console.error('Error fetching module lessons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch module lessons',
        error: error.message
      });
    }
  }

  // Get a specific lesson by ID
  async getLessonById(req, res) {
    try {
      const { lessonId } = req.params;

      const lesson = await Lesson.findById(lessonId)
        .populate('module_id', 'title course_id')
        .populate('prerequisites', 'title');

      if (!lesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      res.status(200).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      console.error('Error fetching lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lesson',
        error: error.message
      });
    }
  }

  // Update a lesson
  async updateLesson(req, res) {
    try {
      const { lessonId } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.created_at;

      updateData.updated_at = Date.now();

      const updatedLesson = await Lesson.findByIdAndUpdate(
        lessonId,
        updateData,
        { new: true, runValidators: true }
      ).populate('module_id', 'title');

      if (!updatedLesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lesson updated successfully',
        data: updatedLesson
      });
    } catch (error) {
      console.error('Error updating lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lesson',
        error: error.message
      });
    }
  }

  // Delete a lesson
  async deleteLesson(req, res) {
    try {
      const { lessonId } = req.params;

      // Check if lesson is prerequisite for other lessons before deleting
      const prerequisiteCount = await Lesson.countDocuments({
        prerequisites: lessonId
      });

      if (prerequisiteCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete lesson that is a prerequisite for other lessons.'
        });
      }

      const deletedLesson = await Lesson.findByIdAndDelete(lessonId);

      if (!deletedLesson) {
        return res.status(404).json({
          success: false,
          message: 'Lesson not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lesson',
        error: error.message
      });
    }
  }

  // Reorder lessons within a module
  async reorderLessons(req, res) {
    try {
      const { moduleId } = req.params;
      const { lessonOrder } = req.body; // Array of lesson IDs in new order

      if (!Array.isArray(lessonOrder)) {
        return res.status(400).json({
          success: false,
          message: 'lessonOrder must be an array of lesson IDs'
        });
      }

      // Update order_index for each lesson
      const updatePromises = lessonOrder.map((lessonId, index) =>
        Lesson.findByIdAndUpdate(lessonId, { order_index: index })
      );

      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: 'Lessons reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering lessons:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder lessons',
        error: error.message
      });
    }
  }
}

module.exports = new LessonsController();
