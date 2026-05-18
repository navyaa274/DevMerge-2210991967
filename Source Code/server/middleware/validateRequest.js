/**
 * Generic middleware to validate request body against a Joi schema
 * @param {Object} schema - Joi validation schema
 */
module.exports = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(detail => detail.message);
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: errorMessages
        });
    }
    next();
};
