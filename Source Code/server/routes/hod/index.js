const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const hodController = require('../../controllers/hod/hodController');

// HOD (Head of Department) Routes
router.get('/department-stats', authenticate, authorize(['hod', 'admin']), hodController.getDepartmentStats);
router.get('/faculty-load', authenticate, authorize(['hod', 'admin']), hodController.getFacultyLoad);

// Department Settings
router.get('/department-settings/:departmentId', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.getDepartmentSettings);
router.put('/department-settings/:departmentId', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.updateDepartmentSettings);

// Department Management CRUD
router.get('/departments', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.getDepartments);
router.post('/departments', authenticate, authorize(['admin', 'super_admin']), hodController.createDepartment);
router.put('/departments/:departmentId', authenticate, authorize(['admin', 'super_admin']), hodController.updateDepartment);
router.delete('/departments/:departmentId', authenticate, authorize(['admin', 'super_admin']), hodController.deleteDepartment);

// Program Management CRUD
router.get('/programs', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.getPrograms);
router.post('/programs', authenticate, authorize(['admin', 'super_admin']), hodController.createProgram);
router.put('/programs/:programId', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.updateProgram);
router.delete('/programs/:programId', authenticate, authorize(['admin', 'super_admin']), hodController.deleteProgram);

// Course Management CRUD
router.get('/courses', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.getCourses);
router.post('/courses', authenticate, authorize(['admin', 'super_admin']), hodController.createCourse);
router.put('/courses/:courseId', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.updateCourse);
router.delete('/courses/:courseId', authenticate, authorize(['admin', 'super_admin']), hodController.deleteCourse);

// Section Management CRUD
router.get('/sections', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.getSections);
router.post('/sections', authenticate, authorize(['admin', 'super_admin']), hodController.createSection);
router.put('/sections/:sectionId', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.updateSection);
router.delete('/sections/:sectionId', authenticate, authorize(['admin', 'super_admin']), hodController.deleteSection);
router.post('/sections/auto-assign', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.autoAssignStudents);

// Audit Logs
router.get('/audit-logs', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.getAuditLogs);
router.get('/audit-statistics', authenticate, authorize(['hod', 'admin', 'super_admin']), hodController.getAuditStatistics);

router.get('/course-approvals', authenticate, authorize(['hod', 'admin']), hodController.getCourseApprovals);
router.post('/faculty-assignment', authenticate, authorize(['hod', 'admin']), hodController.assignFaculty);

// Global Broadcast
router.get('/broadcast-stats', authenticate, authorize(['hod', 'admin']), hodController.getBroadcastStats);
router.post('/broadcast', authenticate, authorize(['hod', 'admin']), hodController.broadcast);

router.get('/broadcast-history', authenticate, authorize(['hod', 'admin']), hodController.getBroadcastHistory);

// Gamification Overrides
router.get('/gamification-config', authenticate, authorize(['hod', 'admin']), hodController.getGamificationConfig);
router.post('/gamification-multiplier', authenticate, authorize(['hod', 'admin']), hodController.updateGamificationMultiplier);

module.exports = router;
