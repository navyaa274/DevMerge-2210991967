const Joi = require("joi");

/**
 * Validation schema for Semester
 */
exports.semesterSchema = Joi.object({
    programId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    academicYearId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    semesterNumber: Joi.number().integer().min(1).max(20).required(),
    startDate: Joi.date(),
    endDate: Joi.date()
});
