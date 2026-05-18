import apiClient from './apiClient';

/**
 * Admin Service for Infrastructure and Overview Management
 */
const adminService = {
    getSystemStats: async () => {
        try {
            const response = await apiClient.get('/system/stats');
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    getSystemHealth: async () => {
        try {
            const response = await apiClient.get('/system/health');
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    getAuditLogs: async () => {
        try {
            // Assuming audit-logs/public for overview or audit-logs for full access
            const response = await apiClient.get('/audit-logs/public');
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    }
};

export default adminService;
