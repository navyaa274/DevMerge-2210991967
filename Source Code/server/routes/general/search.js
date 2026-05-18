const express = require('express');
const router = express.Router();
const searchController = require('../../controllers/general/searchController');
const { authenticate } = require('../../middleware/auth');

/**
 * @route   GET /api/search
 * @desc    Global Search across all entities (Users, Courses, Problems)
 * @access  Private
 */
router.get('/', authenticate, searchController.globalSearch);

module.exports = router;
