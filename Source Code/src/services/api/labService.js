import apiClient from './apiClient';

/**
 * Lab and AI Generator Service
 */
const labService = {
    // Get all labs
    getLabs: async (params) => {
        try {
            const response = await apiClient.get('/labs', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching labs:', error);
            throw error;
        }
    },

    // Get suggested labs based on performance
    getSuggestedLabs: async () => {
        try {
            const response = await apiClient.get('/labs/suggested');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get AI engine health/status
    getAIHealth: async () => {
        try {
            const response = await apiClient.get('/ai/health');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Generate a lab using AI
    generateLab: async (config) => {
        try {
            const response = await apiClient.post('/labs/generate', config);
            return response.data;
        } catch (error) {
            console.error('Error generating lab:', error);
            throw error;
        }
    }
};

export default labService;
