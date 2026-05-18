const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");
const videoController = require("../../controllers/learning/videoController");

router.get("/", authenticate, videoController.getAllVideos);
router.get("/:id", authenticate, videoController.getVideoById);
router.post(
  "/",
  authenticate,
  authorize(["admin", "faculty"]),
  videoController.createVideo,
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  videoController.updateVideo,
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  videoController.deleteVideo,
);
router.post(
  "/:videoId/progress",
  authenticate,
  videoController.recordWatchProgress,
);

module.exports = router;
