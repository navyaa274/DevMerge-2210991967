import apiClient from './apiClient';

/**
 * Weakness Analysis Service
 */
const weaknessService = {
    getDiagnosis: async (userId, courseId) => {
        try {
            const response = await apiClient.get(`/analytics/weakness-analysis/student/${userId}`, {
                params: { courseId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getHistory: async (userId, courseId) => {
        try {
            const response = await apiClient.get(`/analytics/weakness-analysis/student/${userId}/history`, {
                params: { courseId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getImprovement: async (userId, courseId) => {
        try {
            const response = await apiClient.get(`/analytics/weakness-analysis/student/${userId}/improvement`, {
                params: { courseId }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default weaknessService;
