const QuestionBank = require('../../models/assessment/questionBanks');
const Question = require('../../models/assessment/questions');
const QuestionOption = require('../../models/assessment/questionOptions');
const QuizAttempt = require('../../models/assessment/quizAttempts');
const QuizAnswer = require('../../models/assessment/quizAnswers');

class QuestionBankController {
  // Create a new question bank
  async createQuestionBank(req, res) {
    try {
      const userId = req.user.id;
      const { title, description, course_id, subject, topic, difficulty_level, tags, access_level } = req.body;

      // Check permissions
      const allowedRoles = ['faculty', 'admin', 'super_admin'];
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Only faculty and administrators can create question banks'
        });
      }

      const questionBank = new QuestionBank({
        title,
        description,
        course_id,
        subject,
        topic,
        difficulty_level: difficulty_level || 'Medium',
        tags: tags || [],
        access_level: access_level || 'course',
        created_by: userId
      });

      const savedQuestionBank = await questionBank.save();
      await savedQuestionBank.populate('course_id', 'title code');
      await savedQuestionBank.populate('created_by', 'first_name last_name username');

      res.status(201).json({
        success: true,
        message: 'Question bank created successfully',
        data: savedQuestionBank
      });
    } catch (error) {
      console.error('Error creating question bank:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create question bank',
        error: error.message
      });
    }
  }

  // Get question banks for a course
  async getCourseQuestionBanks(req, res) {
    try {
      const { courseId } = req.params;
      const { include_inactive = false } = req.query;

      let filter = { course_id: courseId };
      if (!include_inactive) {
        filter.is_active = true;
      }

      const questionBanks = await QuestionBank.find(filter)
        .populate('course_id', 'title code')
        .populate('created_by', 'first_name last_name username')
        .sort({ created_at: -1 });

      res.status(200).json({
        success: true,
        data: questionBanks,
        count: questionBanks.length
      });
    } catch (error) {
      console.error('Error fetching question banks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch question banks',
        error: error.message
      });
    }
  }

  // Get a specific question bank with questions
  async getQuestionBank(req, res) {
    try {
      const { questionBankId } = req.params;

      const questionBank = await QuestionBank.findById(questionBankId)
        .populate('course_id', 'title code')
        .populate('created_by', 'first_name last_name username');

      if (!questionBank) {
        return res.status(404).json({
          success: false,
          message: 'Question bank not found'
        });
      }

      // Get questions for this bank
      const questions = await Question.find({ question_bank_id: questionBankId, is_active: true })
        .populate('created_by', 'first_name last_name username')
        .sort({ created_at: -1 });

      res.status(200).json({
        success: true,
        data: {
          question_bank: questionBank,
          questions: questions
        }
      });
    } catch (error) {
      console.error('Error fetching question bank:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch question bank',
        error: error.message
      });
    }
  }

  // Create a new question
  async createQuestion(req, res) {
    try {
      const { questionBankId } = req.params;
      const userId = req.user.id;
      const {
        question_text,
        question_type,
        difficulty_level,
        points,
        time_limit_seconds,
        explanation,
        hint,
        tags,
        cognitive_level,
        subject,
        topic,
        subtopic
      } = req.body;

      // Verify question bank exists and user has access
      const questionBank = await QuestionBank.findById(questionBankId);
      if (!questionBank) {
        return res.status(404).json({
          success: false,
          message: 'Question bank not found'
        });
      }

      const question = new Question({
        question_bank_id: questionBankId,
        question_text,
        question_type,
        difficulty_level: difficulty_level || 'Medium',
        points: points || 1,
        time_limit_seconds: time_limit_seconds || 0,
        explanation,
        hint,
        tags: tags || [],
        cognitive_level: cognitive_level || 'Understand',
        subject,
        topic,
        subtopic,
        created_by: userId
      });

      const savedQuestion = await question.save();

      // Update question bank question count
      await QuestionBank.findByIdAndUpdate(questionBankId, {
        $inc: { question_count: 1, total_questions: 1 }
      });

      await savedQuestion.populate('question_bank_id', 'title');
      await savedQuestion.populate('created_by', 'first_name last_name username');

      res.status(201).json({
        success: true,
        message: 'Question created successfully',
        data: savedQuestion
      });
    } catch (error) {
      console.error('Error creating question:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create question',
        error: error.message
      });
    }
  }

  // Get random questions from question bank(s)
  async getRandomQuestions(req, res) {
    try {
      const { questionBankIds, count = 10, difficulty, subject, topic } = req.body;

      if (!questionBankIds || !Array.isArray(questionBankIds) || questionBankIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'questionBankIds must be a non-empty array'
        });
      }

      let filter = {
        question_bank_id: { $in: questionBankIds },
        is_active: true
      };

      if (difficulty) filter.difficulty_level = difficulty;
      if (subject) filter.subject = subject;
      if (topic) filter.topic = topic;

      // Get random questions
      const questions = await Question.aggregate([
        { $match: filter },
        { $sample: { size: parseInt(count) } },
        {
          $lookup: {
            from: 'questionoptions',
            localField: '_id',
            foreignField: 'question_id',
            as: 'options'
          }
        },
        {
          $lookup: {
            from: 'questionbanks',
            localField: 'question_bank_id',
            foreignField: '_id',
            as: 'question_bank'
          }
        },
        {
          $unwind: { path: '$question_bank', preserveNullAndEmptyArrays: true }
        },
        {
          $project: {
            question_text: 1,
            question_type: 1,
            difficulty_level: 1,
            points: 1,
            time_limit_seconds: 1,
            explanation: 1,
            hint: 1,
            tags: 1,
            cognitive_level: 1,
            subject: 1,
            topic: 1,
            options: {
              $map: {
                input: '$options',
                as: 'option',
                in: {
                  _id: '$$option._id',
                  option_text: '$$option.option_text',
                  option_letter: '$$option.option_letter',
                  order_index: '$$option.order_index'
                }
              }
            },
            question_bank_title: '$question_bank.title'
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: questions,
        count: questions.length
      });
    } catch (error) {
      console.error('Error fetching random questions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch random questions',
        error: error.message
      });
    }
  }

  // Start a quiz attempt
  async startQuizAttempt(req, res) {
    try {
      const userId = req.user.id;
      const { course_id, quiz_id, assignment_id, settings } = req.body;

      // Check if user already has an in-progress attempt
      const existingAttempt = await QuizAttempt.findOne({
        user_id: userId,
        $or: [
          { quiz_id: quiz_id },
          { assignment_id: assignment_id }
        ],
        status: 'in_progress'
      });

      if (existingAttempt) {
        return res.status(200).json({
          success: true,
          message: 'Continuing existing attempt',
          data: existingAttempt
        });
      }

      // Get attempt number
      const previousAttempts = await QuizAttempt.countDocuments({
        user_id: userId,
        $or: [
          { quiz_id: quiz_id },
          { assignment_id: assignment_id }
        ]
      });

      const attempt = new QuizAttempt({
        user_id: userId,
        quiz_id,
        assignment_id,
        course_id,
        attempt_number: previousAttempts + 1,
        status: 'in_progress',
        settings: settings || {}
      });

      const savedAttempt = await attempt.save();

      res.status(201).json({
        success: true,
        message: 'Quiz attempt started successfully',
        data: savedAttempt
      });
    } catch (error) {
      console.error('Error starting quiz attempt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start quiz attempt',
        error: error.message
      });
    }
  }

  // Submit quiz answers
  async submitQuizAnswers(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;
      const { answers } = req.body; // Array of answer objects

      // Verify attempt exists and belongs to user
      const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        user_id: userId,
        status: 'in_progress'
      });

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Quiz attempt not found or already completed'
        });
      }

      let correctAnswers = 0;
      let totalPoints = 0;
      let maxPoints = 0;

      // Process each answer
      for (const answer of answers) {
        const question = await Question.findById(answer.question_id);
        if (!question) continue;

        maxPoints += question.points;

        // Create answer record
        const quizAnswer = new QuizAnswer({
          quiz_attempt_id: attemptId,
          question_id: answer.question_id,
          user_id: userId,
          answer_text: answer.answer_text,
          selected_options: answer.selected_options || [],
          points_earned: 0,
          max_points: question.points,
          time_spent_seconds: answer.time_spent_seconds || 0
        });

        // Check if answer is correct (simplified logic)
        if (question.question_type === 'multiple_choice') {
          const correctOptions = await QuestionOption.find({
            question_id: question._id,
            is_correct: true
          });

          const selectedCorrect = answer.selected_options.filter(opt =>
            correctOptions.some(correct => correct._id.toString() === opt.option_id)
          ).length;

          const totalCorrect = correctOptions.length;
          const isCorrect = selectedCorrect === totalCorrect && answer.selected_options.length === totalCorrect;

          quizAnswer.is_correct = isCorrect;
          if (isCorrect) {
            quizAnswer.points_earned = question.points;
            correctAnswers++;
            totalPoints += question.points;
          }
        }

        await quizAnswer.save();
      }

      // Update attempt
      const scorePercentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
      const isPassed = scorePercentage >= (attempt.passing_score || 60);

      await QuizAttempt.findByIdAndUpdate(attemptId, {
        status: 'completed',
        end_time: Date.now(),
        answered_questions: answers.length,
        correct_answers: correctAnswers,
        score_percentage: scorePercentage,
        total_score: totalPoints,
        max_score: maxPoints,
        is_passed: isPassed
      });

      res.status(200).json({
        success: true,
        message: 'Quiz submitted successfully',
        data: {
          score_percentage: scorePercentage,
          total_score: totalPoints,
          max_score: maxPoints,
          correct_answers: correctAnswers,
          total_questions: answers.length,
          is_passed: isPassed
        }
      });
    } catch (error) {
      console.error('Error submitting quiz answers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit quiz answers',
        error: error.message
      });
    }
  }

  // Get quiz attempt results
  async getQuizAttemptResults(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user.id;

      // Verify access
      const attempt = await QuizAttempt.findOne({
        _id: attemptId,
        user_id: userId
      }).populate('quiz_id', 'title')
        .populate('assignment_id', 'title')
        .populate('course_id', 'title code');

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: 'Quiz attempt not found'
        });
      }

      // Get answers with question details
      const answers = await QuizAnswer.find({ quiz_attempt_id: attemptId })
        .populate('question_id', 'question_text question_type points explanation')
        .sort({ created_at: 1 });

      res.status(200).json({
        success: true,
        data: {
          attempt: attempt,
          answers: answers
        }
      });
    } catch (error) {
      console.error('Error fetching quiz attempt results:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quiz attempt results',
        error: error.message
      });
    }
  }
}

module.exports = new QuestionBankController();
