const Joi = require("joi");

const feedbackValidator = {
  create: Joi.object({
    type: Joi.string()
      .valid("bug", "feature", "improvement", "general")
      .required(),
    category: Joi.string(),
    subject: Joi.string().required(),
    description: Joi.string().required(),
    priority: Joi.string().valid("low", "medium", "high", "critical"),
    attachments: Joi.array().items(Joi.string()),
  }),

  update: Joi.object({
    status: Joi.string().valid("pending", "in_progress", "resolved", "closed"),
    priority: Joi.string().valid("low", "medium", "high", "critical"),
    assignedTo: Joi.string(),
  }),

  respond: Joi.object({
    response: Joi.string().required(),
  }),
};

module.exports = feedbackValidator;
