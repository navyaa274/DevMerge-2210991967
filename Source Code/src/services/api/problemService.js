import apiClient from './apiClient';

/**
 * Coding Problem Service
 */
const problemService = {
    // Get all problems or filter by difficulty/category
    getProblems: async (params) => {
        try {
            const response = await apiClient.get('/problems', { params });
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Get specific problem details
    getProblemById: async (id) => {
        try {
            const response = await apiClient.get(`/problems/${id}`);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Execute code against test cases
    executeCode: async (data) => {
        try {
            const response = await apiClient.post('/code/execute', data);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Submit solution for final evaluation
    submitSolution: async (data) => {
        try {
            const response = await apiClient.post('/submissions', data);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Get user's submissions for a specific problem
    getMySubmissions: async (problemId) => {
        try {
            const response = await apiClient.get(`/submissions/problem/${problemId}/my`);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Request AI hint for a problem
    requestHint: async (data) => {
        try {
            const response = await apiClient.post('/ai/hint', data);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Get learning path details for context
    getLearningPath: async (pathId) => {
        try {
            const response = await apiClient.get(`/learning-paths/${pathId}`);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    // Mark content as complete in learning path
    markComplete: async (pathId, data) => {
        try {
            const response = await apiClient.post(`/user-progress/${pathId}/complete`, data);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    }
};

export default problemService;
