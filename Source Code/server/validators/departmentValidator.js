const Joi = require("joi");

/**
 * Validation schema for creating a department
 */
exports.createDepartmentSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    code: Joi.string().uppercase().min(2).max(10).required(),
    universityId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required() // Validates ObjectId string pattern
});
