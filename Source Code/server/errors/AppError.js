/**
 * Custom Application Error Class
 * Standardizes error handling across the platform
 */
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad request', code) { return new AppError(message, 400, code || 'BAD_REQUEST'); }
  static unauthorized(message = 'Unauthorized', code) { return new AppError(message, 401, code || 'UNAUTHORIZED'); }
  static forbidden(message = 'Forbidden', code) { return new AppError(message, 403, code || 'FORBIDDEN'); }
  static notFound(message = 'Not found', code) { return new AppError(message, 404, code || 'NOT_FOUND'); }
  static conflict(message = 'Conflict', code) { return new AppError(message, 409, code || 'CONFLICT'); }
  static internal(message = 'Internal server error', code) { return new AppError(message, 500, code || 'INTERNAL_ERROR'); }

  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.errorCode,
        statusCode: this.statusCode,
        timestamp: this.timestamp
      }
    };
  }
}

// Predefined error types for consistency
const ErrorTypes = {
  // Authentication errors (401)
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401 },
  INVALID_TOKEN: { code: 'INVALID_TOKEN', status: 401 },
  TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', status: 401 },

  // Authorization errors (403)
  FORBIDDEN: { code: 'FORBIDDEN', status: 403 },
  INSUFFICIENT_PERMISSIONS: { code: 'INSUFFICIENT_PERMISSIONS', status: 403 },

  // Validation errors (400)
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', status: 400 },
  INVALID_INPUT: { code: 'INVALID_INPUT', status: 400 },

  // Resource errors (404)
  NOT_FOUND: { code: 'NOT_FOUND', status: 404 },
  RESOURCE_NOT_FOUND: { code: 'RESOURCE_NOT_FOUND', status: 404 },

  // Conflict errors (409)
  CONFLICT: { code: 'CONFLICT', status: 409 },
  DUPLICATE_ENTRY: { code: 'DUPLICATE_ENTRY', status: 409 },

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', status: 429 },

  // Server errors (500)
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500 },
  DATABASE_ERROR: { code: 'DATABASE_ERROR', status: 500 },
  SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', status: 503 }
};

module.exports = { AppError, ErrorTypes };
