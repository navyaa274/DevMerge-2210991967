const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");

const reportController = require("../../controllers/reports/reportController");
const analyticsController = require("../../controllers/admin/analyticsController");

router.get(
  "/analytics/overview",
  authenticate,
  authorize(["admin", "hod"]),
  analyticsController.getSystemOverview,
);
router.get(
  "/analytics/department/:departmentId",
  authenticate,
  authorize(["admin", "hod"]),
  analyticsController.getDepartmentAnalytics,
);
router.get(
  "/analytics/student/:studentId",
  authenticate,
  authorize(["admin", "hod", "faculty"]),
  analyticsController.getStudentProgress,
);

router.get(
  "/reports",
  authenticate,
  authorize(["admin", "faculty"]),
  reportController.getReports,
);
router.get(
  "/reports/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  reportController.getReportById,
);
router.post(
  "/reports",
  authenticate,
  authorize(["admin", "faculty"]),
  reportController.createReport,
);
router.put(
  "/reports/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  reportController.updateReport,
);
router.delete(
  "/reports/:id",
  authenticate,
  authorize(["admin"]),
  reportController.deleteReport,
);
router.post(
  "/reports/generate",
  authenticate,
  authorize(["admin", "faculty"]),
  reportController.generateReport,
);

router.use("/pdf-generation", require("./pdf-generation"));
router.use("/export", require("./export"));
router.use("/data-visualization", require("./data-visualization"));
router.use("/scheduled-reports", require("./scheduled-reports"));
router.use("/report-builder", require("./report-builder"));
router.use("/accreditation", require("./accreditation"));

module.exports = router;
