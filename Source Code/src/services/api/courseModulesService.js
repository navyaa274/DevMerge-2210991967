import apiClient from './apiClient';

class CourseModulesService {
  // Get all modules for a course
  async getCourseModules(courseId, includeUnpublished = false) {
    try {
      const response = await apiClient.get(`/assessment/courses/${courseId}/modules`, {
        params: { include_unpublished: includeUnpublished }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course modules:', error);
      throw error;
    }
  }

  // Get a specific module by ID
  async getModuleById(moduleId) {
    try {
      const response = await apiClient.get(`/assessment/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching module:', error);
      throw error;
    }
  }

  // Create a new module
  async createModule(courseId, moduleData) {
    try {
      const response = await apiClient.post(`/assessment/courses/${courseId}/modules`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  }

  // Update a module
  async updateModule(moduleId, moduleData) {
    try {
      const response = await apiClient.put(`/assessment/modules/${moduleId}`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error updating module:', error);
      throw error;
    }
  }

  // Delete a module
  async deleteModule(moduleId) {
    try {
      const response = await apiClient.delete(`/assessment/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting module:', error);
      throw error;
    }
  }

  // Reorder modules
  async reorderModules(courseId, moduleOrder) {
    try {
      const response = await apiClient.put(`/assessment/courses/${courseId}/modules/reorder`, {
        moduleOrder
      });
      return response.data;
    } catch (error) {
      console.error('Error reordering modules:', error);
      throw error;
    }
  }
}

export default new CourseModulesService();
