/**
 * Global Error Handling Middleware
 * Catches all errors and returns standardized responses
 */
const { AppError, ErrorTypes } = require('./AppError');
const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  // Default error
  let error = err;

  // Log error
  logger.error({
    message: err.message,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    stack: err.stack
  });

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
    error = new AppError(message, 400, ErrorTypes.VALIDATION_ERROR.code);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field} already exists`;
    error = new AppError(message, 409, ErrorTypes.DUPLICATE_ENTRY.code);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token', 401, ErrorTypes.INVALID_TOKEN.code);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token expired', 401, ErrorTypes.TOKEN_EXPIRED.code);
  }

  // Handle cast errors
  if (err.name === 'CastError') {
    error = new AppError('Invalid ID format', 400, ErrorTypes.INVALID_INPUT.code);
  }

  // Default to 500 if not an AppError — suppress raw messages in production
  if (!(error instanceof AppError)) {
    const message = process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : (error.message || 'Internal server error');
    error = new AppError(
      message,
      error.statusCode || 500,
      ErrorTypes.INTERNAL_ERROR.code
    );
  }

  // Send response
  res.status(error.statusCode).json(error.toJSON());
};

module.exports = errorMiddleware;
