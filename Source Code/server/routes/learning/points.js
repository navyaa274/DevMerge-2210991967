const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");
const pointsController = require("../../controllers/learning/pointsController");

router.get("/user/:userId", authenticate, pointsController.getUserPoints);
router.get("/:userId", authenticate, pointsController.getUserPoints);
router.post(
  "/:userId/add",
  authenticate,
  authorize(["admin", "faculty"]),
  pointsController.addPoints,
);
router.post(
  "/deduct",
  authenticate,
  authorize(["admin"]),
  pointsController.deductPoints,
);
router.get("/", authenticate, pointsController.getPointsLeaderboard);
router.get("/top", authenticate, pointsController.getPointsLeaderboard);
router.get("/:userId/history", authenticate, pointsController.getPointsHistory);

module.exports = router;
