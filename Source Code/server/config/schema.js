/**
 * Configuration Schema Definition
 * Defines the structure and validation rules for all configuration
 * Used by validation layer and CI/CD pipeline
 */

const Joi = require('joi');

// Base schemas
const urlSchema = Joi.string().uri().required();
const portSchema = Joi.number().port().required();
const emailSchema = Joi.string().email().required();
const secretSchema = Joi.string().min(32).required();

// Server configuration schema
const serverSchema = Joi.object({
  PORT: portSchema,
  HOST: Joi.string().hostname().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
  API_VERSION: Joi.string().pattern(/^\/api\/v\d+$/).required(),
});

// Database configuration schema
const databaseSchema = Joi.object({
  MONGODB_URI: Joi.string().pattern(/^mongodb(\+srv)?:\/\//).required(),
  MONGODB_TEST_URI: Joi.string().pattern(/^mongodb(\+srv)?:\/\//).optional(),
  REDIS: Joi.object({
    URL: Joi.string().pattern(/^redis:\/\//).required(),
    PASSWORD: Joi.string().optional(),
    DB: Joi.number().integer().min(0).max(15).default(0),
  }),
});

// Security configuration schema
const securitySchema = Joi.object({
  JWT: Joi.object({
    SECRET: secretSchema,
    REFRESH_SECRET: secretSchema.disallow(Joi.ref('SECRET')),
    EXPIRE: Joi.string().pattern(/^\d+[smhd]$/).default('24h'),
    REFRESH_EXPIRE: Joi.string().pattern(/^\d+[smhd]$/).default('7d'),
  }).required(),
  
  RATE_LIMITING: Joi.object({
    WINDOW_MS: Joi.number().integer().min(1000).default(900000),
    MAX_REQUESTS: Joi.number().integer().min(1).default(100),
    MAX_LOGIN_ATTEMPTS: Joi.number().integer().min(1).default(5),
  }),
  
  CORS: Joi.object({
    ORIGIN: urlSchema,
    CREDENTIALS: Joi.boolean().default(true),
  }).required(),
  
  PASSWORD: Joi.object({
    MIN_LENGTH: Joi.number().integer().min(6).max(128).default(8),
    BCRYPT_ROUNDS: Joi.number().integer().min(10).max(15).default(12),
  }),
  
  SESSION: Joi.object({
    SECRET: secretSchema,
    MAX_AGE: Joi.number().integer().min(300000).default(86400000),
  }),
});

// External services configuration schema
const externalServicesSchema = Joi.object({
  CODE_EXECUTOR: Joi.object({
    URL: urlSchema,
    TIMEOUT: Joi.number().integer().min(1000).max(60000).default(10000),
    MAX_MEMORY: Joi.string().pattern(/^\d+[KMGT]?$/).default('128m'),
    MAX_CPU: Joi.string().pattern(/^0\.\d+|1$/).default('0.5'),
  }).required(),
  
  AI_SERVICES: Joi.object({
    OLLAMA: Joi.object({
      URL: urlSchema,
      DEFAULT_MODEL: Joi.string().default('llama3.2'),
      TIMEOUT: Joi.number().integer().min(5000).max(120000).default(30000),
    }),
    
    GROQ: Joi.object({
      URL: Joi.string().uri().default('https://api.groq.com/openai/v1'),
      API_KEY: Joi.string().min(20).optional(),
      DEFAULT_MODEL: Joi.string().default('mixtral-8x7b-32768'),
      TIMEOUT: Joi.number().integer().min(5000).max(120000).default(30000),
    }),
    
    OPENAI: Joi.object({
      URL: Joi.string().uri().default('https://api.openai.com/v1'),
      API_KEY: Joi.string().min(20).optional(),
      DEFAULT_MODEL: Joi.string().default('gpt-3.5-turbo'),
      TIMEOUT: Joi.number().integer().min(5000).max(120000).default(30000),
    }),
  }),
  
  EMAIL: Joi.object({
    HOST: Joi.string().hostname().default('smtp.gmail.com'),
    PORT: portSchema.default(587),
    SECURE: Joi.boolean().default(false),
    USER: emailSchema.optional(),
    PASS: Joi.string().min(8).optional(),
    FROM: emailSchema.required(),
    FROM_NAME: Joi.string().min(2).max(100).default('AI University Platform'),
  }),
  
  STORAGE: Joi.object({
    UPLOAD_PATH: Joi.string().default('./uploads'),
    MAX_FILE_SIZE: Joi.number().integer().min(1024).max(104857600).default(52428800),
    ALLOWED_TYPES: Joi.string().default('image/jpeg,image/png,image/gif,application/pdf,text/plain'),
    
    AWS: Joi.object({
      ACCESS_KEY_ID: Joi.string().min(16).optional(),
      SECRET_ACCESS_KEY: Joi.string().min(32).optional(),
      REGION: Joi.string().default('us-east-1'),
      S3_BUCKET: Joi.string().min(3).max(63).pattern(/^[a-z0-9.-]+$/).optional(),
    }),
  }),
  
  WEBSOCKET: Joi.object({
    PORT: portSchema,
    PATH: Joi.string().pattern(/^\/.+/).default('/socket.io'),
  }),
  
  MONITORING: Joi.object({
    ERROR_TRACKING_DSN: Joi.string().uri().optional(),
    ANALYTICS_ENABLED: Joi.boolean().default(true),
    PERFORMANCE_SAMPLE_RATE: Joi.number().min(0).max(1).default(0.1),
  }),
});

// Application configuration schema
const appSchema = Joi.object({
  NAME: Joi.string().min(2).max(100).required(),
  VERSION: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required(),
  DESCRIPTION: Joi.string().min(10).max(500).required(),
  SUPPORT_EMAIL: emailSchema.required(),
  
  UNIVERSITY: Joi.object({
    NAME: Joi.string().min(2).max(100).required(),
    CODE: Joi.string().alphanum().min(2).max(10).required(),
    TIMEZONE: Joi.string().default('UTC'),
    LOCALE: Joi.string().pattern(/^[a-z]{2}-[A-Z]{2}$/).default('en-US'),
  }),
  
  ACADEMIC: Joi.object({
    YEAR_START: Joi.string().pattern(/^\d{2}-\d{2}$/).default('08-01'),
    YEAR_END: Joi.string().pattern(/^\d{2}-\d{2}$/).default('07-31'),
    SEMESTER_COUNT: Joi.number().integer().min(1).max(4).default(2),
    MAX_CREDITS_PER_SEMESTER: Joi.number().integer().min(1).max(50).default(24),
  }),
  
  GRADING: Joi.object({
    SCALE: Joi.string().pattern(/^[A-F,]+$/).default('A,B,C,D,F'),
    POINT_SCALE: Joi.number().min(1).max(5).default(4.0),
    PASSING_GRADE: Joi.string().valid('A', 'B', 'C', 'D').default('C'),
    MIN_PASSING_PERCENTAGE: Joi.number().integer().min(0).max(100).default(60),
  }),
  
  FEATURES: Joi.object({
    AI_TUTORING: Joi.boolean().default(true),
    CODE_EXECUTION: Joi.boolean().default(true),
    REAL_TIME_COLLABORATION: Joi.boolean().default(true),
    ADVANCED_ANALYTICS: Joi.boolean().default(false),
    MOBILE_APP: Joi.boolean().default(false),
    API_RATE_LIMITING: Joi.boolean().default(true),
    TWO_FACTOR_AUTH: Joi.boolean().default(false),
    FILE_SHARING: Joi.boolean().default(true),
    NOTIFICATIONS: Joi.boolean().default(true),
    DARK_MODE: Joi.boolean().default(true),
    MULTILINGUAL: Joi.boolean().default(false),
  }),
  
  MULTI_TENANT: Joi.object({
    ENABLED: Joi.boolean().default(false),
    ISOLATION: Joi.string().valid('database', 'schema', 'row_level').default('database'),
    DEFAULT_TENANT: Joi.string().alphanum().min(3).max(50).default('default'),
    BASE_DOMAIN: Joi.string().hostname().default('aiuniversity.com'),
  }),
});

// Development configuration schema
const developmentSchema = Joi.object({
  DEBUG: Joi.string().default('app:*'),
  DEBUG_COLORS: Joi.boolean().default(true),
  HOT_RELOAD: Joi.boolean().default(true),
  
  _AI_SERVICES: Joi.boolean().default(false),
  _EMAIL_SERVICES: Joi.boolean().default(true),
  _FILE_SERVICES: Joi.boolean().default(false),
  
  TESTING: Joi.object({
    DATABASE_NAME: Joi.string().alphanum().min(3).max(50).default('ai_university_platform_test'),
    TIMEOUT: Joi.number().integer().min(5000).max(300000).default(10000),
    PARALLEL: Joi.boolean().default(true),
    COVERAGE: Joi.boolean().default(true),
  }),
});

// Production configuration schema
const productionSchema = Joi.object({
  COMPRESSION: Joi.boolean().default(true),
  MINIFICATION: Joi.boolean().default(true),
  CDN_ENABLED: Joi.boolean().default(false),
  
  SSL: Joi.object({
    CERT_PATH: Joi.string().when('CDN_ENABLED', {
      is: false,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    KEY_PATH: Joi.string().when('CDN_ENABLED', {
      is: false,
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    CA_PATH: Joi.string().optional(),
  }),
  
  BACKUP: Joi.object({
    ENABLED: Joi.boolean().default(true),
    SCHEDULE: Joi.string().pattern(/^(\*|[0-9]|\*\/[0-9]) (\*|[0-9]|\*\/[0-9]) (\*|[0-9]|\*\/[0-9]) (\*|[0-9]|\*\/[0-9]) (\*|[0-9]|\*\/[0-9])$/).default('0 2 * * *'),
    RETENTION_DAYS: Joi.number().integer().min(1).max(365).default(30),
  }),
});

// Complete configuration schema
const completeConfigSchema = Joi.object({
  SERVER: serverSchema.required(),
  DATABASE: databaseSchema.required(),
  EXTERNAL_SERVICES: externalServicesSchema.required(),
  SECURITY: securitySchema.required(),
  APP: appSchema.required(),
  DEVELOPMENT: developmentSchema.optional(),
  PRODUCTION: productionSchema.optional(),
}).xor('DEVELOPMENT', 'PRODUCTION');

// Environment-specific schemas
const developmentConfigSchema = completeConfigSchema.keys({
  DEVELOPMENT: developmentSchema.required(),
  PRODUCTION: Joi.forbidden(),
});

const productionConfigSchema = completeConfigSchema.keys({
  DEVELOPMENT: Joi.forbidden(),
  PRODUCTION: productionSchema.required(),
});

const testConfigSchema = completeConfigSchema.keys({
  DEVELOPMENT: Joi.forbidden(),
  PRODUCTION: Joi.forbidden(),
});

// Export schemas
module.exports = {
  completeConfigSchema,
  developmentConfigSchema,
  productionConfigSchema,
  testConfigSchema,
  
  // Individual schemas for specific validation
  serverSchema,
  databaseSchema,
  securitySchema,
  externalServicesSchema,
  appSchema,
  developmentSchema,
  productionSchema,
  
  // Utility schemas
  urlSchema,
  portSchema,
  emailSchema,
  secretSchema,
};
