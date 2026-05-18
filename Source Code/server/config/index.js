/**
 * Centralized Application Configuration Layer - Backend
 * Immutable, versioned, and validated configuration
 */

const { validateConfiguration } = require('./validation');

// API Versioning
const API_VERSION = '/api/v1';

// Base URLs (Immutable)
const BASE_URLS = Object.freeze({
  API: `http://localhost:${process.env.PORT || 5002}${API_VERSION}`,
  WEBSOCKET: process.env.WEBSOCKET_URL || `ws://localhost:${process.env.PORT || 5002}`,
  CODE_EXECUTOR: process.env.CODE_EXECUTOR_URL || 'http://localhost:5001',
});

// Server Configuration
const SERVER = Object.freeze({
  PORT: parseInt(process.env.PORT) || 5002,
  HOST: process.env.HOST || '0.0.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_VERSION,

  // Get full server URL
  getServerUrl: () => {
    const protocol = SERVER.NODE_ENV === 'production' ? 'https' : 'http';
    const host = SERVER.HOST === '0.0.0.0' ? 'localhost' : SERVER.HOST;
    return `${protocol}://${host}:${SERVER.PORT}`;
  },

  // Get API base URL
  getApiUrl: () => {
    return `${SERVER.getServerUrl()}${API_VERSION}`;
  },
});

// Database Configuration
const DATABASE = Object.freeze({
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_TEST_URI: process.env.MONGODB_TEST_URI,

  // Redis Configuration
  REDIS: Object.freeze({
    URL: process.env.REDIS_URL || 'redis://localhost:6379',
    PASSWORD: process.env.REDIS_PASSWORD || '',
    DB: parseInt(process.env.REDIS_DB) || 0,
  }),
});

// External Services Configuration
const EXTERNAL_SERVICES = Object.freeze({
  // Code Executor Service
  CODE_EXECUTOR: Object.freeze({
    URL: process.env.CODE_EXECUTOR_URL,
    TIMEOUT: parseInt(process.env.CODE_EXECUTION_TIMEOUT) || 10000,
    MAX_MEMORY: process.env.CODE_EXECUTION_MAX_MEMORY || '128m',
    MAX_CPU: process.env.CODE_EXECUTION_MAX_CPU || '0.5',
  }),

  // AI Services
  AI_SERVICES: Object.freeze({
    GROQ: Object.freeze({
      URL: process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1',
      API_KEY: process.env.GROQ_API_KEY || '',
      DEFAULT_MODEL: process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile',
      TIMEOUT: parseInt(process.env.GROQ_TIMEOUT) || 30000,
    }),

    OLLAMA: Object.freeze({
      URL: process.env.OLLAMA_URL || 'http://localhost:11434',
      DEFAULT_MODEL: process.env.OLLAMA_DEFAULT_MODEL || 'llama3.2',
      TIMEOUT: parseInt(process.env.OLLAMA_TIMEOUT) || 30000,
    }),

    OPENAI: Object.freeze({
      URL: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
      API_KEY: process.env.OPENAI_API_KEY || '',
      DEFAULT_MODEL: process.env.OPENAI_DEFAULT_MODEL || 'gpt-3.5-turbo',
      TIMEOUT: parseInt(process.env.OPENAI_TIMEOUT) || 30000,
    }),
  }),

  // Email Service
  EMAIL: Object.freeze({
    HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.SMTP_PORT) || 587,
    SECURE: process.env.SMTP_SECURE === 'true',
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM: process.env.EMAIL_FROM || 'noreply@aiuniversity.edu',
    FROM_NAME: process.env.EMAIL_FROM_NAME || 'AI University Platform',
  }),

  // File Storage
  STORAGE: Object.freeze({
    // Local storage
    UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
    MAX_FILE_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE) || 52428800, // 50MB
    ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',

    // AWS S3 (optional)
    AWS: Object.freeze({
      ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || '',
      SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || '',
      REGION: process.env.AWS_REGION || 'us-east-1',
      S3_BUCKET: process.env.AWS_S3_BUCKET || 'ai-university-files',
    }),
  }),

  // WebSocket Configuration
  WEBSOCKET: Object.freeze({
    PORT: parseInt(process.env.WEBSOCKET_PORT) || SERVER.PORT,
    PATH: process.env.WEBSOCKET_PATH || '/socket.io',
  }),

  // Monitoring & Analytics
  MONITORING: Object.freeze({
    ERROR_TRACKING_DSN: process.env.ERROR_TRACKING_DSN || '',
    ANALYTICS_ENABLED: process.env.ANALYTICS_ENABLED !== 'false',
    PERFORMANCE_SAMPLE_RATE: parseFloat(process.env.PERFORMANCE_SAMPLE_RATE) || 0.1,
  }),
});

// Security Configuration
const SECURITY = Object.freeze({
  JWT: Object.freeze({
    SECRET: process.env.JWT_SECRET,
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    EXPIRE: process.env.JWT_EXPIRE || '24h',
    REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  }),

  // Rate Limiting
  RATE_LIMITING: Object.freeze({
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.RATE_LIMIT_MAX_LOGIN_ATTEMPTS) || 5,
  }),

  // CORS
  CORS: Object.freeze({
    ORIGIN: process.env.CORS_ORIGIN,
    CREDENTIALS: process.env.CORS_CREDENTIALS === 'true',
  }),

  // Password Security
  PASSWORD: Object.freeze({
    MIN_LENGTH: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
    BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  }),

  // Session
  SESSION: Object.freeze({
    SECRET: process.env.SESSION_SECRET || 'your-session-secret-key',
    MAX_AGE: parseInt(process.env.SESSION_MAX_AGE) || 86400000, // 24 hours
  }),
});

// Application Configuration
const APP = Object.freeze({
  NAME: process.env.APP_NAME || 'AI University Platform',
  VERSION: process.env.APP_VERSION || '1.0.0',
  DESCRIPTION: process.env.APP_DESCRIPTION || 'AI-Powered University Learning Platform',
  SUPPORT_EMAIL: process.env.APP_SUPPORT_EMAIL || 'support@aiuniversity.com',

  // University Configuration
  UNIVERSITY: Object.freeze({
    NAME: process.env.UNIVERSITY_NAME || 'AI University',
    CODE: process.env.UNIVERSITY_CODE || 'AIU',
    TIMEZONE: process.env.UNIVERSITY_TIMEZONE || 'UTC',
    LOCALE: process.env.UNIVERSITY_LOCALE || 'en-US',
  }),

  // Academic Configuration
  ACADEMIC: Object.freeze({
    YEAR_START: process.env.ACADEMIC_YEAR_START || '08-01',
    YEAR_END: process.env.ACADEMIC_YEAR_END || '07-31',
    SEMESTER_COUNT: parseInt(process.env.SEMESTER_COUNT) || 2,
    MAX_CREDITS_PER_SEMESTER: parseInt(process.env.MAX_CREDITS_PER_SEMESTER) || 24,
  }),

  // Grading Configuration
  GRADING: Object.freeze({
    SCALE: process.env.GRADING_SCALE || 'A,B,C,D,F',
    POINT_SCALE: parseFloat(process.env.GRADE_POINT_SCALE) || 4.0,
    PASSING_GRADE: process.env.PASSING_GRADE || 'C',
    MIN_PASSING_PERCENTAGE: parseInt(process.env.MIN_PASSING_PERCENTAGE) || 60,
  }),

  // Feature Flags
  FEATURES: Object.freeze({
    AI_TUTORING: process.env.FEATURE_AI_TUTORING !== 'false',
    CODE_EXECUTION: process.env.FEATURE_CODE_EXECUTION !== 'false',
    REAL_TIME_COLLABORATION: process.env.FEATURE_REAL_TIME_COLLABORATION !== 'false',
    ADVANCED_ANALYTICS: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
    MOBILE_APP: process.env.FEATURE_MOBILE_APP === 'true',
    API_RATE_LIMITING: process.env.FEATURE_API_RATE_LIMITING !== 'false',
    TWO_FACTOR_AUTH: process.env.FEATURE_TWO_FACTOR_AUTH === 'true',
    FILE_SHARING: process.env.FEATURE_FILE_SHARING !== 'false',
    NOTIFICATIONS: process.env.FEATURE_NOTIFICATIONS !== 'false',
    DARK_MODE: process.env.FEATURE_DARK_MODE !== 'false',
    MULTILINGUAL: process.env.FEATURE_MULTILINGUAL === 'true',
  }),

  // Multi-tenant support (prepared for Phase 3)
  MULTI_TENANT: Object.freeze({
    ENABLED: process.env.MULTI_TENANT_ENABLED === 'true',
    ISOLATION: process.env.TENANT_ISOLATION || 'database',
    DEFAULT_TENANT: process.env.DEFAULT_TENANT || 'default',
    BASE_DOMAIN: process.env.BASE_DOMAIN || 'aiuniversity.com',

    getTenantDatabase: (tenantId) => {
      if (!APP.MULTI_TENANT.ENABLED) return DATABASE.MONGODB_URI;
      return `${DATABASE.MONGODB_URI}_${tenantId}`;
    },
  }),
});

// Development Configuration
const DEVELOPMENT = Object.freeze({
  // Debug
  DEBUG: process.env.DEBUG || 'app:*',
  DEBUG_COLORS: process.env.DEBUG_COLORS !== 'false',

  // Hot Reload
  HOT_RELOAD: process.env.HOT_RELOAD === 'true',

  //  Services
  _AI_SERVICES: process.env._AI_SERVICES === 'true',
  _EMAIL_SERVICES: process.env._EMAIL_SERVICES === 'true',
  _FILE_SERVICES: process.env._FILE_SERVICES === 'true',

  // Testing
  TESTING: Object.freeze({
    DATABASE_NAME: process.env.TEST_DATABASE_NAME || 'ai_university_platform_test',
    TIMEOUT: parseInt(process.env.TEST_TIMEOUT) || 10000,
    PARALLEL: process.env.TEST_PARALLEL !== 'false',
    COVERAGE: process.env.TEST_COVERAGE !== 'false',
  }),
});

// Production Configuration
const PRODUCTION = Object.freeze({
  // Optimization
  COMPRESSION: process.env.PRODUCTION_COMPRESSION !== 'false',
  MINIFICATION: process.env.PRODUCTION_MINIFICATION !== 'false',
  CDN_ENABLED: process.env.PRODUCTION_CDN_ENABLED === 'true',

  // SSL
  SSL: Object.freeze({
    CERT_PATH: process.env.SSL_CERT_PATH || '',
    KEY_PATH: process.env.SSL_KEY_PATH || '',
    CA_PATH: process.env.SSL_CA_PATH || '',
  }),

  // Backup
  BACKUP: Object.freeze({
    ENABLED: process.env.BACKUP_ENABLED !== 'false',
    SCHEDULE: process.env.BACKUP_SCHEDULE || '0 2 * * *',
    RETENTION_DAYS: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
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
  SERVER,
  DATABASE,
  EXTERNAL_SERVICES,
  SECURITY,
  APP,
  DEVELOPMENT,
  PRODUCTION,
});

// Export configuration
module.exports = CONFIG;

// Named exports for convenience
module.exports.BASE_URLS = BASE_URLS;
module.exports.SERVER = SERVER;
module.exports.DATABASE = DATABASE;
module.exports.EXTERNAL_SERVICES = EXTERNAL_SERVICES;
module.exports.SECURITY = SECURITY;
module.exports.APP = APP;
module.exports.DEVELOPMENT = DEVELOPMENT;
module.exports.PRODUCTION = PRODUCTION;
module.exports.API_VERSION = API_VERSION;
