const Joi = require("joi");

const quizValidator = {
  create: Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    course: Joi.string(),
    questions: Joi.array()
      .items(
        Joi.object({
          text: Joi.string().required(),
          options: Joi.array().items(Joi.string()).required(),
          correctAnswer: Joi.number().integer().min(0).required(),
          points: Joi.number().min(1).default(1),
          explanation: Joi.string(),
        }),
      )
      .required(),
    timeLimit: Joi.number().min(1),
    passingScore: Joi.number().min(0).max(100),
    shuffleQuestions: Joi.boolean(),
    showResults: Joi.boolean(),
  }),

  update: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    questions: Joi.array().items(
      Joi.object({
        text: Joi.string().required(),
        options: Joi.array().items(Joi.string()).required(),
        correctAnswer: Joi.number().integer().min(0).required(),
        points: Joi.number().min(1).default(1),
        explanation: Joi.string(),
      }),
    ),
    timeLimit: Joi.number().min(1),
    passingScore: Joi.number().min(0).max(100),
    status: Joi.string().valid("draft", "published", "archived"),
  }),

  submit: Joi.object({
    answers: Joi.array().items(Joi.number().integer()).required(),
  }),
};

module.exports = quizValidator;
