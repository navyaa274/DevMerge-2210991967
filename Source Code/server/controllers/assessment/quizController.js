const Quiz = require("../../models/assessment/logic/Quiz");

const quizController = {
  getAllQuizzes: async (req, res) => {
    try {
      const { courseId, status, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (courseId) filter.course = courseId;
      if (status) filter.status = status;

      const quizzes = await Quiz.find(filter)
        .populate("course", "title")
        .populate("createdBy", "name email")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Quiz.countDocuments(filter);

      res.json({
        success: true,
        data: quizzes,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getQuizById: async (req, res) => {
    try {
      const quiz = await Quiz.findById(req.params.id)
        .populate("course", "title")
        .populate("createdBy", "name email")
        .populate("questions");

      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, message: "Quiz not found" });
      }

      res.json({ success: true, data: quiz });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createQuiz: async (req, res) => {
    try {
      const quiz = new Quiz({
        ...req.body,
        createdBy: req.user?.id,
      });
      await quiz.save();
      res.status(201).json({ success: true, data: quiz });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateQuiz: async (req, res) => {
    try {
      const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, message: "Quiz not found" });
      }
      res.json({ success: true, data: quiz });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteQuiz: async (req, res) => {
    try {
      const quiz = await Quiz.findByIdAndDelete(req.params.id);
      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, message: "Quiz not found" });
      }
      res.json({ success: true, message: "Quiz deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  publishQuiz: async (req, res) => {
    try {
      const quiz = await Quiz.findByIdAndUpdate(
        req.params.id,
        { status: "published", publishedAt: new Date() },
        { new: true },
      );

      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, message: "Quiz not found" });
      }

      res.json({ success: true, data: quiz });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  submitQuiz: async (req, res) => {
    try {
      const { answers } = req.body;
      const quiz = await Quiz.findById(req.params.id);

      if (!quiz) {
        return res
          .status(404)
          .json({ success: false, message: "Quiz not found" });
      }

      let score = 0;
      const results = quiz.questions.map((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) score += question.points || 1;
        return { question: question._id, userAnswer, isCorrect };
      });

      const submission = {
        user: req.user?.id,
        answers: results,
        score,
        totalPoints: quiz.questions.reduce(
          (sum, q) => sum + (q.points || 1),
          0,
        ),
        submittedAt: new Date(),
      };

      quiz.submissions.push(submission);
      await quiz.save();

      res.json({ success: true, data: { score, results } });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = quizController;
