import apiClient from './apiClient';

/**
 * Analytics Service for Predictive and Trend analysis
 */
const analyticsService = {
    getPerformancePrediction: async (userId) => {
        try {
            const response = await apiClient.get(`/analytics/predictive/performance/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getTrendAnalysis: async (userId, params) => {
        try {
            const response = await apiClient.get(`/analytics/trends/${userId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    getSkillGap: async (userId) => {
        try {
            const response = await apiClient.get(`/analytics/skill-gap/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default analyticsService;
