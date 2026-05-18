const express = require('express');
const router = express.Router();
const enterpriseController = require('../../controllers/shared/enterpriseController');

/**
 * @route   GET /api/shared/enterprise/verify/:studentId
 * @desc    Public Enterprise Student Portfolio Verification
 * @access  Public (Rate-limited, enforces privacy settings)
 */
router.get('/verify/:studentId', enterpriseController.verifyStudent);

/**
 * @route   GET /api/shared/enterprise/search
 * @desc    Professional Talent Discovery
 * @access  Restricted (Public but enforces strict privacy filters)
 */
router.get('/search', enterpriseController.searchTalent);

module.exports = router;
