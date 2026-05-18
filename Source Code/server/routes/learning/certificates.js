const express = require('express');
const router = express.Router();
const certificateController = require('../../controllers/learning/certificateController');
const { authenticate, authorize } = require('../../middleware/auth');

// 1. Certificate Lifecycle (Phase 5 Item 18)
router.get('/my', authenticate, certificateController.getMyCertificates);
router.get('/check/:userId/:courseId', authenticate, certificateController.checkCourseCompletion);
router.post('/issue', authenticate, authorize(['admin', 'faculty']), certificateController.issueCertificate);

// 2. Verification (Public - no auth required for employers)
router.get('/verify/:certificateNumber', certificateController.verifyCertificate);

// 3. Legacy Support / Fallbacks (Keeping existing structure)
router.get('/user/:userId', authenticate, certificateController.getMyCertificates);

module.exports = router;
