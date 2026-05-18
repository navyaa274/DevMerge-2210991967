const Joi = require("joi");

const mentorshipValidator = {
  create: Joi.object({
    mentorId: Joi.string().required(),
    menteeId: Joi.string().required(),
    goals: Joi.array().items(Joi.string()),
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),

  update: Joi.object({
    status: Joi.string().valid("pending", "active", "completed", "cancelled"),
    goals: Joi.array().items(Joi.string()),
    startDate: Joi.date(),
    endDate: Joi.date(),
  }),

  complete: Joi.object({
    feedback: Joi.string(),
    rating: Joi.number().min(1).max(5),
  }),
};

module.exports = mentorshipValidator;
