import apiClient from './apiClient';

/**
 * AI Copilot Service for Faculty
 */
const copilotService = {
    // Trigger generation tasks (assignments, lecture notes, etc)
    triggerGeneration: async (tool, data) => {
        const endpoint = tool === 'lecture' ? '/faculty-copilot/generate-lecture' : '/faculty-copilot/generate-assignment';
        const response = await apiClient.post(endpoint, data);
        return response;
    },

    // Check status of a background generation job
    getJobStatus: async (jobId) => {
        const response = await apiClient.get(`/institutional/job/copilot/${jobId}`);
        return response;
    },

    // Approve and publish an AI-generated assignment to students
    publishAssignment: async (data) => {
        const response = await apiClient.post('/faculty-copilot/publish-assignment', data);
        return response.data;
    }
};

export default copilotService;
