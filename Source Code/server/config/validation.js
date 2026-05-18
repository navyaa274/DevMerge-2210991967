/**
 * Server Configuration Validation Layer
 * Validates all required environment variables at startup
 * Fails fast if configuration is invalid
 */

// Required environment variables for backend
const REQUIRED_ENV_VARS = {
  // Server Configuration
  PORT: {
    required: true,
    type: 'number',
    min: 1,
    max: 65535,
    message: 'PORT must be a number between 1 and 65535'
  },

  HOST: {
    required: true,
    type: 'string',
    pattern: /^[a-zA-Z0-9.-]+$/,
    message: 'HOST must be a valid hostname'
  },

  NODE_ENV: {
    required: true,
    type: 'string',
    enum: ['development', 'production', 'test'],
    message: 'NODE_ENV must be development, production, or test'
  },

  // Database Configuration
  MONGODB_URI: {
    required: true,
    type: 'string',
    pattern: /^mongodb(\+srv)?:\/\//,
    message: 'MONGODB_URI must be a valid MongoDB connection string'
  },

  // Security Configuration (Critical)
  JWT_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    message: 'JWT_SECRET must be at least 32 characters long'
  },

  JWT_REFRESH_SECRET: {
    required: true,
    type: 'string',
    minLength: 32,
    message: 'JWT_REFRESH_SECRET must be at least 32 characters long'
  },

  JWT_EXPIRE: {
    required: false,
    type: 'string',
    pattern: /^\d+[smhd]$/,
    default: '24h',
    message: 'JWT_EXPIRE must be in format like 24h, 7d, 30m'
  },

  // External Services
  CODE_EXECUTOR_URL: {
    required: true,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    message: 'CODE_EXECUTOR_URL must be a valid HTTP/HTTPS URL'
  },

  OLLAMA_URL: {
    required: false,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    default: 'http://localhost:11434',
    message: 'OLLAMA_URL must be a valid HTTP/HTTPS URL'
  },

  // CORS Configuration
  CORS_ORIGIN: {
    required: true,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    message: 'CORS_ORIGIN must be a valid HTTP/HTTPS URL'
  },

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: {
    required: false,
    type: 'number',
    min: 1000,
    default: 900000,
    message: 'RATE_LIMIT_WINDOW_MS must be at least 1000ms'
  },

  RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    type: 'number',
    min: 1,
    default: 100,
    message: 'RATE_LIMIT_MAX_REQUESTS must be at least 1'
  },

  // Email Configuration (Optional but recommended)
  SMTP_HOST: {
    required: false,
    type: 'string',
    default: 'smtp.gmail.com'
  },

  SMTP_PORT: {
    required: false,
    type: 'number',
    min: 1,
    max: 65535,
    default: 587,
    message: 'SMTP_PORT must be between 1 and 65535'
  },

  SMTP_USER: {
    required: false,
    type: 'string'
  },

  SMTP_PASS: {
    required: false,
    type: 'string'
  },

  // File Upload Configuration
  UPLOAD_MAX_SIZE: {
    required: false,
    type: 'number',
    min: 1024,
    default: 52428800,
    message: 'UPLOAD_MAX_SIZE must be at least 1024 bytes'
  },

  UPLOAD_PATH: {
    required: false,
    type: 'string',
    default: './uploads'
  },

  // AI Providers
  GROQ_API_KEY: {
    required: false, // Optional but primary
    type: 'string',
    message: 'GROQ_API_KEY is recommended for advanced AI features'
  },

  OPENAI_API_KEY: {
    required: false,
    type: 'string'
  }
};

// Critical security checks
const SECURITY_CHECKS = {
  // JWT secrets must be different
  differentJwtSecrets: () => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (jwtSecret === refreshSecret) {
      throw new Error('❌ JWT_SECRET and JWT_REFRESH_SECRET must be different');
    }
  },

  // JWT secrets must not be default values
  noDefaultJwtSecrets: () => {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    const defaultSecrets = [
      'your-super-secure-jwt-secret-key',
      'your-super-secure-refresh-secret-key',
      'secret',
      'password',
      '123456'
    ];

    if (defaultSecrets.includes(jwtSecret) || defaultSecrets.includes(refreshSecret)) {
      throw new Error('❌ JWT secrets cannot use default values. Change them in production!');
    }
  },

  // Production security checks
  productionSecurity: () => {
    if (process.env.NODE_ENV === 'production') {
      // Check for localhost in production
      if (process.env.MONGODB_URI.includes('localhost')) {
        throw new Error('❌ Production cannot use localhost MongoDB');
      }

      if (process.env.CORS_ORIGIN.includes('localhost')) {
        throw new Error('❌ Production CORS_ORIGIN cannot be localhost');
      }

      // Check for weak JWT secrets
      if (process.env.JWT_SECRET.length < 64) {
        throw new Error('❌ Production JWT_SECRET must be at least 64 characters');
      }

      if (process.env.JWT_REFRESH_SECRET.length < 64) {
        throw new Error('❌ Production JWT_REFRESH_SECRET must be at least 64 characters');
      }
    }
  }
};

// Validation functions
const validateType = (value, type) => {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return !isNaN(Number(value));
    case 'boolean':
      return value === 'true' || value === 'false';
    default:
      return true;
  }
};

const validatePattern = (value, pattern) => {
  return pattern.test(value);
};

const validateEnum = (value, enumValues) => {
  return enumValues.includes(value);
};

const validateRange = (value, min, max) => {
  const num = Number(value);
  return num >= min && num <= max;
};

const validateMinLength = (value, minLength) => {
  return value.length >= minLength;
};

// Single environment variable validation
const validateEnvVar = (key, config) => {
  const value = process.env[key];

  // Check if required but missing
  if (config.required && (value === undefined || value === '')) {
    throw new Error(`❌ Required environment variable ${key} is not defined`);
  }

  // If not required and missing, use default
  if (!config.required && (value === undefined || value === '')) {
    if (config.default !== undefined) {
      process.env[key] = config.default;
      return;
    }
    return; // Optional and no default, skip validation
  }

  // Type validation
  if (config.type && !validateType(value, config.type)) {
    throw new Error(`❌ Environment variable ${key} must be of type ${config.type}`);
  }

  // Pattern validation
  if (config.pattern && !validatePattern(value, config.pattern)) {
    throw new Error(`❌ Environment variable ${key} ${config.message}`);
  }

  // Enum validation
  if (config.enum && !validateEnum(value, config.enum)) {
    throw new Error(`❌ Environment variable ${key} must be one of: ${config.enum.join(', ')}`);
  }

  // Range validation
  if (config.min !== undefined || config.max !== undefined) {
    if (!validateRange(value, config.min || 0, config.max || Number.MAX_SAFE_INTEGER)) {
      throw new Error(`❌ Environment variable ${key} ${config.message}`);
    }
  }

  // Min length validation
  if (config.minLength && !validateMinLength(value, config.minLength)) {
    throw new Error(`❌ Environment variable ${key} ${config.message}`);
  }
};

// Validate all environment variables
const validateConfiguration = () => {
  console.log('🔍 Validating server configuration...');

  const errors = [];
  const warnings = [];

  // Validate each required environment variable
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, config]) => {
    try {
      validateEnvVar(key, config);
      const value = process.env[key];
      const maskedValue = (key.includes('SECRET') || key.includes('PASS') || key.includes('KEY') || key.includes('URI')) ? '********' : (value || 'default');
      console.log(`✅ ${key}: ${maskedValue}`);
    } catch (error) {
      if (config.required) {
        errors.push(error.message);
      } else {
        warnings.push(error.message);
      }
    }
  });

  // Run security checks
  try {
    Object.values(SECURITY_CHECKS).forEach(check => {
      check();
    });
    console.log('✅ Security checks passed');
  } catch (error) {
    errors.push(error.message);
  }

  // Check for critical production issues
  if (process.env.NODE_ENV === 'production') {
    // Check for development-only features
    if (process.env.DEBUG === 'app:*') {
      warnings.push('⚠️ DEBUG mode should be disabled in production');
    }

    if (process.env.HOT_RELOAD === 'true') {
      warnings.push('⚠️ Hot reload should be disabled in production');
    }
  }

  // Report results
  if (errors.length > 0) {
    console.error('\n❌ Configuration validation failed:');
    errors.forEach(error => console.error(`   ${error}`));

    if (process.env.NODE_ENV === 'production') {
      console.error('\n🚨 Server cannot start with invalid configuration');
      console.error('💡 Please check your .env file and fix the above issues');
      process.exit(1);
    } else {
      console.warn('\n⚠️ Continuing with invalid configuration in non-production mode');
      console.warn('💡 Some features may not work correctly. Check your .env file.');
    }
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️ Configuration warnings:');
    warnings.forEach(warning => console.warn(`   ${warning}`));
  }

  console.log('✅ Server configuration validated successfully');
  console.log(`🚀 Server ready to start on port ${process.env.PORT}`);
  return true;
};

// Export validation function
module.exports = { validateConfiguration };

// Auto-validate on import
validateConfiguration();
