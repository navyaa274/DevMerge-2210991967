import apiClient from './apiClient';

class AnnouncementService {
  // Create a new announcement
  async createAnnouncement(courseId, announcementData) {
    try {
      const response = await apiClient.post(`/assessment/courses/${courseId}/announcements`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  // Get announcements for a course
  async getCourseAnnouncements(courseId, params = {}) {
    try {
      const response = await apiClient.get(`/assessment/courses/${courseId}/announcements`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching course announcements:', error);
      throw error;
    }
  }

  // Mark announcement as read
  async markAnnouncementRead(announcementId, readData = {}) {
    try {
      const response = await apiClient.post(`/assessment/announcements/${announcementId}/read`, readData);
      return response.data;
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      throw error;
    }
  }

  // Update an announcement
  async updateAnnouncement(announcementId, announcementData) {
    try {
      const response = await apiClient.put(`/assessment/announcements/${announcementId}`, announcementData);
      return response.data;
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  }

  // Delete an announcement
  async deleteAnnouncement(announcementId) {
    try {
      const response = await apiClient.delete(`/assessment/announcements/${announcementId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }

  // Get announcement statistics (for faculty)
  async getAnnouncementStats(courseId) {
    try {
      const response = await apiClient.get(`/assessment/courses/${courseId}/announcements/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching announcement stats:', error);
      throw error;
    }
  }
}

export default new AnnouncementService();
