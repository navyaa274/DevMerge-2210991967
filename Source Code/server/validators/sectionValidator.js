const Joi = require("joi");

/**
 * Validation schema for Section
 */
exports.sectionSchema = Joi.object({
    name: Joi.string().uppercase().min(1).max(10).required(),
    semesterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    classTeacherId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/),
    capacity: Joi.number().integer().min(1).max(500)
});
