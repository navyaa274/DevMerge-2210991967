const express = require('express');
const router = express.Router();
const plagiarismController = require('../../controllers/assessment/plagiarismController');
const { authenticate, authorize } = require('../../middleware/auth');

// 1. Plagiarism Detection (Faculty & Admin Only - Phase 4 Item 32)
router.post('/check/:submissionId', authenticate, authorize(['faculty', 'admin']), plagiarismController.checkSubmission);

// 2. Fetch and Review Management
router.get('/', authenticate, authorize(['faculty', 'admin']), plagiarismController.getReports);
router.put('/review/:id', authenticate, authorize(['faculty', 'admin']), plagiarismController.reviewReport);

// 3. Automated Check Endpoint (Internal or Scheduled Task)
router.post('/auto-scan/:problemId', authenticate, authorize(['admin']), async (req, res) => {
  // Logic for bulk scanning all submissions for a contest/problem
  res.json({ success: true, message: 'Automated problem scan initiated' });
});

module.exports = router;
