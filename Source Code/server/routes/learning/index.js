const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");

const learningPathController = require("../../controllers/learning/learningPathController");
const videoController = require("../../controllers/learning/videoController");
const resourceController = require("../../controllers/learning/resourceController");

router.use((req, res, next) => {
  console.log(`[Learning Router] Request: ${req.method} ${req.url}`);
  next();
});

router.get("/paths", authenticate, learningPathController.getAllPaths);
router.get("/paths/:id", authenticate, learningPathController.getPathById);
router.post(
  "/paths",
  authenticate,
  authorize(["admin", "faculty"]),
  learningPathController.createPath,
);
router.put(
  "/paths/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  learningPathController.updatePath,
);
router.delete(
  "/paths/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  learningPathController.deletePath,
);
router.get(
  "/paths/recommended/:userId",
  authenticate,
  learningPathController.getRecommendedPaths,
);

router.get("/videos", authenticate, videoController.getAllVideos);
router.get("/videos/:id", authenticate, videoController.getVideoById);
router.post(
  "/videos",
  authenticate,
  authorize(["admin", "faculty"]),
  videoController.createVideo,
);
router.put(
  "/videos/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  videoController.updateVideo,
);
router.delete(
  "/videos/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  videoController.deleteVideo,
);
router.post(
  "/videos/:videoId/progress",
  authenticate,
  videoController.recordWatchProgress,
);

router.get("/resources", authenticate, resourceController.getAllResources);
router.get("/resources/:id", authenticate, resourceController.getResourceById);
router.post(
  "/resources",
  authenticate,
  authorize(["admin", "faculty"]),
  resourceController.createResource,
);
router.put(
  "/resources/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  resourceController.updateResource,
);
router.delete(
  "/resources/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  resourceController.deleteResource,
);
router.get(
  "/resources/search",
  authenticate,
  resourceController.searchResources,
);

router.use("/badges", require("./badges"));
router.use("/points", require("./points"));
router.use("/learning-paths", require("./learning-paths"));
router.use("/certificates", require("./certificates"));
router.use("/recommendations", require("./recommendations"));
router.use("/learning/recommendations", require("./recommendations"));
router.use("/streaks", require("./streaks"));
router.use("/course-enrollments", require("./course-enrollments"));
router.use("/materials", require("./materials"));
router.use("/course-materials", require("./materials"));
router.use("/interventions", require("./interventions"));
router.use("/mock-interviews", require("./mock-interviews"));
router.use("/", require("./questRoutes"));
router.use("/leaderboard", require("./points"));

module.exports = router;
