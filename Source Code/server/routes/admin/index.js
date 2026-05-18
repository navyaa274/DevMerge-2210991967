const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const adminSchemas = require('../../validators/adminValidator');
const adminController = require('../../controllers/admin/adminController');
const reportController = require('../../controllers/admin/reportController');
const securityController = require('../../controllers/admin/securityController');
const systemController = require('../../controllers/admin/systemController');
const analyticsController = require('../../controllers/admin/analyticsController');
const asyncHandler = require('../../errors/asyncHandler');

// Import comprehensive analytics routes
const analyticsRoutes = require('./analytics');

// Dashboard Analytics
router.get('/analytics/overview', authenticate, authorize(['admin', 'super_admin']), analyticsController.getSystemOverview);

// Comprehensive Analytics Routes
router.use('/', analyticsRoutes);

// Problem & Exam Approvals
router.put('/problems/:id/approve', authenticate, authorize(['admin', 'super_admin']), adminController.approveProblem);
router.put('/exams/:id/approve', authenticate, authorize(['admin', 'super_admin']), adminController.approveExam);

// User Management
router.post('/students/bulk-upload', authenticate, authorize(['admin', 'super_admin']), validate(adminSchemas.bulkUpload), adminController.bulkUploadStudents);

// Reports & Exports
router.get('/reports/export/students', authenticate, authorize(['admin', 'super_admin']), reportController.exportStudents);
router.get('/reports/export/faculty', authenticate, authorize(['admin', 'super_admin']), reportController.exportFaculty);
router.get('/reports/export/courses', authenticate, authorize(['admin', 'super_admin']), reportController.exportCourses);
router.get('/reports/export/submissions', authenticate, authorize(['admin', 'super_admin']), reportController.exportSubmissions);

// Security & Audit Logs
router.get('/audit-logs/public', securityController.getPublicAuditLogs);
router.get('/audit-logs', authenticate, authorize(['admin', 'super_admin']), securityController.getAuditLogs);
router.get('/security/waf', authenticate, authorize(['super_admin']), securityController.getBlockedIPs);
router.post('/security/waf', authenticate, authorize(['super_admin']), validate(adminSchemas.createWAF), securityController.blockIP);

// Role Permissions
router.get('/roles', authenticate, authorize(['super_admin']), securityController.getRoles);
router.patch('/roles/:id', authenticate, authorize(['super_admin']), securityController.updateRole);

// System Settings & Diagnostics
router.get('/system/db-stats', authenticate, authorize(['super_admin']), systemController.getDBStats);
router.get('/system/settings', authenticate, authorize(['super_admin']), systemController.getSettings);
router.put('/system/settings', authenticate, authorize(['super_admin']), systemController.updateSettings);

module.exports = router;
