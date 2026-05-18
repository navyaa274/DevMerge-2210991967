import apiClient from './apiClient';

class QuestionBankService {
  // Create a new question bank
  async createQuestionBank(questionBankData) {
    try {
      const response = await apiClient.post('/assessment/question-banks', questionBankData);
      return response.data;
    } catch (error) {
      console.error('Error creating question bank:', error);
      throw error;
    }
  }

  // Get question banks for a course
  async getCourseQuestionBanks(courseId, params = {}) {
    try {
      const response = await apiClient.get(`/assessment/courses/${courseId}/question-banks`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching course question banks:', error);
      throw error;
    }
  }

  // Get a specific question bank with questions
  async getQuestionBank(questionBankId) {
    try {
      const response = await apiClient.get(`/assessment/question-banks/${questionBankId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching question bank:', error);
      throw error;
    }
  }

  // Create a new question
  async createQuestion(questionBankId, questionData) {
    try {
      const response = await apiClient.post(`/assessment/question-banks/${questionBankId}/questions`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  // Get random questions from question bank(s)
  async getRandomQuestions(questionBankIds, options = {}) {
    try {
      const requestData = {
        questionBankIds,
        count: options.count || 10,
        difficulty: options.difficulty,
        subject: options.subject,
        topic: options.topic
      };
      const response = await apiClient.post('/assessment/question-banks/random-questions', requestData);
      return response.data;
    } catch (error) {
      console.error('Error fetching random questions:', error);
      throw error;
    }
  }

  // Start a quiz attempt
  async startQuizAttempt(attemptData) {
    try {
      const response = await apiClient.post('/assessment/quiz-attempts', attemptData);
      return response.data;
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      throw error;
    }
  }

  // Submit quiz answers
  async submitQuizAnswers(attemptId, answers) {
    try {
      const response = await apiClient.post(`/assessment/quiz-attempts/${attemptId}/answers`, { answers });
      return response.data;
    } catch (error) {
      console.error('Error submitting quiz answers:', error);
      throw error;
    }
  }

  // Get quiz attempt results
  async getQuizAttemptResults(attemptId) {
    try {
      const response = await apiClient.get(`/assessment/quiz-attempts/${attemptId}/results`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt results:', error);
      throw error;
    }
  }

  // Update a question bank
  async updateQuestionBank(questionBankId, updateData) {
    try {
      const response = await apiClient.put(`/assessment/question-banks/${questionBankId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating question bank:', error);
      throw error;
    }
  }

  // Delete a question bank
  async deleteQuestionBank(questionBankId) {
    try {
      const response = await apiClient.delete(`/assessment/question-banks/${questionBankId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question bank:', error);
      throw error;
    }
  }

  // Update a question
  async updateQuestion(questionId, updateData) {
    try {
      const response = await apiClient.put(`/assessment/questions/${questionId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  // Delete a question
  async deleteQuestion(questionId) {
    try {
      const response = await apiClient.delete(`/assessment/questions/${questionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  // Get question statistics
  async getQuestionBankStats(questionBankId) {
    try {
      const response = await apiClient.get(`/assessment/question-banks/${questionBankId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching question bank stats:', error);
      throw error;
    }
  }
}

export default new QuestionBankService();
