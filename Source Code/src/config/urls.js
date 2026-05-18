/**
 * Centralized URL Configuration Service
 * All components should use these URLs instead of hardcoded values
 */

// Base API Configuration
const getApiBaseUrl = () => {
  // Always use localhost:5002 for development
  return 'http://localhost:5002/api';
};

const API_BASE_URL = getApiBaseUrl();

// Service URLs
const SERVICES = {
  // Backend API
  API: API_BASE_URL,

  // Code Executor Service
  CODE_EXECUTOR: process.env.CODE_EXECUTOR_URL || 'http://localhost:5001',

  // AI Services
  AI_SERVICE: process.env.AI_SERVICE_URL || API_BASE_URL,
  OLLAMA: process.env.OLLAMA_URL || 'http://localhost:11434',

  // WebSocket Services
  WEBSOCKET: process.env.WEBSOCKET_URL || 'ws://localhost:5002',

  // External Services
  GROQ_API: process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1',
};

// API Endpoints
const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
  },

  // Users
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    PROFILE: `${API_BASE_URL}/users/profile`,
    BY_ROLE: (role) => `${API_BASE_URL}/users?role=${role}`,
    BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
    UPDATE: (id) => `${API_BASE_URL}/users/${id}`,
    DELETE: (id) => `${API_BASE_URL}/users/${id}`,
  },

  // Courses
  COURSES: {
    BASE: `${API_BASE_URL}/courses`,
    BY_ID: (id) => `${API_BASE_URL}/courses/${id}`,
    BY_DEPARTMENT: (deptId) => `${API_BASE_URL}/courses/department/${deptId}`,
    CREATE: `${API_BASE_URL}/courses`,
    UPDATE: (id) => `${API_BASE_URL}/courses/${id}`,
    DELETE: (id) => `${API_BASE_URL}/courses/${id}`,
  },

  // Departments
  DEPARTMENTS: {
    BASE: `${API_BASE_URL}/departments`,
    BY_ID: (id) => `${API_BASE_URL}/departments/${id}`,
    CREATE: `${API_BASE_URL}/departments`,
    UPDATE: (id) => `${API_BASE_URL}/departments/${id}`,
    DELETE: (id) => `${API_BASE_URL}/departments/${id}`,
  },

  // Problems & Assignments
  PROBLEMS: {
    BASE: `${API_BASE_URL}/problems`,
    BY_ID: (id) => `${API_BASE_URL}/problems/${id}`,
    BY_DIFFICULTY: (level) => `${API_BASE_URL}/problems?difficulty=${level}`,
    BY_TOPIC: (topic) => `${API_BASE_URL}/problems?topic=${topic}`,
    CREATE: `${API_BASE_URL}/problems`,
    SUBMIT: `${API_BASE_URL}/problems/submit`,
  },

  // Assignments
  ASSIGNMENTS: {
    BASE: `${API_BASE_URL}/assignments`,
    BY_ID: (id) => `${API_BASE_URL}/assignments/${id}`,
    BY_COURSE: (courseId) => `${API_BASE_URL}/assignments/course/${courseId}`,
    CREATE: `${API_BASE_URL}/assignments`,
    SUBMIT: (id) => `${API_BASE_URL}/assignments/${id}/submit`,
    GRADE: (id) => `${API_BASE_URL}/assignments/${id}/grade`,
  },

  // AI Services
  AI: {
    EXPLAIN: `${API_BASE_URL}/ai/explain`,
    TUTOR: `${API_BASE_URL}/ai/tutor`,
    GENERATE_PROBLEM: `${API_BASE_URL}/ai/generate-problem`,
    CODE_REVIEW: `${API_BASE_URL}/ai/code-review`,
    CHAT: `${API_BASE_URL}/ai/chat`,
    TRANSLATE: `${API_BASE_URL}/ai/translate`,
  },

  // Code Execution
  CODE_EXECUTION: {
    EXECUTE: `${SERVICES.CODE_EXECUTOR}/execute`,
    LANGUAGES: `${SERVICES.CODE_EXECUTOR}/languages`,
    STATUS: (id) => `${SERVICES.CODE_EXECUTOR}/status/${id}`,
    OUTPUT: (id) => `${SERVICES.CODE_EXECUTOR}/output/${id}`,
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: `${API_BASE_URL}/notifications`,
    BY_USER: (userId) => `${API_BASE_URL}/notifications/${userId}`,
    MARK_READ: (id) => `${API_BASE_URL}/notifications/${id}/read`,
    MARK_ALL_READ: `${API_BASE_URL}/notifications/read-all`,
  },

  // System & Admin
  SYSTEM: {
    HEALTH: `${API_BASE_URL}/system/health`,
    STATS: `${API_BASE_URL}/system/stats`,
    INFO: `${API_BASE_URL}/system/info`,
  },

  // Audit Logs
  AUDIT_LOGS: {
    BASE: `${API_BASE_URL}/admin/audit-logs`,
    PUBLIC: `${API_BASE_URL}/admin/audit-logs/public`,
    BY_USER: (userId) => `${API_BASE_URL}/admin/audit-logs/user/${userId}`,
  },

  // Reports
  REPORTS: {
    BASE: `${API_BASE_URL}/reports`,
    BY_USER: (userId) => `${API_BASE_URL}/reports/user/${userId}`,
    CREATE: `${API_BASE_URL}/reports`,
    BY_TYPE: (type) => `${API_BASE_URL}/reports?type=${type}`,
  },

  // Sections & Enrollment
  SECTIONS: {
    BASE: `${API_BASE_URL}/sections`,
    AUTO_ASSIGN: (semesterId) => `${API_BASE_URL}/sections/semester/${semesterId}/auto-assign`,
    BY_SEMESTER: (semesterId) => `${API_BASE_URL}/sections/semester/${semesterId}`,
    BY_ID: (id) => `${API_BASE_URL}/sections/${id}`,
  },

  // University & Institutional
  UNIVERSITY: {
    BASE: `${API_BASE_URL}/university`,
    SUMMARY: `${API_BASE_URL}/institutional/university/summary`,
    SETTINGS: `${API_BASE_URL}/university/settings`,
  },
  INSTITUTIONAL: {
    DEPARTMENT_OVERVIEW: (deptId) => `${API_BASE_URL}/institutional/department/${deptId}/overview`,
    DEPARTMENT_COURSES: (deptId) => `${API_BASE_URL}/institutional/department/${deptId}/courses`,
    COG_LOAD: (deptId) => `${API_BASE_URL}/institutional/cog-load/${deptId}`,
    EFFICIENCY: (deptId) => `${API_BASE_URL}/institutional/efficiency/${deptId}`,
    ACCREDITATION: (deptId) => `${API_BASE_URL}/institutional/accreditation/department/${deptId}`,
    FACULTY_PERFORMANCE: (deptId) => `${API_BASE_URL}/institutional/department/${deptId}/faculty-performance`,
    WORKLOAD_DISTRIBUTION: (deptId) => `${API_BASE_URL}/institutional/department/${deptId}/workload-distribution`,
    PROGRAM_OVERVIEW: (programId) => `${API_BASE_URL}/institutional/program/${programId}/overview`,
    UNIVERSITY_RISK_MAP: `${API_BASE_URL}/institutional/university/risk-map`,
  },

  // Super Admin
  SUPERADMIN: {
    SETTINGS: `${API_BASE_URL}/superadmin/settings`,
    DB_STATS: `${API_BASE_URL}/superadmin/db-stats`,
    SECURITY_WAF: `${API_BASE_URL}/superadmin/security/waf`,
  },

  // Performance & Monitoring
  PERFORMANCE: {
    STATS: `${API_BASE_URL}/performance/stats`,
    METRICS: `${API_BASE_URL}/performance/metrics`,
  },

  // Data Visualization
  DATA_VIZ: {
    ENROLLMENT_TRENDS: `${API_BASE_URL}/data-visualization/enrollment_trends`,
    GRADE_DISTRIBUTION: `${API_BASE_URL}/data-visualization/grade_distribution`,
    PERFORMANCE_CHARTS: `${API_BASE_URL}/data-visualization/performance_charts`,
  },

  // Real-time Dashboard
  REALTIME: {
    METRICS: `${API_BASE_URL}/realtime-dashboard/metrics`,
    UPDATES: `${API_BASE_URL}/realtime-dashboard/updates`,
  },

  // Moderation
  MODERATION: {
    FLAGS: `${API_BASE_URL}/moderation/flags`,
    REPORTED_CONTENT: `${API_BASE_URL}/moderation/reported-content`,
    REVIEW_QUEUE: `${API_BASE_URL}/moderation/review-queue`,
  },

  // Integrations
  INTEGRATIONS: {
    BASE: `${API_BASE_URL}/integrations`,
    AVAILABLE: `${API_BASE_URL}/integrations/available`,
    CONFIGURE: (id) => `${API_BASE_URL}/integrations/${id}/configure`,
  },

  // API Keys
  API_KEYS: {
    BASE: `${API_BASE_URL}/api-keys`,
    BY_USER: (userId) => `${API_BASE_URL}/api-keys/user/${userId}`,
    CREATE: `${API_BASE_URL}/api-keys`,
    REVOKE: (id) => `${API_BASE_URL}/api-keys/${id}/revoke`,
  },

  // Preferences
  PREFERENCES: {
    BASE: `${API_BASE_URL}/preferences`,
    BY_USER: (userId) => `${API_BASE_URL}/preferences/user/${userId}`,
    UPDATE: (userId) => `${API_BASE_URL}/preferences/user/${userId}`,
  },

  // Calendar
  CALENDAR: {
    BASE: `${API_BASE_URL}/calendar`,
    EVENTS: `${API_BASE_URL}/calendar/events`,
    BY_DATE: (date) => `${API_BASE_URL}/calendar?date=${date}`,
    CREATE: `${API_BASE_URL}/calendar/events`,
  },

  // Announcements
  ANNOUNCEMENTS: {
    BASE: `${API_BASE_URL}/announcements`,
    BY_ID: (id) => `${API_BASE_URL}/announcements/${id}`,
    CREATE: `${API_BASE_URL}/announcements`,
    UPDATE: (id) => `${API_BASE_URL}/announcements/${id}`,
    DELETE: (id) => `${API_BASE_URL}/announcements/${id}`,
  },

  // Scheduled Reports
  SCHEDULED_REPORTS: {
    BASE: `${API_BASE_URL}/scheduled-reports`,
    BY_ID: (id) => `${API_BASE_URL}/scheduled-reports/${id}`,
    CREATE: `${API_BASE_URL}/scheduled-reports`,
    UPDATE: (id) => `${API_BASE_URL}/scheduled-reports/${id}`,
    DELETE: (id) => `${API_BASE_URL}/scheduled-reports/${id}`,
  },
};

// WebSocket Events
const WEBSOCKET_EVENTS = {
  // Real-time updates
  NOTIFICATION: 'notification',
  USER_UPDATE: 'user_update',
  COURSE_UPDATE: 'course_update',
  ASSIGNMENT_UPDATE: 'assignment_update',

  // Code execution
  CODE_EXECUTION_START: 'code_execution_start',
  CODE_EXECUTION_OUTPUT: 'code_execution_output',
  CODE_EXECUTION_COMPLETE: 'code_execution_complete',

  // Collaboration
  COLLABORATION_JOIN: 'collaboration_join',
  COLLABORATION_LEAVE: 'collaboration_leave',
  COLLABORATION_UPDATE: 'collaboration_update',

  // System
  SYSTEM_STATUS: 'system_status',
  PERFORMANCE_UPDATE: 'performance_update',
};

// Export everything
export {
  SERVICES,
  ENDPOINTS,
  WEBSOCKET_EVENTS,
  API_BASE_URL,
};

// Default export for backward compatibility
export default {
  SERVICES,
  ENDPOINTS,
  WEBSOCKET_EVENTS,
  API_BASE_URL,
};
