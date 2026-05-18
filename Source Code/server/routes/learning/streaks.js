const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const streakController = require("../../controllers/learning/streakController");

router.get("/:userId", authenticate, streakController.getUserStreak);
router.post("/:userId/record", authenticate, streakController.recordActivity);
router.get(
  "/leaderboard/top",
  authenticate,
  streakController.getStreakLeaderboard,
);
router.post("/:userId/reset", authenticate, streakController.resetStreak);

module.exports = router;
