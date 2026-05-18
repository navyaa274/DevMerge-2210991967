import apiClient from './apiClient';

class ForumService {
  // Get or create forum for a course
  async getOrCreateCourseForum(courseId) {
    try {
      const response = await apiClient.get(`/assessment/courses/${courseId}/forum`);
      return response.data;
    } catch (error) {
      console.error('Error getting course forum:', error);
      throw error;
    }
  }

  // Update forum settings
  async updateForum(forumId, forumData) {
    try {
      const response = await apiClient.put(`/assessment/forums/${forumId}`, forumData);
      return response.data;
    } catch (error) {
      console.error('Error updating forum:', error);
      throw error;
    }
  }

  // Create a new thread
  async createThread(forumId, threadData) {
    try {
      const response = await apiClient.post(`/assessment/forums/${forumId}/threads`, threadData);
      return response.data;
    } catch (error) {
      console.error('Error creating thread:', error);
      throw error;
    }
  }

  // Get threads for a forum
  async getForumThreads(forumId, params = {}) {
    try {
      const response = await apiClient.get(`/assessment/forums/${forumId}/threads`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching forum threads:', error);
      throw error;
    }
  }

  // Get a specific thread with replies
  async getThread(threadId) {
    try {
      const response = await apiClient.get(`/assessment/threads/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching thread:', error);
      throw error;
    }
  }

  // Create a reply to a thread
  async createReply(threadId, replyData) {
    try {
      const response = await apiClient.post(`/assessment/threads/${threadId}/replies`, replyData);
      return response.data;
    } catch (error) {
      console.error('Error creating reply:', error);
      throw error;
    }
  }

  // Update a thread
  async updateThread(threadId, threadData) {
    try {
      const response = await apiClient.put(`/assessment/threads/${threadId}`, threadData);
      return response.data;
    } catch (error) {
      console.error('Error updating thread:', error);
      throw error;
    }
  }
}

export default new ForumService();
