const CourseModule = require('../../models/assessment/courseModules');

class CourseModulesController {
  // Create a new module for a course
  async createModule(req, res) {
    try {
      const { courseId } = req.params;
      const { title, description, order_index, is_published, estimated_duration, prerequisites } = req.body;

      // Get the highest order_index for this course to auto-increment if not provided
      let moduleOrderIndex = order_index;
      if (moduleOrderIndex === undefined || moduleOrderIndex === null) {
        const lastModule = await CourseModule.findOne({ course_id: courseId })
          .sort({ order_index: -1 })
          .select('order_index');
        moduleOrderIndex = lastModule ? lastModule.order_index + 1 : 0;
      }

      const newModule = new CourseModule({
        course_id: courseId,
        title,
        description,
        order_index: moduleOrderIndex,
        is_published: is_published !== undefined ? is_published : true,
        estimated_duration: estimated_duration || 0,
        prerequisites: prerequisites || []
      });

      const savedModule = await newModule.save();

      // Populate course reference for response
      await savedModule.populate('course_id', 'title code');

      res.status(201).json({
        success: true,
        message: 'Module created successfully',
        data: savedModule
      });
    } catch (error) {
      console.error('Error creating module:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create module',
        error: error.message
      });
    }
  }

  // Get all modules for a course
  async getCourseModules(req, res) {
    try {
      const { courseId } = req.params;
      const { include_unpublished = false } = req.query;

      let filter = { course_id: courseId };
      if (!include_unpublished) {
        filter.is_published = true;
      }

      const modules = await CourseModule.find(filter)
        .populate('course_id', 'title code')
        .populate('prerequisites', 'title')
        .sort({ order_index: 1 });

      // Get lesson count for each module
      const modulesWithStats = await Promise.all(
        modules.map(async (module) => {
          const lessonCount = await require('../../models/assessment/lessons').countDocuments({
            module_id: module._id,
            is_published: true
          });

          return {
            ...module.toObject(),
            lesson_count: lessonCount
          };
        })
      );

      res.status(200).json({
        success: true,
        data: modulesWithStats,
        count: modulesWithStats.length
      });
    } catch (error) {
      console.error('Error fetching course modules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course modules',
        error: error.message
      });
    }
  }

  // Get a specific module by ID
  async getModuleById(req, res) {
    try {
      const { moduleId } = req.params;

      const module = await CourseModule.findById(moduleId)
        .populate('course_id', 'title code description')
        .populate('prerequisites', 'title');

      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      res.status(200).json({
        success: true,
        data: module
      });
    } catch (error) {
      console.error('Error fetching module:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch module',
        error: error.message
      });
    }
  }

  // Update a module
  async updateModule(req, res) {
    try {
      const { moduleId } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData._id;
      delete updateData.created_at;

      updateData.updated_at = Date.now();

      const updatedModule = await CourseModule.findByIdAndUpdate(
        moduleId,
        updateData,
        { new: true, runValidators: true }
      ).populate('course_id', 'title code');

      if (!updatedModule) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Module updated successfully',
        data: updatedModule
      });
    } catch (error) {
      console.error('Error updating module:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update module',
        error: error.message
      });
    }
  }

  // Delete a module
  async deleteModule(req, res) {
    try {
      const { moduleId } = req.params;

      // Check if module has lessons before deleting
      const Lesson = require('../../models/assessment/lessons');
      const lessonCount = await Lesson.countDocuments({ module_id: moduleId });

      if (lessonCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete module with existing lessons. Please delete lessons first.'
        });
      }

      const deletedModule = await CourseModule.findByIdAndDelete(moduleId);

      if (!deletedModule) {
        return res.status(404).json({
          success: false,
          message: 'Module not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Module deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting module:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete module',
        error: error.message
      });
    }
  }

  // Reorder modules
  async reorderModules(req, res) {
    try {
      const { courseId } = req.params;
      const { moduleOrder } = req.body; // Array of module IDs in new order

      if (!Array.isArray(moduleOrder)) {
        return res.status(400).json({
          success: false,
          message: 'moduleOrder must be an array of module IDs'
        });
      }

      // Update order_index for each module
      const updatePromises = moduleOrder.map((moduleId, index) =>
        CourseModule.findByIdAndUpdate(moduleId, { order_index: index })
      );

      await Promise.all(updatePromises);

      res.status(200).json({
        success: true,
        message: 'Modules reordered successfully'
      });
    } catch (error) {
      console.error('Error reordering modules:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reorder modules',
        error: error.message
      });
    }
  }
}

module.exports = new CourseModulesController();
