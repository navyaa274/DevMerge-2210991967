import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { API_BASE_URL } from '../../config/urls';

/**
 * Optimized API Client with centralized configuration
 * Handles:
 * 1. Base URL configuration
 * 2. Automatic JWT injection from state
 * 3. Global 401 error handling (Logout on expiration)
 * 4. Consistent header management
 * 5. Suppresses 404 errors for non-critical endpoints
 */

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 60000, // 60 seconds for AI generation
});

// Disable Axios error logging for non-critical endpoints
const originalRequest = apiClient.request;
apiClient.request = function(config) {
    const endpoint = config.url || '';
    const isNonCritical = endpoint.includes('course-materials') || 
                         endpoint.includes('badges') || 
                         endpoint.includes('points') ||
                         endpoint.includes('leaderboard') ||
                         endpoint.includes('notifications') ||
                         endpoint.includes('announcements') ||
                         endpoint.includes('calendar');
    
    if (isNonCritical) {
        config.validateStatus = () => true; // Accept all status codes
    }
    
    return originalRequest.call(this, config);
};

// Request Interceptor: Inject Auth Token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Only log important requests (not gamification/course materials/notifications)
        const endpoint = config.url || '';
        const isNonCritical = endpoint.includes('course-materials') || 
                             endpoint.includes('badges') || 
                             endpoint.includes('points') ||
                             endpoint.includes('leaderboard') ||
                             endpoint.includes('notifications') ||
                             endpoint.includes('announcements') ||
                             endpoint.includes('calendar');
        
        if (!isNonCritical) {
            const fullUrl = `${config.baseURL}${config.url}`;
            console.log('📡 API Request:', {
                method: config.method?.toUpperCase(),
                url: fullUrl,
                baseURL: config.baseURL,
                endpoint: config.url
            });
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const originalRequest = error.config;
        const endpoint = error.config?.url || '';
        const status = error.response?.status;

        // Non-critical endpoints should never reject (validateStatus handles them)
        const isNonCritical = endpoint.includes('course-materials') ||
                             endpoint.includes('badges') ||
                             endpoint.includes('points') ||
                             endpoint.includes('leaderboard');

        if (isNonCritical) {
            // Should not reach here due to validateStatus, but just in case
            return Promise.resolve({ data: { data: [] } });
        }

        // Handle 401 Unauthorized (Token expired or invalid)
        if (status === 401 && !originalRequest._retry) {
            console.warn('Unauthorized request detected. Logging out user...');
            useAuthStore.getState().logout();

            // Only redirect if not already on login page to avoid infinite loops
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?expired=true';
            }
        }

        // Standardize error message extraction
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
        error.formattedMessage = errorMessage;

        return Promise.reject(error);
    }
);

export default apiClient;
