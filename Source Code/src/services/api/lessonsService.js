import apiClient from './apiClient';

class LessonsService {
  // Get all lessons for a module
  async getModuleLessons(moduleId, includeUnpublished = false) {
    try {
      const response = await apiClient.get(`/assessment/modules/${moduleId}/lessons`, {
        params: { include_unpublished: includeUnpublished }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching module lessons:', error);
      throw error;
    }
  }

  // Get a specific lesson by ID
  async getLessonById(lessonId) {
    try {
      const response = await apiClient.get(`/assessment/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  }

  // Create a new lesson
  async createLesson(moduleId, lessonData) {
    try {
      const response = await apiClient.post(`/assessment/modules/${moduleId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Error creating lesson:', error);
      throw error;
    }
  }

  // Update a lesson
  async updateLesson(lessonId, lessonData) {
    try {
      const response = await apiClient.put(`/assessment/lessons/${lessonId}`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Error updating lesson:', error);
      throw error;
    }
  }

  // Delete a lesson
  async deleteLesson(lessonId) {
    try {
      const response = await apiClient.delete(`/assessment/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lesson:', error);
      throw error;
    }
  }

  // Reorder lessons within a module
  async reorderLessons(moduleId, lessonOrder) {
    try {
      const response = await apiClient.put(`/assessment/modules/${moduleId}/lessons/reorder`, {
        lessonOrder
      });
      return response.data;
    } catch (error) {
      console.error('Error reordering lessons:', error);
      throw error;
    }
  }
}

export default new LessonsService();
