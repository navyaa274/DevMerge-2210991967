import apiClient from './apiClient';

class PlagiarismService {
  // Check a submission for plagiarism
  async checkSubmission(submissionId) {
    try {
      const response = await apiClient.post('/assessment/plagiarism/check', {
        submissionId
      });
      return response.data;
    } catch (error) {
      console.error('Error checking submission for plagiarism:', error);
      throw error;
    }
  }

  // Get all plagiarism reports with filtering
  async getReports(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.course_id) queryParams.append('course_id', filters.course_id);
      if (filters.problem_id) queryParams.append('problem_id', filters.problem_id);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.flagged_only) queryParams.append('flagged_only', filters.flagged_only);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);

      const response = await apiClient.get(`/assessment/plagiarism/reports?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plagiarism reports:', error);
      throw error;
    }
  }

  // Get a specific plagiarism report by ID
  async getReportById(reportId) {
    try {
      const response = await apiClient.get(`/assessment/plagiarism/reports/${reportId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching plagiarism report:', error);
      throw error;
    }
  }

  // Review and update a plagiarism report
  async reviewReport(reportId, reviewData) {
    try {
      const response = await apiClient.put(`/assessment/plagiarism/reports/${reportId}/review`, reviewData);
      return response.data;
    } catch (error) {
      console.error('Error reviewing plagiarism report:', error);
      throw error;
    }
  }

  // Get plagiarism statistics for a course (if implemented)
  async getCourseStats(courseId) {
    try {
      const response = await apiClient.get(`/assessment/plagiarism/courses/${courseId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course plagiarism stats:', error);
      throw error;
    }
  }

  // Helper methods for status management
  getStatusOptions() {
    return [
      { value: 'pending', label: 'Pending Review' },
      { value: 'processing', label: 'Processing' },
      { value: 'completed', label: 'Completed' },
      { value: 'flagged', label: 'Flagged' },
      { value: 'cleared', label: 'Cleared' }
    ];
  }

  getActionOptions() {
    return [
      { value: 'none', label: 'No Action' },
      { value: 'warning', label: 'Issue Warning' },
      { value: 'grade_penalty', label: 'Apply Grade Penalty' },
      { value: 'zero_grade', label: 'Zero Grade' },
      { value: 'academic_integrity_violation', label: 'Academic Integrity Violation' }
    ];
  }

  getConfidenceLevels() {
    return [
      { value: 'low', label: 'Low Confidence' },
      { value: 'medium', label: 'Medium Confidence' },
      { value: 'high', label: 'High Confidence' }
    ];
  }

  getDetectionMethods() {
    return [
      { value: 'moss', label: 'MOSS' },
      { value: 'copyleaks', label: 'Copyleaks' },
      { value: 'internal', label: 'Internal Algorithm' },
      { value: 'manual', label: 'Manual Review' }
    ];
  }

  // Format plagiarism score for display
  formatScore(score) {
    return `${score.toFixed(1)}%`;
  }

  // Get color class based on plagiarism score
  getScoreColorClass(score) {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    if (score >= 20) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  }

  // Check if a report should be auto-flagged based on score
  shouldAutoFlag(score) {
    return score >= 50; // Configurable threshold
  }

  // Get severity level based on score
  getSeverityLevel(score) {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'none';
  }
}

export default new PlagiarismService();
