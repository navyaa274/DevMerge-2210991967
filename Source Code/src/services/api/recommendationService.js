import apiClient from './apiClient';

/**
 * Recommendation Service
 */
const recommendationService = {
    getProblems: async (limit = 10) => {
        try {
            const response = await apiClient.get('/learning/recommendations/problems', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    getCourses: async (limit = 5) => {
        try {
            const response = await apiClient.get('/learning/recommendations/courses', {
                params: { limit }
            });
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    getLearningPaths: async () => {
        try {
            const response = await apiClient.get('/learning/recommendations/learning-paths');
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    refresh: async () => {
        try {
            const response = await apiClient.post('/learning/recommendations/refresh');
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    }
};

export default recommendationService;
