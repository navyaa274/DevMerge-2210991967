/**
 * Advanced Configuration Validator
 * Uses Joi schemas for comprehensive validation
 * Provides detailed error reporting and suggestions
 */

const Joi = require('joi');
const { 
  completeConfigSchema, 
  developmentConfigSchema, 
  productionConfigSchema, 
  testConfigSchema 
} = require('./schema');

class ConfigurationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];
  }

  // Validate complete configuration
  validate(config, environment = process.env.NODE_ENV) {
    this.errors = [];
    this.warnings = [];
    this.suggestions = [];

    let schema;
    switch (environment) {
      case 'development':
        schema = developmentConfigSchema;
        break;
      case 'production':
        schema = productionConfigSchema;
        break;
      case 'test':
        schema = testConfigSchema;
        break;
      default:
        schema = completeConfigSchema;
    }

    const { error, value } = schema.validate(config, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      error.details.forEach(detail => {
        const message = this.formatValidationError(detail);
        if (this.isCriticalError(detail)) {
          this.errors.push(message);
        } else {
          this.warnings.push(message);
        }
        this.addSuggestion(detail);
      });
    }

    // Run additional custom validations
    this.runCustomValidations(value, environment);

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions,
      validatedConfig: value,
    };
  }

  // Format validation error for better readability
  formatValidationError(detail) {
    const path = detail.path.join('.');
    const message = detail.message;
    
    // Add context based on the field
    const context = this.getErrorContext(path);
    
    return `❌ ${path}: ${message}${context ? ` (${context})` : ''}`;
  }

  // Get additional context for errors
  getErrorContext(path) {
    const contexts = {
      'SECURITY.JWT.SECRET': 'Use: openssl rand -base64 64',
      'SECURITY.JWT.REFRESH_SECRET': 'Use: openssl rand -base64 64',
      'DATABASE.MONGODB_URI': 'Format: mongodb://user:pass@host:port/db',
      'EXTERNAL_SERVICES.CODE_EXECUTOR.URL': 'Ensure code executor service is running',
      'SECURITY.CORS.ORIGIN': 'Must match your frontend URL',
      'EXTERNAL_SERVICES.EMAIL.USER': 'Gmail: use app-specific password',
      'PRODUCTION.SSL.CERT_PATH': 'Required for production HTTPS',
    };
    
    return contexts[path] || '';
  }

  // Check if error is critical (prevents startup)
  isCriticalError(detail) {
    const criticalPaths = [
      'SERVER.PORT',
      'DATABASE.MONGODB_URI',
      'SECURITY.JWT.SECRET',
      'SECURITY.JWT.REFRESH_SECRET',
      'SECURITY.CORS.ORIGIN',
      'EXTERNAL_SERVICES.CODE_EXECUTOR.URL',
    ];
    
    const path = detail.path.join('.');
    return criticalPaths.some(criticalPath => path.startsWith(criticalPath));
  }

  // Add suggestions for fixing errors
  addSuggestion(detail) {
    const path = detail.path.join('.');
    const suggestions = {
      'SECURITY.JWT.SECRET': '🔧 Generate secure JWT secret: openssl rand -base64 64',
      'SECURITY.JWT.REFRESH_SECRET': '🔧 Generate secure refresh secret: openssl rand -base64 64',
      'DATABASE.MONGODB_URI': '🔧 Check MongoDB connection string and ensure MongoDB is running',
      'SERVER.PORT': '🔧 Choose a different port or stop the process using the current port',
      'SECURITY.CORS.ORIGIN': '🔧 Update CORS_ORIGIN to match your frontend URL',
      'EXTERNAL_SERVICES.EMAIL.USER': '🔧 Set up SMTP credentials or use  email service',
      'PRODUCTION.SSL.CERT_PATH': '🔧 Obtain SSL certificates for production HTTPS',
      'EXTERNAL_SERVICES.CODE_EXECUTOR.URL': '🔧 Start the code executor service on the specified URL',
    };
    
    if (suggestions[path] && !this.suggestions.includes(suggestions[path])) {
      this.suggestions.push(suggestions[path]);
    }
  }

  // Run custom validations beyond Joi schemas
  runCustomValidations(config, environment) {
    // Production-specific validations
    if (environment === 'production') {
      this.validateProductionSecurity(config);
      this.validateProductionInfrastructure(config);
      this.validateProductionPerformance(config);
    }

    // Cross-environment validations
    this.validateJwtSecrets(config.SECURITY.JWT);
    this.validateDatabaseConnection(config.DATABASE);
    this.validateExternalServices(config.EXTERNAL_SERVICES);
    this.validateFeatureFlags(config.APP.FEATURES);
  }

  // Validate production security requirements
  validateProductionSecurity(config) {
    const { SECURITY } = config;
    
    // JWT secrets must be strong in production
    if (SECURITY.JWT.SECRET.length < 64) {
      this.errors.push('❌ Production JWT_SECRET must be at least 64 characters');
      this.suggestions.push('🔧 Generate stronger JWT secret: openssl rand -base64 64');
    }
    
    if (SECURITY.JWT.REFRESH_SECRET.length < 64) {
      this.errors.push('❌ Production JWT_REFRESH_SECRET must be at least 64 characters');
      this.suggestions.push('🔧 Generate stronger refresh secret: openssl rand -base64 64');
    }
    
    // No localhost in production
    if (config.DATABASE.MONGODB_URI.includes('localhost')) {
      this.errors.push('❌ Production cannot use localhost MongoDB');
      this.suggestions.push('🔧 Use MongoDB Atlas or production database server');
    }
    
    if (SECURITY.CORS.ORIGIN.includes('localhost')) {
      this.errors.push('❌ Production CORS_ORIGIN cannot be localhost');
      this.suggestions.push('🔧 Set CORS_ORIGIN to your production frontend URL');
    }
    
    // SSL required for production
    if (!config.PRODUCTION?.SSL?.CERT_PATH && !config.PRODUCTION?.CDN_ENABLED) {
      this.warnings.push('⚠️ Production should use SSL certificates');
      this.suggestions.push('🔧 Obtain SSL certificates or enable CDN with SSL');
    }
  }

  // Validate production infrastructure
  validateProductionInfrastructure(config) {
    // Check for required services
    if (!config.EXTERNAL_SERVICES.EMAIL.USER && !config.DEVELOPMENT?._EMAIL_SERVICES) {
      this.warnings.push('⚠️ Production should have real email service configured');
      this.suggestions.push('🔧 Configure SMTP settings or use email service provider');
    }
    
    // Backup should be enabled
    if (!config.PRODUCTION?.BACKUP?.ENABLED) {
      this.warnings.push('⚠️ Production should have backups enabled');
      this.suggestions.push('🔧 Enable automatic backups for data safety');
    }
    
    // Monitoring should be configured
    if (!config.EXTERNAL_SERVICES.MONITORING.ERROR_TRACKING_DSN) {
      this.warnings.push('⚠️ Production should have error tracking configured');
      this.suggestions.push('🔧 Set up error tracking service (Sentry, etc.)');
    }
  }

  // Validate production performance settings
  validateProductionPerformance(config) {
    // Compression should be enabled
    if (!config.PRODUCTION?.COMPRESSION) {
      this.warnings.push('⚠️ Production should have compression enabled');
      this.suggestions.push('🔧 Enable compression for better performance');
    }
    
    // Rate limiting should be strict
    if (config.SECURITY.RATE_LIMITING.MAX_REQUESTS > 1000) {
      this.warnings.push('⚠️ Production rate limiting might be too permissive');
      this.suggestions.push('🔧 Consider stricter rate limiting for production');
    }
  }

  // Validate JWT secrets are different and secure
  validateJwtSecrets(jwtConfig) {
    if (jwtConfig.SECRET === jwtConfig.REFRESH_SECRET) {
      this.errors.push('❌ JWT_SECRET and JWT_REFRESH_SECRET must be different');
      this.suggestions.push('🔧 Use different secrets for JWT and refresh tokens');
    }
    
    // Check for common/default secrets
    const commonSecrets = [
      'secret', 'password', '123456', 'admin', 'test',
      'your-super-secure-jwt-secret-key',
      'your-super-secure-refresh-secret-key',
    ];
    
    if (commonSecrets.includes(jwtConfig.SECRET.toLowerCase())) {
      this.errors.push('❌ JWT_SECRET cannot use default/common values');
      this.suggestions.push('🔧 Generate a unique JWT secret: openssl rand -base64 64');
    }
    
    if (commonSecrets.includes(jwtConfig.REFRESH_SECRET.toLowerCase())) {
      this.errors.push('❌ JWT_REFRESH_SECRET cannot use default/common values');
      this.suggestions.push('🔧 Generate a unique refresh secret: openssl rand -base64 64');
    }
  }

  // Validate database configuration
  validateDatabaseConnection(dbConfig) {
    // Check MongoDB URI format
    if (!dbConfig.MONGODB_URI.match(/^mongodb(\+srv)?:\/\//)) {
      this.errors.push('❌ Invalid MongoDB URI format');
      this.suggestions.push('🔧 Use format: mongodb://user:pass@host:port/db');
    }
    
    // Check for auth in production
    if (process.env.NODE_ENV === 'production') {
      if (!dbConfig.MONGODB_URI.includes('@') && !dbConfig.MONGODB_URI.includes('localhost')) {
        this.warnings.push('⚠️ Production MongoDB should use authentication');
        this.suggestions.push('🔧 Add username and password to MongoDB connection string');
      }
    }
  }

  // Validate external services configuration
  validateExternalServices(services) {
    // Code executor must be accessible
    if (!services.CODE_EXECUTOR.URL.match(/^https?:\/\/.+/)) {
      this.errors.push('❌ Invalid CODE_EXECUTOR_URL format');
      this.suggestions.push('🔧 Use format: http://localhost:5001 or https://executor.example.com');
    }
    
    // AI services configuration
    if (!services.AI_SERVICES.GROQ.API_KEY && !services.AI_SERVICES.OPENAI.API_KEY) {
      this.warnings.push('⚠️ No AI service API keys configured');
      this.suggestions.push('🔧 Add GROQ_API_KEY or OPENAI_API_KEY for AI features');
    }
    
    // Email service configuration
    if (services.EMAIL.USER && !services.EMAIL.PASS) {
      this.warnings.push('⚠️ Email user configured but no password provided');
      this.suggestions.push('🔧 Add SMTP password or use app-specific password');
    }
  }

  // Validate feature flags consistency
  validateFeatureFlags(features) {
    // Check for inconsistent feature combinations
    if (features.CODE_EXECUTION && !features.AI_TUTORING) {
      this.warnings.push('⚠️ Code execution enabled but AI tutoring disabled');
      this.suggestions.push('🔧 Consider enabling AI tutoring for better code assistance');
    }
    
    if (features.MOBILE_APP && !features.API_RATE_LIMITING) {
      this.warnings.push('⚠️ Mobile app enabled but API rate limiting disabled');
      this.suggestions.push('🔧 Enable rate limiting for mobile app security');
    }
    
    if (features.MULTILINGUAL && features.ADVANCED_ANALYTICS) {
      this.warnings.push('⚠️ Both multilingual and advanced analytics enabled - may impact performance');
      this.suggestions.push('🔧 Monitor performance with these features enabled');
    }
  }

  // Generate validation report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        totalSuggestions: this.suggestions.length,
        isValid: this.errors.length === 0,
      },
      errors: this.errors,
      warnings: this.warnings,
      suggestions: this.suggestions,
    };
    
    return report;
  }
}

module.exports = ConfigurationValidator;
