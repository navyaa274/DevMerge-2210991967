const Joi = require("joi");

/**
 * Validation schema for creating/updating a university
 */
exports.universitySchema = Joi.object({
    name: Joi.string().min(3).max(150).required(),
    code: Joi.string().uppercase().min(2).max(15).required(),
    address: Joi.string().allow('', null).max(255)
});
