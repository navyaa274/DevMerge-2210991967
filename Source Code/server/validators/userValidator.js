const Joi = require("joi");

const userValidator = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string()
      .valid("student", "faculty", "hod", "admin", "super_admin")
      .default("student"),
    department: Joi.string(),
    phone: Joi.string(),
    profilePicture: Joi.string(),
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    email: Joi.string().email(),
    role: Joi.string().valid(
      "student",
      "faculty",
      "hod",
      "admin",
      "super_admin",
    ),
    department: Joi.string(),
    phone: Joi.string(),
    profilePicture: Joi.string(),
    bio: Joi.string().max(500),
  }),

  updateStatus: Joi.object({
    isActive: Joi.boolean().required(),
  }),
};

module.exports = userValidator;
