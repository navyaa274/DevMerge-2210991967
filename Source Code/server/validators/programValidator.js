const Joi = require("joi");

const mongoId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

/**
 * Validation schema for creating a Program
 * Accepts both old field names (department) and new (departmentId) for compatibility.
 */
exports.createProgramSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    code: Joi.string().uppercase().min(2).max(15).required(),

    // Accept departmentId (frontend) or department (legacy)
    departmentId: mongoId,
    department: mongoId,

    // Accept durationYears (frontend) or duration (legacy)
    durationYears: Joi.number().integer().min(1).max(10),
    duration: Joi.number().integer().min(1).max(10),

    totalSemesters: Joi.number().integer().min(1).max(20),

    // Optional fields
    degreeType: Joi.string().valid('bachelors', 'masters', 'doctorate', 'diploma', 'certificate'),
    curriculum: Joi.object({
        totalCredits: Joi.number().integer().min(1)
    }),
    isActive: Joi.boolean()
}).or('departmentId', 'department'); // at least one must be present

exports.updateProgramSchema = Joi.object({
    name: Joi.string().min(3).max(100),
    code: Joi.string().uppercase().min(2).max(15),

    departmentId: mongoId,
    department: mongoId,

    durationYears: Joi.number().integer().min(1).max(10),
    duration: Joi.number().integer().min(1).max(10),
    totalSemesters: Joi.number().integer().min(1).max(20),

    degreeType: Joi.string().valid('bachelors', 'masters', 'doctorate', 'diploma', 'certificate'),
    curriculum: Joi.object({
        totalCredits: Joi.number().integer().min(1)
    }),
    isActive: Joi.boolean()
});
