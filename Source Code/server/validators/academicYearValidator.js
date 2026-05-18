const Joi = require("joi");

/**
 * Validation schema for Academic Year
 */
exports.academicYearSchema = Joi.object({
    year: Joi.string().pattern(/^\d{4}-\d{4}$/).required(), // e.g., 2025-2026
    isActive: Joi.boolean()
});
