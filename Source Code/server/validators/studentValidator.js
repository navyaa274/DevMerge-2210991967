const Joi = require('joi');

exports.updateProgress = Joi.object({
  completionPercentage: Joi.number().min(0).max(100),
  topicsProgress: Joi.array().items(
    Joi.object({
      topicName: Joi.string().required(),
      problemsSolved: Joi.number().integer().min(0),
      totalProblems: Joi.number().integer().min(0),
      proficiency: Joi.string().valid('beginner', 'intermediate', 'advanced')
    })
  ),
  timeSpent: Joi.number().min(0)
});

exports.updateTopicProficiency = Joi.object({
  topicName: Joi.string().min(1).max(200).required(),
  problemsSolved: Joi.number().integer().min(0).required(),
  totalProblems: Joi.number().integer().min(1).required()
});

exports.submitExam = Joi.object({
  answers: Joi.object().required()
});
