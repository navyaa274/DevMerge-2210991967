const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");

const analyticsController = require("../../controllers/analytics/analyticsController");
const telemetryController = require("../../controllers/analytics/telemetryController");
const weaknessAnalysisController = require("../../controllers/analytics/weaknessAnalysisController");
const careerController = require("../../controllers/analytics/careerController");

router.get("/career", authenticate, careerController.getCareerProjection);

router.get(
  "/dashboard",
  authenticate,
  authorize(["admin", "faculty", "hod"]),
  analyticsController.getDashboardStats,
);
router.get(
  "/users",
  authenticate,
  authorize(["admin"]),
  analyticsController.getUserAnalytics,
);
router.get(
  "/submissions",
  authenticate,
  authorize(["admin", "faculty"]),
  analyticsController.getSubmissionAnalytics,
);
router.get(
  "/courses",
  authenticate,
  authorize(["admin", "faculty"]),
  analyticsController.getCourseAnalytics,
);

router.post("/telemetry", telemetryController.logExecution);
router.get(
  "/telemetry",
  authenticate,
  authorize(["admin"]),
  telemetryController.getExecutionLogs,
);
router.get(
  "/telemetry/stats",
  authenticate,
  authorize(["admin"]),
  telemetryController.getExecutionStats,
);

router.get(
  "/weakness/:userId",
  authenticate,
  weaknessAnalysisController.analyzeUserWeaknesses,
);
router.get(
  "/weakness/:userId/analysis",
  authenticate,
  weaknessAnalysisController.getWeaknessAnalysis,
);
router.put(
  "/weakness/:userId/analysis",
  authenticate,
  weaknessAnalysisController.updateWeaknessAnalysis,
);

// Import analytics routes (student, faculty, etc.)
router.use("/", require("./analytics"));

router.use("/predictive", require("./predictive"));
router.use("/weakness-analysis", require("./weakness-analysis"));
router.use("/trends", require("./trend-analysis"));
router.use("/skill-gap", require("./analytics-advanced"));
router.use("/telemetry", require("./telemetry"));

module.exports = router;
