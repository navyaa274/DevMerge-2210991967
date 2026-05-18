const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");
const learningPathController = require("../../controllers/learning/learningPathController");

router.get("/", authenticate, learningPathController.getAllPaths);
router.get("/:id", authenticate, learningPathController.getPathById);
router.post(
  "/",
  authenticate,
  authorize(["admin", "faculty"]),
  learningPathController.createPath,
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  learningPathController.updatePath,
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  learningPathController.deletePath,
);
router.post(
  "/:id/courses",
  authenticate,
  authorize(["admin", "faculty"]),
  learningPathController.addCourseToPath,
);
router.get(
  "/recommended/:userId",
  authenticate,
  learningPathController.getRecommendedPaths,
);

module.exports = router;
