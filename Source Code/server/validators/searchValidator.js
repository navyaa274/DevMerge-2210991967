const Joi = require("joi");

const searchValidator = {
  global: Joi.object({
    q: Joi.string().min(2).required(),
    type: Joi.string().valid(
      "all",
      "users",
      "courses",
      "problems",
      "resources",
    ),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),

  advanced: Joi.object({
    query: Joi.string().min(2).required(),
    types: Joi.array()
      .items(Joi.string().valid("users", "courses", "problems", "resources"))
      .default(["users", "courses", "problems"]),
    filters: Joi.object({
      users: Joi.object({
        role: Joi.string(),
        department: Joi.string(),
        isActive: Joi.boolean(),
      }),
      courses: Joi.object({
        department: Joi.string(),
        isActive: Joi.boolean(),
      }),
      problems: Joi.object({
        difficulty: Joi.string().valid("easy", "medium", "hard"),
        topics: Joi.array().items(Joi.string()),
      }),
    }),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
  }),
};

module.exports = searchValidator;
