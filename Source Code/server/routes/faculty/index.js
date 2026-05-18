const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const facultyController = require('../../controllers/faculty/facultyController');

// Faculty Profile Management
router.get('/profile/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getFacultyProfile);
router.put('/profile/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.updateFacultyProfile);

// Faculty Courses
router.get('/courses/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getFacultyCourses);
router.get('/schedule/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getFacultySchedule);
router.get('/workload/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getFacultyWorkload);
router.get('/performance/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getFacultyPerformance);

// Course Management
router.get('/course/:courseId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getCourseDetails);
router.put('/course/:courseId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.updateCourseDetails);

// Assignment Management
router.get('/assignments/:courseId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getAssignments);
router.post('/assignments', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.createAssignment);
router.put('/assignments/:assignmentId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.updateAssignment);
router.delete('/assignments/:assignmentId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.deleteAssignment);

// Smart AI Task Assignment
const facultyAssignmentController = require('../../controllers/faculty/facultyAssignmentController');
router.post('/assign-task', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyAssignmentController.assignTask);

// Student Management
router.get('/students/:courseId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getCourseStudents);
router.get('/grades/:courseId/:studentId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getStudentGrades);
router.put('/grades/:courseId/:studentId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.updateStudentGrades);

// Attendance Management
router.get('/attendance/:courseId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getAttendanceRecords);
router.post('/attendance', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.markAttendance);

// Exam Management
router.get('/exams/:courseId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getExams);
router.post('/exams', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.createExam);

// Communication
router.post('/announcements/:courseId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.sendCourseAnnouncement);
router.get('/announcements/:courseId', authenticate, authorize(['faculty', 'admin', 'super_admin', 'student']), facultyController.getCourseAnnouncements);

// Notifications
router.get('/notifications/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getNotifications);
router.put('/notifications/:notificationId/read', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.markNotificationRead);

// Office Hours
router.get('/office-hours/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.getOfficeHours);
router.put('/office-hours/:facultyId', authenticate, authorize(['faculty', 'admin', 'super_admin']), facultyController.updateOfficeHours);

// Cognitive Visualizer & Advanced Analytics
const facultyDashboardController = require('../../controllers/faculty/facultyDashboardController');
router.get('/dashboard/:courseId/insights', authenticate, authorize(['faculty', 'admin']), facultyDashboardController.getGlobalInsights);
router.get('/dashboard/:courseId/calibration', authenticate, authorize(['faculty', 'admin']), facultyDashboardController.getCalibration);
router.get('/dashboard/:courseId/synergy', authenticate, authorize(['faculty', 'admin']), facultyDashboardController.getSynergyGroups);

// Zero-Day Quests
const questController = require('../../controllers/faculty/questController');
router.post('/quests/deploy', authenticate, authorize(['faculty']), questController.deployQuest);
router.get('/quests/history', authenticate, authorize(['faculty']), questController.getHistory);
router.get('/quests/check', authenticate, authorize(['faculty']), questController.checkAvailability);

module.exports = router;
