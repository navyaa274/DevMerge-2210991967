import apiClient from './apiClient';

class LessonProgressService {
  // Mark a lesson as completed
  async completeLesson(lessonId, completionData = {}) {
    try {
      const response = await apiClient.post(`/assessment/lessons/${lessonId}/complete`, completionData);
      return response.data;
    } catch (error) {
      console.error('Error completing lesson:', error);
      throw error;
    }
  }

  // Get lesson progress for current user
  async getLessonProgress(lessonId) {
    try {
      const response = await apiClient.get(`/assessment/lessons/${lessonId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
      throw error;
    }
  }

  // Get all lesson progress for a course
  async getUserLessonProgress(courseId) {
    try {
      const response = await apiClient.get(`/assessment/courses/${courseId}/progress/lessons`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user lesson progress:', error);
      throw error;
    }
  }
}

export default new LessonProgressService();
