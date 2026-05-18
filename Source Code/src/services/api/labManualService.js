import apiClient from './apiClient';

/**
 * Lab Manual Service
 * For AI-generated comprehensive lab manuals
 */
const labManualService = {
    // Get all lab manuals with filters
    getAllLabManuals: async (filters = {}) => {
        const response = await apiClient.get('/ultimate-lab-generator/labs', { params: filters });
        return response.data.data || []; // Return the labs array
    },

    // Get single lab manual
    getLabManual: async (id) => {
        const response = await apiClient.get(`/ultimate-lab-generator/labs/${id}`);
        return response.data.data || {};
    },

    // Generate single lab
    generateLab: async (data) => {
        const response = await apiClient.post('/ultimate-lab-generator/generate', data);
        return response.data.data || {};
    },

    // Generate series of labs
    generateLabSeries: async (data) => {
        const response = await apiClient.post('/ultimate-lab-generator/series', data);
        return response.data.data || [];
    },

    // Generate viva quiz for a lab
    generateVivaQuiz: async (labId) => {
        const response = await apiClient.post(`/ultimate-lab-generator/viva-quiz/${labId}`);
        return response.data.data || {};
    },

    // Delete lab manual
    deleteLabManual: async (id) => {
        const response = await apiClient.delete(`/ultimate-lab-generator/labs/${id}`);
        return response.data;
    },

    // Assign lab to courses
    assignLabToCourses: async (id, data) => {
        const response = await apiClient.put(`/ultimate-lab-generator/labs/${id}/assign`, data);
        return response.data.data || {};
    }
};

export default labManualService;
