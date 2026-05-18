const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const studentController = require('../../controllers/student/studentController');

// Student Profile Management
router.get('/profile/overview', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getProfileOverview);
router.get('/profile/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getStudentProfile);
router.put('/profile/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.updateStudentProfile);

// Student Academics
router.get('/academics/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getStudentAcademics);
router.get('/current-semester/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getCurrentSemester);

// Course Management
router.get('/courses/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getEnrolledCourses);
router.get('/available-courses/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getAvailableCourses);
router.get('/course/:courseId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getCourseDetails);
router.post('/course-registration', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.registerForCourse);
router.delete('/course-registration/:studentId/:courseId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.dropCourse);

// Assignment Management
router.get('/assignments/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getAssignments);
router.get('/assignment/:assignmentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getAssignmentDetails);
router.post('/assignment/:assignmentId/submit', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.submitAssignment);

// Grades
router.get('/grades/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getGrades);
router.get('/gpa/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getGPA);
router.get('/transcript/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getTranscript);

// Attendance
router.get('/attendance/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getAttendanceRecords);
router.get('/attendance-summary/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getAttendanceSummary);

// Exams
router.get('/exams/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getExams);
router.get('/exam/:examId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getExamDetails);
router.get('/exam-results/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getExamResults);

// Schedule & Timetable
router.get('/timetable/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getTimetable);
router.get('/today-schedule/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getTodaySchedule);

// Notifications & Announcements
router.get('/notifications/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getNotifications);
router.put('/notifications/:notificationId/read', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.markNotificationRead);
router.get('/announcements/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getAnnouncements);

// Leave Management
router.get('/leave/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getLeaveRequests);
router.post('/leave/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.submitLeaveRequest);

// Academic Progress & Performance
router.get('/academic-progress/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getAcademicProgress);
router.get('/performance/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getPerformanceAnalytics);

// Financial Management
router.get('/fees/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getFeeStructure);
router.get('/payment-history/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getPaymentHistory);
router.post('/payment', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.makePayment);

// Scholarships
router.get('/scholarships/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getScholarships);
router.post('/scholarships/:studentId/apply', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.applyForScholarship);

// Gamification & Achievements
router.get('/achievements/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getAchievements);
router.get('/points/:studentId', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getUserPoints);
router.get('/leaderboard', authenticate, authorize(['student', 'admin', 'super_admin']), studentController.getLeaderboard);

// Test route (no auth required)
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Student routes are working!' });
});

module.exports = router;
