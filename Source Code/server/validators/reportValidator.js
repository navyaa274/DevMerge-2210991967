const Joi = require("joi");

const reportValidator = {
  create: Joi.object({
    type: Joi.string()
      .valid("enrollment", "performance", "activity", "financial", "custom")
      .required(),
    title: Joi.string().required(),
    description: Joi.string(),
    dateRange: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
    }),
    filters: Joi.object(),
    format: Joi.string().valid("pdf", "excel", "csv").default("pdf"),
  }),

  update: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    status: Joi.string().valid("pending", "processing", "completed", "failed"),
    filters: Joi.object(),
  }),

  generate: Joi.object({
    type: Joi.string()
      .valid("enrollment", "performance", "activity", "financial", "custom")
      .required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    filters: Joi.object(),
    format: Joi.string().valid("pdf", "excel", "csv").default("pdf"),
  }),
};

module.exports = reportValidator;
