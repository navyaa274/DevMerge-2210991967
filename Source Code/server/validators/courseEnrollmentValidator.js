const Joi = require("joi");

/**
 * Validation schema for Course Enrollment
 */
exports.courseEnrollmentSchema = Joi.object({
    studentId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    courseId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    semesterId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});
