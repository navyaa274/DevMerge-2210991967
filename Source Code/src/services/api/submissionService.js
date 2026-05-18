import apiClient from './apiClient';

/**
 * Submission Management Service
 */
const submissionService = {
    // Get student submissions with filters
    getSubmissions: async (params) => {
        try {
            const response = await apiClient.get('/submissions', { params });
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Get specific submission details
    getSubmissionDetails: async (submissionId) => {
        try {
            const response = await apiClient.get(`/submissions/${submissionId}`);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Submit code/file for evaluation
    createSubmission: async (data) => {
        try {
            const response = await apiClient.post('/submissions', data);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    }
};

export default submissionService;
