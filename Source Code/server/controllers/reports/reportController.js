const Report = require("../../models/admin/Report");
const User = require("../../models/auth/User");
const Course = require("../../models/academic/Course");

const reportController = {
  createReport: async (req, res) => {
    try {
      const report = new Report({
        ...req.body,
        createdBy: req.user?.id,
      });
      await report.save();
      res.status(201).json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getReports: async (req, res) => {
    try {
      const { type, status, limit = 50 } = req.query;
      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;

      const reports = await Report.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: reports });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getReportById: async (req, res) => {
    try {
      const report = await Report.findById(req.params.id).populate(
        "createdBy",
        "name email",
      );

      if (!report) {
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });
      }

      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateReport: async (req, res) => {
    try {
      const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!report) {
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });
      }

      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteReport: async (req, res) => {
    try {
      const report = await Report.findByIdAndDelete(req.params.id);

      if (!report) {
        return res
          .status(404)
          .json({ success: false, message: "Report not found" });
      }

      res.json({ success: true, message: "Report deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  generateReport: async (req, res) => {
    try {
      const { type, startDate, endDate, filters } = req.body;

      let data = [];
      switch (type) {
        case "enrollment":
          data = await generateEnrollmentReport(startDate, endDate);
          break;
        case "performance":
          data = await generatePerformanceReport(startDate, endDate, filters);
          break;
        case "activity":
          data = await generateActivityReport(startDate, endDate);
          break;
        default:
          return res
            .status(400)
            .json({ success: false, message: "Invalid report type" });
      }

      const report = new Report({
        type,
        data,
        dateRange: { startDate, endDate },
        status: "completed",
        createdBy: req.user?.id,
      });
      await report.save();

      res.json({ success: true, data: report });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

async function generateEnrollmentReport(startDate, endDate) {
  const Enrollment = require("../../models/learning/enrollments/Enrollment");
  return await Enrollment.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).populate("course student");
}

async function generatePerformanceReport(startDate, endDate, filters) {
  const Submission = require("../../models/assessment/problems/Submission");
  return await Submission.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).populate("user problem");
}

async function generateActivityReport(startDate, endDate) {
  const User = require("../../models/auth/User");
  return await User.find({
    lastLogin: { $gte: new Date(startDate), $lte: new Date(endDate) },
  });
}

module.exports = reportController;
