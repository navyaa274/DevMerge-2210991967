const Joi = require("joi");

const badgeValidator = {
  create: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    icon: Joi.string(),
    category: Joi.string()
      .valid("achievement", "milestone", "skill", "participation", "special")
      .required(),
    criteria: Joi.object({
      type: Joi.string()
        .valid("submission_count", "problem_count", "streak", "score", "custom")
        .required(),
      threshold: Joi.number().required(),
    }).required(),
    points: Joi.number().min(0).default(0),
    rarity: Joi.string()
      .valid("common", "uncommon", "rare", "epic", "legendary")
      .default("common"),
  }),

  update: Joi.object({
    name: Joi.string(),
    description: Joi.string(),
    icon: Joi.string(),
    category: Joi.string().valid(
      "achievement",
      "milestone",
      "skill",
      "participation",
      "special",
    ),
    criteria: Joi.object({
      type: Joi.string().valid(
        "submission_count",
        "problem_count",
        "streak",
        "score",
        "custom",
      ),
      threshold: Joi.number(),
    }),
    points: Joi.number().min(0),
    rarity: Joi.string().valid(
      "common",
      "uncommon",
      "rare",
      "epic",
      "legendary",
    ),
  }),

  award: Joi.object({
    userId: Joi.string().required(),
    badgeId: Joi.string().required(),
  }),
};

module.exports = badgeValidator;
