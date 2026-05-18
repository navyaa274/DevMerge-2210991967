/**
 * Middleware Composition System - Enterprise Scalable Architecture
 * Composable, reusable middleware patterns for different route groups
 */

const { SECURITY, APP } = require('../config');

class MiddlewareComposer {
  constructor() {
    this.middlewareRegistry = new Map();
    this.compositionRegistry = new Map();
    this.pipelineRegistry = new Map();
    this.cache = new Map();
  }

  /**
   * Register a middleware function
   */
  register(name, middleware, options = {}) {
    this.middlewareRegistry.set(name, {
      middleware,
      options: {
        priority: options.priority || 0,
        group: options.group || 'default',
        version: options.version || 'v1',
        dependencies: options.dependencies || [],
        conditional: options.conditional,
        cacheable: options.cacheable !== false,
        ...options,
      },
    });

    return this;
  }

  /**
   * Create a middleware composition
   */
  compose(name, middlewares, options = {}) {
    const composition = {
      name,
      middlewares: Array.isArray(middlewares) ? middlewares : [middlewares],
      options: {
        priority: options.priority || 0,
        cacheable: options.cacheable !== false,
        conditional: options.conditional,
        ...options,
      },
      compiled: null,
    };

    // Validate middleware dependencies
    this.validateComposition(composition);

    // Compile the composition
    composition.compiled = this.compileComposition(composition);

    this.compositionRegistry.set(name, composition);
    return composition.compiled;
  }

  /**
   * Create a middleware pipeline for a route group
   */
  createPipeline(groupName, pipelineConfig) {
    const pipeline = {
      name: groupName,
      stages: pipelineConfig.stages || [],
      options: pipelineConfig.options || {},
      compiled: null,
    };

    // Validate pipeline
    this.validatePipeline(pipeline);

    // Compile pipeline
    pipeline.compiled = this.compilePipeline(pipeline);

    this.pipelineRegistry.set(groupName, pipeline);
    return pipeline.compiled;
  }

  /**
   * Get middleware for a route group
   */
  getGroupMiddleware(groupName, context = {}) {
    const pipeline = this.pipelineRegistry.get(groupName);
    if (!pipeline) return [];

    // Check if pipeline should be applied
    if (!this.shouldApplyPipeline(pipeline, context)) {
      return [];
    }

    return pipeline.compiled;
  }

  /**
   * Apply conditional middleware
   */
  applyConditional(middlewareName, condition, context = {}) {
    const middleware = this.middlewareRegistry.get(middlewareName);
    if (!middleware) return [];

    if (typeof condition === 'function') {
      return condition(context) ? [middleware.middleware] : [];
    }

    if (typeof condition === 'string') {
      return this.evaluateCondition(condition, context) ? [middleware.middleware] : [];
    }

    return [middleware.middleware];
  }

  /**
   * Compile a middleware composition
   */
  compileComposition(composition) {
    const compiled = [];

    for (const mw of composition.middlewares) {
      if (typeof mw === 'string') {
        // Named middleware
        const registered = this.middlewareRegistry.get(mw);
        if (registered) {
          compiled.push(registered.middleware);
        }
      } else if (typeof mw === 'function') {
        // Direct middleware function
        compiled.push(mw);
      } else if (mw.name && mw.config) {
        // Configured middleware
        const registered = this.middlewareRegistry.get(mw.name);
        if (registered) {
          const configured = this.configureMiddleware(registered.middleware, mw.config);
          compiled.push(configured);
        }
      }
    }

    return compiled;
  }

  /**
   * Compile a middleware pipeline
   */
  compilePipeline(pipeline) {
    const compiled = [];

    for (const stage of pipeline.stages) {
      if (typeof stage === 'string') {
        // Named composition
        const composition = this.compositionRegistry.get(stage);
        if (composition) {
          compiled.push(...composition.compiled);
        }
      } else if (Array.isArray(stage)) {
        // Array of middleware
        const stageCompiled = this.compileComposition({ middlewares: stage });
        compiled.push(...stageCompiled);
      } else if (stage.composition) {
        // Complex stage configuration
        const composition = this.compositionRegistry.get(stage.composition);
        if (composition && this.shouldApplyStage(stage, pipeline.options)) {
          compiled.push(...composition.compiled);
        }
      }
    }

    return compiled;
  }

  /**
   * Configure middleware with options
   */
  configureMiddleware(middleware, config) {
    if (typeof middleware !== 'function') return middleware;

    // Return configured middleware function
    return (req, res, next) => {
      // Add config to request for middleware to access
      req.middlewareConfig = { ...req.middlewareConfig, ...config };
      return middleware(req, res, next);
    };
  }

  /**
   * Validate middleware composition
   */
  validateComposition(composition) {
    const errors = [];

    for (const mw of composition.middlewares) {
      if (typeof mw === 'string') {
        if (!this.middlewareRegistry.has(mw)) {
          errors.push(`Unknown middleware: ${mw}`);
        }
      } else if (typeof mw !== 'function' && (!mw.name || !this.middlewareRegistry.has(mw.name))) {
        errors.push(`Invalid middleware configuration: ${JSON.stringify(mw)}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Composition validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Validate middleware pipeline
   */
  validatePipeline(pipeline) {
    const errors = [];

    for (const stage of pipeline.stages) {
      if (typeof stage === 'string' && !this.compositionRegistry.has(stage)) {
        errors.push(`Unknown composition: ${stage}`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Pipeline validation failed: ${errors.join(', ')}`);
    }
  }

  /**
   * Check if pipeline should be applied
   */
  shouldApplyPipeline(pipeline, context = {}) {
    const options = pipeline.options;

    if (options.conditional) {
      return this.evaluateCondition(options.conditional, context);
    }

    if (options.environment && options.environment !== process.env.NODE_ENV) {
      return false;
    }

    if (options.disabled) {
      return false;
    }

    return true;
  }

  /**
   * Check if pipeline stage should be applied
   */
  shouldApplyStage(stage, pipelineOptions) {
    if (stage.conditional) {
      return this.evaluateCondition(stage.conditional, pipelineOptions);
    }

    return true;
  }

  /**
   * Evaluate conditional expressions
   */
  evaluateCondition(condition, context = {}) {
    if (typeof condition === 'function') {
      return condition(context);
    }

    if (typeof condition === 'string') {
      // Simple condition evaluation
      const conditions = {
        'development': process.env.NODE_ENV === 'development',
        'production': process.env.NODE_ENV === 'production',
        'authenticated': context.user && context.user.id,
        'admin': context.user && context.user.role === 'admin',
        'faculty': context.user && context.user.role === 'faculty',
        'student': context.user && context.user.role === 'student',
      };

      return conditions[condition] || false;
    }

    return true;
  }

  /**
   * Create common middleware compositions
   */
  createCommonCompositions() {
    // Authentication composition
    this.compose('auth', ['cors', 'helmet', 'rateLimit', 'authMiddleware'], {
      priority: 100,
      group: 'security',
    });

    // API composition
    this.compose('api', ['jsonParser', 'urlEncoded', 'compression', 'requestLogger'], {
      priority: 50,
      group: 'api',
    });

    // Admin composition
    this.compose('admin', ['auth', 'adminOnly', 'auditLog'], {
      priority: 200,
      group: 'admin',
      conditional: 'admin',
    });

    // Faculty composition
    this.compose('faculty', ['auth', 'facultyOnly', 'academicYearCheck'], {
      priority: 150,
      group: 'faculty',
      conditional: 'faculty',
    });

    // Student composition
    this.compose('student', ['auth', 'studentOnly', 'enrollmentCheck'], {
      priority: 100,
      group: 'student',
      conditional: 'student',
    });

    return this;
  }

  /**
   * Create group-specific pipelines
   */
  createGroupPipelines() {
    // Auth routes pipeline
    this.createPipeline('auth', {
      stages: ['cors', 'helmet', 'rateLimit', 'jsonParser', 'authValidation'],
      options: { priority: 100 }
    });

    // Admin routes pipeline
    this.createPipeline('admin', {
      stages: ['admin', 'csrf', 'adminAudit'],
      options: { priority: 200, conditional: 'admin' }
    });

    // Faculty routes pipeline
    this.createPipeline('faculty', {
      stages: ['faculty', 'academicValidation', 'facultyAudit'],
      options: { priority: 150, conditional: 'faculty' }
    });

    // Student routes pipeline
    this.createPipeline('student', {
      stages: ['student', 'academicValidation', 'progressTracking'],
      options: { priority: 100, conditional: 'student' }
    });

    // API routes pipeline
    this.createPipeline('api', {
      stages: ['api', 'apiValidation', 'responseFormatter'],
      options: { priority: 50 }
    });

    return this;
  }

  /**
   * Register common middleware
   */
  registerCommonMiddleware() {
    // Security middleware
    this.register('cors', require('cors')(SECURITY.CORS), { group: 'security' });
    this.register('helmet', require('helmet')(), { group: 'security' });
    this.register('rateLimit', require('../middleware/rateLimiter'), { group: 'security' });

    // Parsing middleware
    this.register('jsonParser', require('express').json(), { group: 'parsing' });
    this.register('urlEncoded', require('express').urlencoded({ extended: true }), { group: 'parsing' });

    // Compression
    this.register('compression', require('compression')(), { group: 'performance' });

    // Logging
    this.register('requestLogger', require('../middleware/requestLogger'), { group: 'logging' });

    // Authentication
    this.register('authMiddleware', require('../middleware/auth').authenticate, { group: 'auth' });
    this.register('authValidation', require('../middleware/authValidation'), { group: 'auth' });

    // Authorization
    this.register('adminOnly', require('../middleware/rbac').authorize(['admin', 'super_admin']), { group: 'auth' });
    this.register('facultyOnly', require('../middleware/rbac').authorize(['faculty', 'admin', 'super_admin']), { group: 'auth' });
    this.register('studentOnly', require('../middleware/rbac').authorize(['student', 'faculty', 'admin', 'super_admin']), { group: 'auth' });

    // Auditing
    this.register('auditLog', require('../middleware/auditLogger'), { group: 'logging' });
    this.register('adminAudit', require('../middleware/adminAudit'), { group: 'logging' });
    this.register('facultyAudit', require('../middleware/facultyAudit'), { group: 'logging' });

    // Validation
    this.register('csrf', require('csurf')(), { group: 'security' });
    this.register('apiValidation', require('../middleware/apiValidation'), { group: 'validation' });
    this.register('academicValidation', require('../middleware/academicValidation'), { group: 'validation' });

    // Business logic
    this.register('enrollmentCheck', require('../middleware/enrollmentCheck'), { group: 'business' });
    this.register('academicYearCheck', require('../middleware/academicYearCheck'), { group: 'business' });
    this.register('progressTracking', require('../middleware/progressTracking'), { group: 'business' });

    // Response formatting
    this.register('responseFormatter', require('../middleware/responseFormatter'), { group: 'api' });

    return this;
  }

  /**
   * Get middleware statistics
   */
  getStatistics() {
    return {
      totalMiddleware: this.middlewareRegistry.size,
      totalCompositions: this.compositionRegistry.size,
      totalPipelines: this.pipelineRegistry.size,
      middlewareByGroup: Array.from(this.middlewareRegistry.values()).reduce((acc, mw) => {
        const group = mw.options.group;
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {}),
      compositionsByPriority: Array.from(this.compositionRegistry.values()).reduce((acc, comp) => {
        const priority = comp.options.priority;
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  /**
   * Initialize the composer with common middleware and compositions
   */
  initialize() {
    this.registerCommonMiddleware();
    this.createCommonCompositions();
    this.createGroupPipelines();

    console.log('🛠️ Middleware Composer initialized');
    console.log(`📊 Registered ${this.middlewareRegistry.size} middleware functions`);
    console.log(`📦 Created ${this.compositionRegistry.size} compositions`);
    console.log(`🔧 Built ${this.pipelineRegistry.size} pipelines`);

    return this;
  }

  /**
   * Clear all registries (for testing)
   */
  clear() {
    this.middlewareRegistry.clear();
    this.compositionRegistry.clear();
    this.pipelineRegistry.clear();
    this.cache.clear();
  }
}

// Export singleton instance
const middlewareComposer = new MiddlewareComposer();
middlewareComposer.initialize();

module.exports = middlewareComposer;
module.exports.MiddlewareComposer = MiddlewareComposer;
