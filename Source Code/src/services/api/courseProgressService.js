import apiClient from './apiClient';

class CourseProgressService {
  // Get progress for a specific user
  async getUserProgress(userId) {
    try {
      const response = await apiClient.get(`/assessment/users/${userId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      throw error;
    }
  }

  // Get progress for a specific course
  async getCourseProgress(courseId) {
    try {
      const response = await apiClient.get(`/assessment/courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  }

  // Update current position in course
  async updateCurrentPosition(courseId, positionData) {
    try {
      const response = await apiClient.put(`/assessment/courses/${courseId}/progress/position`, positionData);
      return response.data;
    } catch (error) {
      console.error('Error updating current position:', error);
      throw error;
    }
  }

  // Get course progress statistics (for faculty)
  async getCourseProgressStats(courseId) {
    try {
      const response = await apiClient.get(`/assessment/courses/${courseId}/progress/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress stats:', error);
      throw error;
    }
  }
}

export default new CourseProgressService();
