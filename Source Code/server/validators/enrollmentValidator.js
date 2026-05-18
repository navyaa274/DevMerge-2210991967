const Joi = require("joi");

/**
 * Validation schema for Enrollment
 */
exports.enrollmentSchema = Joi.object({
    studentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    sectionId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    semesterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});
