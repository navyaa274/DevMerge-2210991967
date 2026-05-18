const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");

const quizController = require("../../controllers/assessment/quizController");
const submissionController = require("../../controllers/assessment/submissionController");
const codeEditorController = require("../../controllers/assessment/codeEditorController");
const badgeController = require("../../controllers/learning/badgeController");
const courseModulesController = require("../../controllers/assessment/courseModulesController");
const lessonsController = require("../../controllers/assessment/lessonsController");
const lessonProgressController = require("../../controllers/assessment/lessonProgressController");
const courseProgressController = require("../../controllers/assessment/courseProgressController");
const forumController = require("../../controllers/assessment/forumController");
const announcementController = require("../../controllers/assessment/announcementController");
const messagingController = require("../../controllers/assessment/messagingController");
const questionBankController = require("../../controllers/assessment/questionBankController");
const roleController = require("../../controllers/assessment/roleController");
const plagiarismController = require("../../controllers/assessment/plagiarismController");
const aiController = require("../../controllers/assessment/aiController");
const predictiveController = require("../../controllers/assessment/predictiveController");

router.get("/quizzes", authenticate, quizController.getAllQuizzes);
router.get("/quizzes/:id", authenticate, quizController.getQuizById);
router.post(
  "/quizzes",
  authenticate,
  authorize(["faculty", "admin"]),
  quizController.createQuiz,
);
router.put(
  "/quizzes/:id",
  authenticate,
  authorize(["faculty", "admin"]),
  quizController.updateQuiz,
);
router.delete(
  "/quizzes/:id",
  authenticate,
  authorize(["faculty", "admin"]),
  quizController.deleteQuiz,
);
router.post(
  "/quizzes/:id/publish",
  authenticate,
  authorize(["faculty", "admin"]),
  quizController.publishQuiz,
);
router.post(
  "/quizzes/:id/submit",
  authenticate,
  authorize(["student"]),
  quizController.submitQuiz,
);

// Dashboard & Problem specific submission routes (must be above /submissions/:id)
router.get(
  "/submissions/problem/all/my",
  authenticate,
  submissionController.getMyAllSubmissions,
);

router.get(
  "/submissions/problem/:problemId",
  authenticate,
  submissionController.getProblemSubmissions,
);

router.get(
  "/submissions/problem/:problemId/my",
  authenticate,
  submissionController.getMyProblemSubmissions,
);

router.get(
  "/submissions/user/:userId",
  authenticate,
  submissionController.getUserSubmissions,
);

router.get(
  "/submissions/course/:courseId",
  authenticate,
  submissionController.getSubmissionsByCourse,
);

router.get(
  "/submissions",
  authenticate,
  submissionController.getAllSubmissions,
);

router.post(
  "/submissions",
  authenticate,
  submissionController.createSubmission,
);

router.get(
  "/submissions/:id",
  authenticate,
  submissionController.getSubmissionById,
);

router.put(
  "/submissions/:id/status",
  authenticate,
  authorize(["system"]),
  submissionController.updateSubmissionStatus,
);

router.post(
  "/code-editor/sessions",
  authenticate,
  codeEditorController.createSession,
);
router.get(
  "/code-editor/sessions/:id",
  authenticate,
  codeEditorController.getSession,
);
router.put(
  "/code-editor/sessions/:id",
  authenticate,
  codeEditorController.updateCode,
);
router.get(
  "/code-editor/sessions/user/:userId",
  authenticate,
  codeEditorController.getUserSessions,
);
router.post(
  "/code-editor/sessions/:id/close",
  authenticate,
  codeEditorController.closeSession,
);
router.post(
  "/code-editor/sessions/:id/snapshot",
  authenticate,
  codeEditorController.saveSnapshot,
);

router.get("/badges", authenticate, badgeController.getAllBadges);
router.get("/badges/:id", authenticate, badgeController.getBadgeById);
router.post(
  "/badges",
  authenticate,
  authorize(["admin"]),
  badgeController.createBadge,
);
router.put(
  "/badges/:id",
  authenticate,
  authorize(["admin"]),
  badgeController.updateBadge,
);
router.delete(
  "/badges/:id",
  authenticate,
  authorize(["admin"]),
  badgeController.deleteBadge,
);
router.post(
  "/badges/award",
  authenticate,
  authorize(["faculty", "admin"]),
  badgeController.awardBadge,
);
router.get("/badges/user/:userId", authenticate, badgeController.getUserBadges);

// Course Modules Routes
router.post(
  "/courses/:courseId/modules",
  authenticate,
  authorize(["faculty", "admin"]),
  courseModulesController.createModule
);
router.get(
  "/courses/:courseId/modules",
  authenticate,
  courseModulesController.getCourseModules
);
router.get(
  "/modules/:moduleId",
  authenticate,
  courseModulesController.getModuleById
);
router.put(
  "/modules/:moduleId",
  authenticate,
  authorize(["faculty", "admin"]),
  courseModulesController.updateModule
);
router.delete(
  "/modules/:moduleId",
  authenticate,
  authorize(["faculty", "admin"]),
  courseModulesController.deleteModule
);
router.put(
  "/courses/:courseId/modules/reorder",
  authenticate,
  authorize(["faculty", "admin"]),
  courseModulesController.reorderModules
);

// Lessons Routes
router.post(
  "/modules/:moduleId/lessons",
  authenticate,
  authorize(["faculty", "admin"]),
  lessonsController.createLesson
);
router.get(
  "/modules/:moduleId/lessons",
  authenticate,
  lessonsController.getModuleLessons
);
router.get(
  "/lessons/:lessonId",
  authenticate,
  lessonsController.getLessonById
);
router.put(
  "/lessons/:lessonId",
  authenticate,
  authorize(["faculty", "admin"]),
  lessonsController.updateLesson
);
router.delete(
  "/lessons/:lessonId",
  authenticate,
  authorize(["faculty", "admin"]),
  lessonsController.deleteLesson
);
router.put(
  "/modules/:moduleId/lessons/reorder",
  authenticate,
  authorize(["faculty", "admin"]),
  lessonsController.reorderLessons
);

// Lesson Progress Routes
router.post(
  "/lessons/:lessonId/complete",
  authenticate,
  lessonProgressController.completeLesson
);
router.get(
  "/lessons/:lessonId/progress",
  authenticate,
  lessonProgressController.getLessonProgress
);
router.get(
  "/courses/:courseId/progress/lessons",
  authenticate,
  lessonProgressController.getUserLessonProgress
);

// Course Progress Routes
router.get(
  "/users/:userId/progress",
  authenticate,
  courseProgressController.getUserProgress
);
router.get(
  "/courses/:courseId/progress",
  authenticate,
  courseProgressController.getCourseProgress
);
router.put(
  "/courses/:courseId/progress/position",
  authenticate,
  courseProgressController.updateCurrentPosition
);
router.get(
  "/courses/:courseId/progress/stats",
  authenticate,
  authorize(["faculty", "admin"]),
  courseProgressController.getCourseProgressStats
);

// Forum Routes
router.get(
  "/courses/:courseId/forum",
  authenticate,
  forumController.getOrCreateCourseForum
);
router.put(
  "/forums/:forumId",
  authenticate,
  authorize(["faculty", "admin"]),
  forumController.updateForum
);
router.post(
  "/forums/:forumId/threads",
  authenticate,
  forumController.createThread
);
router.get(
  "/forums/:forumId/threads",
  authenticate,
  forumController.getForumThreads
);
router.get(
  "/threads/:threadId",
  authenticate,
  forumController.getThread
);
router.post(
  "/threads/:threadId/replies",
  authenticate,
  forumController.createReply
);
router.put(
  "/threads/:threadId",
  authenticate,
  forumController.updateThread
);

// Announcement Routes
router.post(
  "/courses/:courseId/announcements",
  authenticate,
  authorize(["faculty", "admin"]),
  announcementController.createAnnouncement
);
router.get(
  "/courses/:courseId/announcements",
  authenticate,
  announcementController.getCourseAnnouncements
);
router.put(
  "/announcements/:announcementId",
  authenticate,
  authorize(["faculty", "admin"]),
  announcementController.updateAnnouncement
);
router.delete(
  "/announcements/:announcementId",
  authenticate,
  authorize(["faculty", "admin"]),
  announcementController.deleteAnnouncement
);
router.post(
  "/announcements/:announcementId/read",
  authenticate,
  announcementController.markAnnouncementRead
);
router.get(
  "/courses/:courseId/announcements/stats",
  authenticate,
  authorize(["faculty", "admin"]),
  announcementController.getAnnouncementStats
);

// Messaging Routes
router.get(
  "/messages/threads",
  authenticate,
  messagingController.getUserThreads
);
router.get(
  "/messages/threads/:threadId",
  authenticate,
  messagingController.getThreadMessages
);
router.post(
  "/messages/threads",
  authenticate,
  messagingController.createThread
);
router.post(
  "/messages/threads/:threadId",
  authenticate,
  messagingController.sendMessage
);
router.put(
  "/messages/threads/:threadId/archive",
  authenticate,
  messagingController.archiveThread
);
router.get(
  "/messages/unread/count",
  authenticate,
  messagingController.getUnreadCountTotal
);

// Question Bank Routes
router.post(
  "/question-banks",
  authenticate,
  authorize(["faculty", "admin"]),
  questionBankController.createQuestionBank
);
router.get(
  "/courses/:courseId/question-banks",
  authenticate,
  questionBankController.getCourseQuestionBanks
);
router.get(
  "/question-banks/:questionBankId",
  authenticate,
  questionBankController.getQuestionBank
);
router.post(
  "/question-banks/:questionBankId/questions",
  authenticate,
  authorize(["faculty", "admin"]),
  questionBankController.createQuestion
);
router.post(
  "/question-banks/random-questions",
  authenticate,
  questionBankController.getRandomQuestions
);
router.post(
  "/quiz-attempts",
  authenticate,
  questionBankController.startQuizAttempt
);
router.post(
  "/quiz-attempts/:attemptId/answers",
  authenticate,
  questionBankController.submitQuizAnswers
);
router.get(
  "/quiz-attempts/:attemptId/results",
  authenticate,
  questionBankController.getQuizAttemptResults
);

// Role and Permission Routes
router.post(
  "/roles",
  authenticate,
  authorize(["admin", "super_admin"]),
  roleController.createRole
);
router.get(
  "/roles",
  authenticate,
  roleController.getRoles
);
router.get(
  "/roles/:roleId",
  authenticate,
  roleController.getRole
);
router.put(
  "/roles/:roleId",
  authenticate,
  authorize(["admin", "super_admin"]),
  roleController.updateRole
);
router.delete(
  "/roles/:roleId",
  authenticate,
  authorize(["admin", "super_admin"]),
  roleController.deleteRole
);
router.put(
  "/roles/:roleId/permissions",
  authenticate,
  authorize(["admin", "super_admin"]),
  roleController.updateRolePermissions
);
router.get(
  "/roles/:roleId/permissions",
  authenticate,
  roleController.getRolePermissions
);
router.post(
  "/users/:userId/roles/:roleId",
  authenticate,
  authorize(["admin", "super_admin"]),
  roleController.assignRole
);
router.delete(
  "/users/:userId/roles/:roleId",
  authenticate,
  authorize(["admin", "super_admin"]),
  roleController.removeRole
);
router.get(
  "/users/:userId/roles",
  authenticate,
  roleController.getUserRoles
);
router.post(
  "/permissions",
  authenticate,
  authorize(["super_admin"]),
  roleController.createPermission
);
router.get(
  "/permissions",
  authenticate,
  roleController.getPermissions
);

// Plagiarism Detection Routes
router.post(
  "/plagiarism/check",
  authenticate,
  plagiarismController.checkSubmission
);
router.get(
  "/plagiarism/reports",
  authenticate,
  plagiarismController.getReports
);
router.get(
  "/plagiarism/reports/:reportId",
  authenticate,
  plagiarismController.getReportById
);
router.put(
  "/plagiarism/reports/:reportId/review",
  authenticate,
  authorize(["faculty", "admin"]),
  plagiarismController.reviewReport
);

router.use("/problems", require("./problems"));
router.use("/lab-submissions", require("./lab-submissions"));
router.use("/assignment-submissions", require("./assignment-submissions"));
router.use("/plagiarism", require("./plagiarism"));
router.use("/contests", require("./contests"));
router.use("/leaderboards", require("./leaderboards"));
router.use("/code", require("./code"));
router.use("/code-lab", require("./code-lab"));
router.use("/code-editor", require("./code-editor"));
router.use("/code-review", require("./code-review"));
router.use("/peer-review", require("./peer-review"));
router.use("/quizzes", require("./quizzes"));
router.use("/attainment", require("./attainment"));

module.exports = router;
