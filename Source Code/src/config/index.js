/**
 * Centralized Application Configuration Layer - Frontend
 * Immutable, versioned, and validated configuration
 */

import { validateConfiguration } from './validation';

// API Versioning
const API_VERSION = '/api/v1';

// Base URLs (Immutable)
const BASE_URLS = Object.freeze({
  API: process.env.REACT_APP_API_URL || 'http://localhost:5002/api',
  WEBSOCKET: process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:5002',
  CODE_EXECUTOR: process.env.REACT_APP_CODE_EXECUTOR_URL || 'http://localhost:5001',
});

// API Routes (Versioned)
const API_ROUTES = Object.freeze({
  // Authentication
  AUTH: Object.freeze({
    LOGIN: `${BASE_URLS.API}/auth/login`,
    REGISTER: `${BASE_URLS.API}/auth/register`,
    LOGOUT: `${BASE_URLS.API}/auth/logout`,
    REFRESH: `${BASE_URLS.API}/auth/refresh`,
    VERIFY_EMAIL: `${BASE_URLS.API}/auth/verify-email`,
    FORGOT_PASSWORD: `${BASE_URLS.API}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URLS.API}/auth/reset-password`,
  }),
  
  // Users
  USERS: Object.freeze({
    BASE: `${BASE_URLS.API}/users`,
    PROFILE: `${BASE_URLS.API}/users/profile`,
    BY_ROLE: (role) => `${BASE_URLS.API}/users?role=${role}`,
    BY_ID: (id) => `${BASE_URLS.API}/users/${id}`,
    UPDATE: (id) => `${BASE_URLS.API}/users/${id}`,
    DELETE: (id) => `${BASE_URLS.API}/users/${id}`,
  }),
  
  // Courses
  COURSES: Object.freeze({
    BASE: `${BASE_URLS.API}/courses`,
    BY_ID: (id) => `${BASE_URLS.API}/courses/${id}`,
    BY_DEPARTMENT: (deptId) => `${BASE_URLS.API}/courses/department/${deptId}`,
    CREATE: `${BASE_URLS.API}/courses`,
    UPDATE: (id) => `${BASE_URLS.API}/courses/${id}`,
    DELETE: (id) => `${BASE_URLS.API}/courses/${id}`,
  }),
  
  // AI Services
  AI: Object.freeze({
    EXPLAIN: `${BASE_URLS.API}/ai/explain`,
    TUTOR: `${BASE_URLS.API}/ai/tutor`,
    GENERATE_PROBLEM: `${BASE_URLS.API}/ai/generate-problem`,
    CODE_REVIEW: `${BASE_URLS.API}/ai/code-review`,
    CHAT: `${BASE_URLS.API}/ai/chat`,
    TRANSLATE: `${BASE_URLS.API}/ai/translate`,
  }),
  
  // Code Execution
  CODE_EXECUTION: Object.freeze({
    EXECUTE: `${BASE_URLS.CODE_EXECUTOR}/execute`,
    LANGUAGES: `${BASE_URLS.CODE_EXECUTOR}/languages`,
    STATUS: (id) => `${BASE_URLS.CODE_EXECUTOR}/status/${id}`,
    OUTPUT: (id) => `${BASE_URLS.CODE_EXECUTOR}/output/${id}`,
  }),
  
  // System
  SYSTEM: Object.freeze({
    HEALTH: `${BASE_URLS.API}/system/health`,
    STATS: `${BASE_URLS.API}/system/stats`,
    INFO: `${BASE_URLS.API}/system/info`,
  }),
  
  // Notifications
  NOTIFICATIONS: Object.freeze({
    BASE: `${BASE_URLS.API}/notifications`,
    BY_USER: (userId) => `${BASE_URLS.API}/notifications/${userId}`,
    MARK_READ: (id) => `${BASE_URLS.API}/notifications/${id}/read`,
    MARK_ALL_READ: `${BASE_URLS.API}/notifications/read-all`,
  }),
});

// External Services (Environment-dependent)
const EXTERNAL_SERVICES = Object.freeze({
  // AI Services
  AI_SERVICES: Object.freeze({
    OLLAMA: Object.freeze({
      URL: process.env.REACT_APP_OLLAMA_URL || 'http://localhost:11434',
      DEFAULT_MODEL: process.env.REACT_APP_OLLAMA_MODEL || 'llama3.2',
    }),
  }),
  
  // WebSocket
  WEBSOCKET: Object.freeze({
    URL: BASE_URLS.WEBSOCKET,
    PATH: '/socket.io',
  }),
});

// WebSocket Events (Versioned)
const WEBSOCKET_EVENTS = Object.freeze({
  // Real-time updates
  NOTIFICATION: 'v1:notification',
  USER_UPDATE: 'v1:user_update',
  COURSE_UPDATE: 'v1:course_update',
  ASSIGNMENT_UPDATE: 'v1:assignment_update',
  
  // Code execution
  CODE_EXECUTION_START: 'v1:code_execution_start',
  CODE_EXECUTION_OUTPUT: 'v1:code_execution_output',
  CODE_EXECUTION_COMPLETE: 'v1:code_execution_complete',
  
  // Collaboration
  COLLABORATION_JOIN: 'v1:collaboration_join',
  COLLABORATION_LEAVE: 'v1:collaboration_leave',
  COLLABORATION_UPDATE: 'v1:collaboration_update',
});

// Application Configuration
const APP = Object.freeze({
  NAME: process.env.REACT_APP_PLATFORM_NAME || 'AI University Platform',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.REACT_APP_ENV || 'development',
  API_VERSION: API_VERSION,
  
  // Feature flags
  FEATURES: Object.freeze({
    AI_TUTORING: process.env.REACT_APP_FEATURE_AI_TUTORING !== 'false',
    CODE_EXECUTION: process.env.REACT_APP_FEATURE_CODE_EXECUTION !== 'false',
    REAL_TIME_COLLABORATION: process.env.REACT_APP_FEATURE_REAL_TIME_COLLABORATION !== 'false',
    NOTIFICATIONS: process.env.REACT_APP_FEATURE_NOTIFICATIONS !== 'false',
    DARK_MODE: process.env.REACT_APP_FEATURE_DARK_MODE !== 'false',
  }),
  
  // Multi-tenant support (prepared for Phase 3)
  MULTI_TENANT: Object.freeze({
    ENABLED: process.env.REACT_APP_MULTI_TENANT === 'true',
    BASE_DOMAIN: process.env.REACT_APP_BASE_DOMAIN || 'aiuniversity.com',
    getTenantBaseUrl: (tenantId) => {
      if (!APP.MULTI_TENANT.ENABLED) return BASE_URLS.API;
      return `https://${tenantId}.${APP.MULTI_TENANT.BASE_DOMAIN}${API_VERSION}`;
    },
  }),
});

// Deep freeze function for nested objects
const deepFreeze = (obj) => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Object.isFrozen(obj[key])) {
      deepFreeze(obj[key]);
    }
  });
  return Object.freeze(obj);
};

// Configuration object
const CONFIG = deepFreeze({
  BASE_URLS,
  API_ROUTES,
  EXTERNAL_SERVICES,
  WEBSOCKET_EVENTS,
  APP,
});

// Validate configuration
validateConfiguration();

// Export configuration
export default CONFIG;

// Named exports for convenience
export {
  BASE_URLS,
  API_ROUTES,
  EXTERNAL_SERVICES,
  WEBSOCKET_EVENTS,
  APP,
  API_VERSION,
};

// Backward compatibility exports
export const API_BASE_URL = BASE_URLS.API;
