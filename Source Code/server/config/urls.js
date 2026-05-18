/**
 * Centralized URL Configuration Service - Backend
 * All backend services should use these URLs instead of hardcoded values
 */

// Environment-based configuration
const getEnvVar = (name, defaultValue) => {
  return process.env[name] || defaultValue;
};

// Server Configuration
const SERVER = {
  PORT: getEnvVar('PORT', 5002),
  HOST: getEnvVar('HOST', '0.0.0.0'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),

  // Get full server URL
  getServerUrl: () => {
    const protocol = SERVER.NODE_ENV === 'production' ? 'https' : 'http';
    const host = SERVER.HOST === '0.0.0.0' ? 'localhost' : SERVER.HOST;
    return `${protocol}://${host}:${SERVER.PORT}`;
  },

  // Get API base URL
  getApiUrl: () => {
    return `${SERVER.getServerUrl()}/api`;
  },
};

// Database Configuration
const DATABASE = {
  MONGODB_URI: getEnvVar('MONGODB_URI', 'mongodb+srv://navuaggarwal:navyaa274@cluster0.7noqj.mongodb.net/project?retryWrites=true&w=majority'),
  MONGODB_TEST_URI: getEnvVar('MONGODB_TEST_URI', 'mongodb+srv://navuaggarwal:navyaa274@cluster0.7noqj.mongodb.net/project?retryWrites=true&w=majority'),

  // Redis Configuration
  REDIS_URL: getEnvVar('REDIS_URL', 'redis://localhost:6379'),
  REDIS_PASSWORD: getEnvVar('REDIS_PASSWORD', ''),
  REDIS_DB: getEnvVar('REDIS_DB', '0'),
};

// External Services Configuration
const EXTERNAL_SERVICES = {
  // Code Executor Service
  CODE_EXECUTOR: {
    URL: getEnvVar('CODE_EXECUTOR_URL', 'http://localhost:5001'),
    TIMEOUT: getEnvVar('CODE_EXECUTION_TIMEOUT', '10000'),
    MAX_MEMORY: getEnvVar('CODE_EXECUTION_MAX_MEMORY', '128m'),
    MAX_CPU: getEnvVar('CODE_EXECUTION_MAX_CPU', '0.5'),
  },

  // AI Services
  AI_SERVICES: {
    GROQ: {
      URL: getEnvVar('GROQ_API_URL', 'https://api.groq.com/openai/v1'),
      API_KEY: getEnvVar('GROQ_API_KEY', ''),
      DEFAULT_MODEL: getEnvVar('GROQ_DEFAULT_MODEL', 'llama-3.3-70b-versatile'),
      TIMEOUT: getEnvVar('GROQ_TIMEOUT', '30000'),
    },

    OLLAMA: {
      URL: getEnvVar('OLLAMA_URL', 'http://localhost:11434'),
      DEFAULT_MODEL: getEnvVar('OLLAMA_DEFAULT_MODEL', 'llama3.2'),
      TIMEOUT: getEnvVar('OLLAMA_TIMEOUT', '30000'),
    },

    OPENAI: {
      URL: getEnvVar('OPENAI_API_URL', 'https://api.openai.com/v1'),
      API_KEY: getEnvVar('OPENAI_API_KEY', ''),
      DEFAULT_MODEL: getEnvVar('OPENAI_DEFAULT_MODEL', 'gpt-3.5-turbo'),
      TIMEOUT: getEnvVar('OPENAI_TIMEOUT', '30000'),
    },
  },

  // Email Service
  EMAIL: {
    HOST: getEnvVar('SMTP_HOST', 'smtp.gmail.com'),
    PORT: getEnvVar('SMTP_PORT', '587'),
    SECURE: getEnvVar('SMTP_SECURE', 'false'),
    USER: getEnvVar('SMTP_USER', ''),
    PASS: getEnvVar('SMTP_PASS', ''),
    FROM: getEnvVar('EMAIL_FROM', 'noreply@aiuniversity.edu'),
    FROM_NAME: getEnvVar('EMAIL_FROM_NAME', 'AI University Platform'),
  },

  // File Storage
  STORAGE: {
    // Local storage
    UPLOAD_PATH: getEnvVar('UPLOAD_PATH', './uploads'),
    MAX_FILE_SIZE: getEnvVar('UPLOAD_MAX_SIZE', '52428800'), // 50MB
    ALLOWED_TYPES: getEnvVar('UPLOAD_ALLOWED_TYPES', 'image/jpeg,image/png,image/gif,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'),

    // AWS S3 (optional)
    AWS: {
      ACCESS_KEY_ID: getEnvVar('AWS_ACCESS_KEY_ID', ''),
      SECRET_ACCESS_KEY: getEnvVar('AWS_SECRET_ACCESS_KEY', ''),
      REGION: getEnvVar('AWS_REGION', 'us-east-1'),
      S3_BUCKET: getEnvVar('AWS_S3_BUCKET', 'ai-university-files'),
    },
  },

  // WebSocket Configuration
  WEBSOCKET: {
    PORT: getEnvVar('WEBSOCKET_PORT', '5002'),
    PATH: getEnvVar('WEBSOCKET_PATH', '/socket.io'),
  },

  // Monitoring & Analytics
  MONITORING: {
    ERROR_TRACKING_DSN: getEnvVar('ERROR_TRACKING_DSN', ''),
    ANALYTICS_ENABLED: getEnvVar('ANALYTICS_ENABLED', 'true'),
    PERFORMANCE_SAMPLE_RATE: getEnvVar('PERFORMANCE_SAMPLE_RATE', '0.1'),
  },
};

// Security Configuration
const SECURITY = {
  JWT: {
    SECRET: getEnvVar('JWT_SECRET', 'your-super-secure-jwt-secret-key'),
    REFRESH_SECRET: getEnvVar('JWT_REFRESH_SECRET', 'your-super-secure-refresh-secret-key'),
    EXPIRE: getEnvVar('JWT_EXPIRE', '24h'),
    REFRESH_EXPIRE: getEnvVar('JWT_REFRESH_EXPIRE', '7d'),
  },

  // Rate Limiting
  RATE_LIMITING: {
    WINDOW_MS: getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), // 15 minutes
    MAX_REQUESTS: getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'),
    MAX_LOGIN_ATTEMPTS: getEnvVar('RATE_LIMIT_MAX_LOGIN_ATTEMPTS', '5'),
  },

  // CORS
  CORS: {
    ORIGIN: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
    CREDENTIALS: getEnvVar('CORS_CREDENTIALS', 'true'),
  },

  // Password Security
  PASSWORD: {
    MIN_LENGTH: getEnvVar('PASSWORD_MIN_LENGTH', '8'),
    BCRYPT_ROUNDS: getEnvVar('BCRYPT_ROUNDS', '12'),
  },

  // Session
  SESSION: {
    SECRET: getEnvVar('SESSION_SECRET', 'your-session-secret-key'),
    MAX_AGE: getEnvVar('SESSION_MAX_AGE', '86400000'), // 24 hours
  },
};

// Application Configuration
const APP = {
  NAME: getEnvVar('APP_NAME', 'AI University Platform'),
  VERSION: getEnvVar('APP_VERSION', '1.0.0'),
  DESCRIPTION: getEnvVar('APP_DESCRIPTION', 'AI-Powered University Learning Platform'),
  SUPPORT_EMAIL: getEnvVar('APP_SUPPORT_EMAIL', 'support@aiuniversity.com'),

  // University Configuration
  UNIVERSITY: {
    NAME: getEnvVar('UNIVERSITY_NAME', 'AI University'),
    CODE: getEnvVar('UNIVERSITY_CODE', 'AIU'),
    TIMEZONE: getEnvVar('UNIVERSITY_TIMEZONE', 'UTC'),
    LOCALE: getEnvVar('UNIVERSITY_LOCALE', 'en-US'),
  },

  // Academic Configuration
  ACADEMIC: {
    YEAR_START: getEnvVar('ACADEMIC_YEAR_START', '08-01'),
    YEAR_END: getEnvVar('ACADEMIC_YEAR_END', '07-31'),
    SEMESTER_COUNT: getEnvVar('SEMESTER_COUNT', '2'),
    MAX_CREDITS_PER_SEMESTER: getEnvVar('MAX_CREDITS_PER_SEMESTER', '24'),
  },

  // Grading Configuration
  GRADING: {
    SCALE: getEnvVar('GRADING_SCALE', 'A,B,C,D,F'),
    POINT_SCALE: getEnvVar('GRADE_POINT_SCALE', '4.0'),
    PASSING_GRADE: getEnvVar('PASSING_GRADE', 'C'),
    MIN_PASSING_PERCENTAGE: getEnvVar('MIN_PASSING_PERCENTAGE', '60'),
  },
};

// Development Configuration
const DEVELOPMENT = {
  // Debug
  DEBUG: getEnvVar('DEBUG', 'app:*'),
  DEBUG_COLORS: getEnvVar('DEBUG_COLORS', 'true'),

  // Hot Reload
  HOT_RELOAD: getEnvVar('HOT_RELOAD', 'true'),

  //  Services
  _AI_SERVICES: getEnvVar('_AI_SERVICES', 'false'),
  _EMAIL_SERVICES: getEnvVar('_EMAIL_SERVICES', 'true'),
  _FILE_SERVICES: getEnvVar('_FILE_SERVICES', 'false'),

  // Testing
  TEST_DATABASE_NAME: getEnvVar('TEST_DATABASE_NAME', 'ai_university_platform_test'),
  TEST_TIMEOUT: getEnvVar('TEST_TIMEOUT', '10000'),
  TEST_PARALLEL: getEnvVar('TEST_PARALLEL', 'true'),
  TEST_COVERAGE: getEnvVar('TEST_COVERAGE', 'true'),
};

// Production Configuration
const PRODUCTION = {
  // Optimization
  COMPRESSION: getEnvVar('PRODUCTION_COMPRESSION', 'true'),
  MINIFICATION: getEnvVar('PRODUCTION_MINIFICATION', 'true'),
  CDN_ENABLED: getEnvVar('PRODUCTION_CDN_ENABLED', 'false'),

  // SSL
  SSL_CERT_PATH: getEnvVar('SSL_CERT_PATH', ''),
  SSL_KEY_PATH: getEnvVar('SSL_KEY_PATH', ''),
  SSL_CA_PATH: getEnvVar('SSL_CA_PATH', ''),

  // Backup
  BACKUP_ENABLED: getEnvVar('BACKUP_ENABLED', 'true'),
  BACKUP_SCHEDULE: getEnvVar('BACKUP_SCHEDULE', '0 2 * * *'),
  BACKUP_RETENTION_DAYS: getEnvVar('BACKUP_RETENTION_DAYS', '30'),
};

// Export all configurations
export {
  SERVER,
  DATABASE,
  EXTERNAL_SERVICES,
  SECURITY,
  APP,
  DEVELOPMENT,
  PRODUCTION,
};

// Default export
export default {
  SERVER,
  DATABASE,
  EXTERNAL_SERVICES,
  SECURITY,
  APP,
  DEVELOPMENT,
  PRODUCTION,
};
