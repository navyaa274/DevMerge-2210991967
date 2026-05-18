const Joi = require("joi");

const videoValidator = {
  create: Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    url: Joi.string().uri().required(),
    thumbnail: Joi.string().uri(),
    duration: Joi.number().min(0).required(),
    course: Joi.string(),
    section: Joi.string(),
    order: Joi.number().min(0),
    tags: Joi.array().items(Joi.string()),
    isPremium: Joi.boolean().default(false),
    isPublished: Joi.boolean().default(false),
  }),

  update: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    url: Joi.string().uri(),
    thumbnail: Joi.string().uri(),
    duration: Joi.number().min(0),
    course: Joi.string(),
    section: Joi.string(),
    order: Joi.number().min(0),
    tags: Joi.array().items(Joi.string()),
    isPremium: Joi.boolean(),
    isPublished: Joi.boolean(),
  }),

  watchProgress: Joi.object({
    userId: Joi.string().required(),
    watchedSeconds: Joi.number().min(0).required(),
  }),
};

module.exports = videoValidator;
