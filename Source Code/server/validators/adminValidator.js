const Joi = require('joi');

exports.bulkUpload = Joi.object({
  students: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
      department: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null, '')
    })
  ).min(1).max(500).required()
});

exports.createWAF = Joi.object({
  ip: Joi.string().ip().required(),
  reason: Joi.string().max(500).allow(''),
  blockedAt: Joi.date().iso(),
  expiresAt: Joi.date().iso()
});

exports.createRole = Joi.object({
  module: Joi.string().min(1).max(100).required(),
  student: Joi.boolean().default(false),
  faculty: Joi.boolean().default(false),
  admin: Joi.boolean().default(false),
  superAdmin: Joi.boolean().default(true)
});
