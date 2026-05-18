const User = require("../../models/auth/User");
const Submission = require("../../models/assessment/problems/Submission");
const Problem = require("../../models/assessment/problems/Problem");
const ExecutionLog = require("../../models/analytics/ExecutionLog");

const telemetryController = {
  logExecution: async (req, res) => {
    try {
      const executionLog = new ExecutionLog(req.body);
      await executionLog.save();
      res.status(201).json({ success: true, data: executionLog });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getExecutionLogs: async (req, res) => {
    try {
      const { userId, limit = 50 } = req.query;
      const filter = userId ? { userId } : {};
      const logs = await ExecutionLog.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
      res.json({ success: true, data: logs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getExecutionStats: async (req, res) => {
    try {
      const stats = await ExecutionLog.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgDuration: { $avg: "$duration" },
          },
        },
      ]);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = telemetryController;
