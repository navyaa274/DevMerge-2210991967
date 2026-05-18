/**
 * Joi Validation Middleware
 * Validates request data against a Joi schema and replaces with sanitized values
 */
const { AppError } = require('../errors/AppError');

const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }));
      const err = new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      err.details = details;
      return next(err);
    }

    req[source] = value;
    next();
  };
};

module.exports = validate;
