/**
 * Advanced Rate Limiter
 * Prevents abuse and DDoS attacks
 */
const cacheService = require('../services/infrastructure/cacheService');
const logger = require('../utils/logger');
const { AppError, ErrorTypes } = require('../errors/AppError');

class RateLimiter {
  /**
   * Create rate limiter middleware
   */
  static createLimiter(options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      maxRequests = 100,
      keyGenerator = (req) => req.ip,
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      message = 'Too many requests, please try again later'
    } = options;

    return async (req, res, next) => {
      // Skip rate limiting in test environment
      if (process.env.NODE_ENV === 'test') {
        return next();
      }
      try {
        const key = keyGenerator(req);
        const cacheKey = `ratelimit:${key}`;

        // Get current count
        let count = await cacheService.get(cacheKey) || 0;

        // Check if limit exceeded
        if (count >= maxRequests) {
          logger.warn('Rate limit exceeded:', { key, count, maxRequests });

          return res.status(429).json({
            success: false,
            error: {
              message,
              code: ErrorTypes.RATE_LIMIT_EXCEEDED.code,
              retryAfter: Math.ceil(windowMs / 1000)
            }
          });
        }

        // Increment counter
        count++;
        await cacheService.set(cacheKey, count, Math.ceil(windowMs / 1000));

        // Add rate limit info to response headers
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - count);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + windowMs).toISOString());

        next();
      } catch (error) {
        logger.error('Rate limiter error:', { error: error.message });
        next(); // Continue if rate limiter fails
      }
    };
  }

  /**
   * Sliding window rate limiter
   */
  static createSlidingWindowLimiter(options = {}) {
    const {
      windowMs = 60 * 1000, // 1 minute
      maxRequests = 30,
      keyGenerator = (req) => req.ip
    } = options;

    return async (req, res, next) => {
      if (process.env.NODE_ENV === 'test') {
        return next();
      }
      try {
        const key = keyGenerator(req);
        const cacheKey = `sliding:${key}`;
        const now = Date.now();

        // Get request timestamps
        let timestamps = await cacheService.get(cacheKey) || [];

        // Remove old timestamps
        timestamps = timestamps.filter(ts => now - ts < windowMs);

        // Check if limit exceeded
        if (timestamps.length >= maxRequests) {
          logger.warn('Sliding window rate limit exceeded:', { key });

          return res.status(429).json({
            success: false,
            error: {
              message: 'Too many requests',
              code: ErrorTypes.RATE_LIMIT_EXCEEDED.code
            }
          });
        }

        // Add current timestamp
        timestamps.push(now);
        await cacheService.set(cacheKey, timestamps, Math.ceil(windowMs / 1000));

        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - timestamps.length);

        next();
      } catch (error) {
        logger.error('Sliding window rate limiter error:', { error: error.message });
        next();
      }
    };
  }

  /**
   * Per-user rate limiter
   */
  static createUserLimiter(options = {}) {
    const {
      windowMs = 60 * 60 * 1000, // 1 hour
      maxRequests = 1000,
      keyGenerator = (req) => req.user?.id || req.ip
    } = options;

    return async (req, res, next) => {
      if (process.env.NODE_ENV === 'test') {
        return next();
      }
      try {
        if (!req.user) {
          return next();
        }

        const key = keyGenerator(req);
        const cacheKey = `user-ratelimit:${key}`;

        let count = await cacheService.get(cacheKey) || 0;

        if (count >= maxRequests) {
          logger.warn('User rate limit exceeded:', { userId: key, count });

          return res.status(429).json({
            success: false,
            error: {
              message: 'API rate limit exceeded',
              code: ErrorTypes.RATE_LIMIT_EXCEEDED.code
            }
          });
        }

        count++;
        await cacheService.set(cacheKey, count, Math.ceil(windowMs / 1000));

        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - count);

        next();
      } catch (error) {
        logger.error('User rate limiter error:', { error: error.message });
        next();
      }
    };
  }

  /**
   * Endpoint-specific rate limiter
   */
  static createEndpointLimiter(endpoint, options = {}) {
    const {
      windowMs = 60 * 1000,
      maxRequests = 10,
      keyGenerator = (req) => req.user?.id || req.ip
    } = options;

    return async (req, res, next) => {
      try {
        const key = keyGenerator(req);
        const cacheKey = `endpoint:${endpoint}:${key}`;

        let count = await cacheService.get(cacheKey) || 0;

        if (count >= maxRequests) {
          logger.warn('Endpoint rate limit exceeded:', { endpoint, key });

          return res.status(429).json({
            success: false,
            error: {
              message: `Too many requests to ${endpoint}`,
              code: ErrorTypes.RATE_LIMIT_EXCEEDED.code
            }
          });
        }

        count++;
        await cacheService.set(cacheKey, count, Math.ceil(windowMs / 1000));

        next();
      } catch (error) {
        logger.error('Endpoint rate limiter error:', { error: error.message });
        next();
      }
    };
  }

  /**
   * Detect and block suspicious patterns
   */
  static createAnomalyDetector(options = {}) {
    const {
      failedLoginThreshold = 5,
      failedLoginWindow = 15 * 60 * 1000, // 15 minutes
      suspiciousActivityThreshold = 20,
      suspiciousActivityWindow = 60 * 1000 // 1 minute
    } = options;

    return async (req, res, next) => {
      try {
        const key = req.ip;

        // Track failed logins
        if (req.path === '/api/auth/login' && res.statusCode === 401) {
          const failedKey = `failed-login:${key}`;
          let failedCount = await cacheService.get(failedKey) || 0;
          failedCount++;

          if (failedCount >= failedLoginThreshold) {
            logger.warn('Suspicious login attempts detected:', { ip: key, count: failedCount });
            // Could block IP or require CAPTCHA
          }

          await cacheService.set(failedKey, failedCount, Math.ceil(failedLoginWindow / 1000));
        }

        next();
      } catch (error) {
        logger.error('Anomaly detector error:', { error: error.message });
        next();
      }
    };
  }
}

module.exports = RateLimiter;
