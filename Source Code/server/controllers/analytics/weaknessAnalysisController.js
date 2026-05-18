const WeaknessAnalysis = require("../../models/analytics/WeaknessAnalysis");
const Submission = require("../../models/assessment/problems/Submission");
const User = require("../../models/auth/User");

const weaknessAnalysisController = {
  analyzeUserWeaknesses: async (req, res) => {
    try {
      const { userId } = req.params;

      const submissions = await Submission.find({ student: userId }).populate(
        "problem",
      );

      const topicScores = {};
      submissions.forEach((sub) => {
        if (sub.problem?.topics) {
          sub.problem.topics.forEach((topic) => {
            if (!topicScores[topic])
              topicScores[topic] = { correct: 0, total: 0 };
            topicScores[topic].total++;
            if (sub.status === "accepted") topicScores[topic].correct++;
          });
        }
      });

      const weaknesses = Object.entries(topicScores)
        .filter(
          ([_, data]) => data.total >= 3 && data.correct / data.total < 0.5,
        )
        .map(([topic, data]) => ({
          topic,
          accuracy: data.correct / data.total,
          attempts: data.total,
        }))
        .sort((a, b) => a.accuracy - b.accuracy);

      res.json({ success: true, data: weaknesses });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getWeaknessAnalysis: async (req, res) => {
    try {
      const { userId } = req.params;
      let analysis = await WeaknessAnalysis.findOne({ user: userId });

      if (!analysis) {
        analysis = new WeaknessAnalysis({ user: userId, weaknesses: [] });
        await analysis.save();
      }

      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateWeaknessAnalysis: async (req, res) => {
    try {
      const { userId } = req.params;
      const { topic, score } = req.body;

      let analysis = await WeaknessAnalysis.findOne({ user: userId });

      if (!analysis) {
        analysis = new WeaknessAnalysis({ user: userId, weaknesses: [] });
      }

      const existingWeakness = analysis.weaknesses.find(
        (w) => w.topic === topic,
      );
      if (existingWeakness) {
        existingWeakness.score = score;
        existingWeakness.lastUpdated = new Date();
      } else {
        analysis.weaknesses.push({ topic, score, lastUpdated: new Date() });
      }

      await analysis.save();
      res.json({ success: true, data: analysis });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = weaknessAnalysisController;
