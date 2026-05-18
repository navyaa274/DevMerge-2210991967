const express = require('express');
const router = express.Router();
const leaderboardController = require('../../controllers/assessment/leaderboardController');
const { authenticate } = require('../../middleware/auth');

// 1. Global Leaderboard
router.get('/global', authenticate, leaderboardController.getGlobalLeaderboard);

// 2. Section-wise Leaderboard (Phase 5 Item 17)
router.get('/section', authenticate, leaderboardController.getSectionLeaderboard);

// 3. User Ranking Context
router.get('/my-rank', authenticate, leaderboardController.getMyRank);

module.exports = router;
