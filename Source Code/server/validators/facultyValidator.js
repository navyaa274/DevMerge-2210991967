const Joi = require('joi');

const mongoId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/);

exports.createAssignment = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000).allow(''),
  course: mongoId.required(),
  dueDate: Joi.date().iso().allow(null),
  problems: Joi.array().items(mongoId).default([])
});

exports.createExam = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(5000).allow(''),
  course: mongoId.required(),
  examType: Joi.string().valid('midterm', 'final', 'quiz', 'practice', 'lab').default('midterm'),
  questions: Joi.array().items(Joi.object()).default([]),
  duration: Joi.number().integer().min(1).max(600),
  totalMarks: Joi.number().min(0),
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')),
  students: Joi.array().items(mongoId).default([])
});

exports.generateCohort = Joi.object({
  heuristic: Joi.string().max(100).allow('', null),
  groupSize: Joi.number().integer().min(2).max(10).default(3)
});

exports.generateLab = Joi.object({
  topic: Joi.string().min(1).max(200).default('General Algorithms'),
  difficulty: Joi.string().valid('Easy', 'Medium', 'Hard').default('Medium')
});
