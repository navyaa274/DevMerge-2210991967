/**
 * Configuration Validation Layer
 * Validates all required environment variables at startup
 * Fails fast if configuration is invalid
 */

// Required environment variables for frontend
const REQUIRED_ENV_VARS = {
  // API Configuration
  REACT_APP_API_URL: {
    required: true,
    type: 'string',
    pattern: /^https?:\/\/.+/,
    message: 'API URL must be a valid HTTP/HTTPS URL'
  },
  
  // Environment
  REACT_APP_ENV: {
    required: true,
    type: 'string',
    enum: ['development', 'production', 'test'],
    message: 'Environment must be development, production, or test'
  },
  
  // Optional but recommended
  REACT_APP_VERSION: {
    required: false,
    type: 'string',
    default: '1.0.0'
  },
  
  REACT_APP_PLATFORM_NAME: {
    required: false,
    type: 'string',
    default: 'AI University Platform'
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
};

// Validate all environment variables
const validateConfiguration = () => {
  console.log('🔍 Validating frontend configuration...');
  
  const errors = [];
  const warnings = [];
  
  // Validate each required environment variable
  Object.entries(REQUIRED_ENV_VARS).forEach(([key, config]) => {
    try {
      validateEnvVar(key, config);
      console.log(`✅ ${key}: ${process.env[key] || 'default'}`);
    } catch (error) {
      if (config.required) {
        errors.push(error.message);
      } else {
        warnings.push(error.message);
      }
    }
  });
  
  // Check for critical security issues
  if (process.env.REACT_APP_ENV === 'production') {
    if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.includes('localhost')) {
      errors.push('❌ Production environment cannot use localhost API URL');
    }
    
    if (process.env.NODE_ENV !== 'production') {
      warnings.push('⚠️ REACT_APP_ENV is production but NODE_ENV is not production');
    }
  }
  
  // Report results
  if (errors.length > 0) {
    console.error('\n❌ Configuration validation failed:');
    errors.forEach(error => console.error(`   ${error}`));
    console.error('\n🚨 Application cannot start with invalid configuration');
    process.exit(1);
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️ Configuration warnings:');
    warnings.forEach(warning => console.warn(`   ${warning}`));
  }
  
  console.log('✅ Frontend configuration validated successfully');
  return true;
};

// Export validation function
export { validateConfiguration };

// Auto-validate on import in production
if (process.env.REACT_APP_ENV === 'production') {
  validateConfiguration();
}
