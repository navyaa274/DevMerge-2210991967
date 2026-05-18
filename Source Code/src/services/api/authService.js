import apiClient from './apiClient';

/**
 * Optimized Authentication Service
 * Centralizes all auth-related API calls
 */
const authService = {
    login: async (credentials) => {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = error?.formattedMessage || error?.response?.data?.message || error?.message || 'Login failed';
            throw errorMsg;
        }
    },

    register: async (userData) => {
        try {
            const response = await apiClient.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            const errorMsg = error?.formattedMessage || error?.response?.data?.message || error?.message || 'Registration failed';
            throw errorMsg;
        }
    },

    verifyOtp: async (data) => {
        try {
            const response = await apiClient.post('/auth/verify-otp', data);
            return response.data;
        } catch (error) {
            console.error('OTP verification error:', error);
            const errorMsg = error?.formattedMessage || error?.response?.data?.message || error?.message || 'OTP verification failed';
            throw errorMsg;
        }
    },

    logout: async () => {
        try {
            const response = await apiClient.post('/auth/logout');
            return response.data;
        } catch (error) {
            // Still return success locally even if server logout fails
            return { success: true };
        }
    }
};

export default authService;
