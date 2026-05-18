import apiClient from './apiClient';

/**
 * User Service for Profile and Account Management
 */
const userService = {
    updateProfile: async (formData) => {
        try {
            const response = await apiClient.put('/users/profile', formData);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    },

    changePassword: async (passwordData) => {
        try {
            const response = await apiClient.put('/users/change-password', passwordData);
            return response.data;
        } catch (error) {
            throw error.formattedMessage;
        }
    }
};

export default userService;
