import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy load student pages
const StudentDashboard = lazy(() => import('../pages/student/Dashboard'));
const StudentCourses = lazy(() => import('../pages/student/Courses'));
const StudentCourseDetail = lazy(() => import('../pages/student/CourseDetail'));
const StudentCalendar = lazy(() => import('../pages/student/Calendar'));
const StudentLeaderboard = lazy(() => import('../pages/student/Leaderboard'));
const StudentPortfolio = lazy(() => import('../pages/student/Portfolio'));
const StudentLabs = lazy(() => import('../pages/student/Labs'));
const StudentCodeLab = lazy(() => import('../pages/student/CodeLab'));
const LabSubmission = lazy(() => import('../pages/student/LabSubmission'));
const StudentLabManuals = lazy(() => import('../pages/student/LabManuals'));
const LabManualView = lazy(() => import('../pages/student/LabManualView'));
const StudentSubmissions = lazy(() => import('../pages/student/Submissions'));
const AssignmentSubmission = lazy(() => import('../pages/student/AssignmentSubmission'));
const SyllabusViewer = lazy(() => import('../pages/student/SyllabusViewer'));
const StudentCodeEditor = lazy(() => import('../pages/student/CodeEditor'));
const StudentAITutor = lazy(() => import('../pages/student/AITutor'));
const StudentWeaknessAnalysis = lazy(() => import('../pages/student/WeaknessAnalysis'));
const PredictiveAnalytics = lazy(() => import('../pages/student/PredictiveAnalytics'));
const Recommendations = lazy(() => import('../pages/student/Recommendations'));
const StudentNotifications = lazy(() => import('../pages/student/Notifications'));
const StudentProgress = lazy(() => import('../pages/student/Progress'));
const StudentPreferences = lazy(() => import('../pages/student/Preferences'));
const StudentInterview = lazy(() => import('../pages/student/MockInterview'));
const StudentCertificates = lazy(() => import('../pages/student/Certificates'));
const ProblemList = lazy(() => import('../pages/coding/ProblemList'));
const ProblemSolve = lazy(() => import('../pages/coding/ProblemSolve'));
const Courses = lazy(() => import('../pages/courses/Courses'));
const Exams = lazy(() => import('../pages/exams/Exams'));
const ExamPage = lazy(() => import('../pages/exams/ExamPage'));
const TwoFactorSettings = lazy(() => import('../pages/auth/TwoFactorSettings'));
const Profile = lazy(() => import('../pages/common/Profile'));
const GlobalHUDOverride = lazy(() => import('../pages/student/GlobalHUDOverride'));
const DeveloperPortfolio = lazy(() => import('../pages/student/DeveloperPortfolio'));
const SuccessPortal = lazy(() => import('../pages/student/SuccessPortal'));

const StudentRoutes = [
    <Route key="student-success-portal" path="/student/success-portal" element={<SuccessPortal />} />,
    <Route key="student-dashboard" path="/student/dashboard" element={<StudentDashboard />} />,
    <Route key="student-courses" path="/student/courses" element={<StudentCourses />} />,
    <Route key="student-course-detail" path="/student/course/:courseId" element={<StudentCourseDetail />} />,
    <Route key="student-calendar" path="/student/calendar" element={<StudentCalendar />} />,
    <Route key="student-leaderboard" path="/student/leaderboard" element={<StudentLeaderboard />} />,
    <Route key="student-portfolio" path="/student/portfolio" element={<StudentPortfolio />} />,
    <Route key="student-labs" path="/student/labs" element={<StudentLabs />} />,
    <Route key="student-lab-detail" path="/student/labs/:labId" element={<StudentCodeLab />} />,
    <Route key="student-lab-submit" path="/student/labs/:labId/submit" element={<LabSubmission />} />,
    <Route key="student-lab-manuals" path="/student/lab-manuals" element={<StudentLabManuals />} />,
    <Route key="student-lab-manual-view" path="/student/lab-manuals/:id" element={<LabManualView />} />,
    <Route key="student-submissions" path="/student/submissions" element={<StudentSubmissions />} />,
    <Route key="student-assignment" path="/student/assignments/:assignmentId" element={<AssignmentSubmission />} />,
    <Route key="student-syllabus" path="/student/syllabus/:courseId" element={<SyllabusViewer />} />,
    <Route key="student-code-editor" path="/student/code-editor" element={<StudentCodeEditor />} />,
    <Route key="student-ai-tutor" path="/student/ai-tutor" element={<StudentAITutor />} />,
    <Route key="student-weakness" path="/student/weakness-analysis" element={<StudentWeaknessAnalysis />} />,
    <Route key="student-predictive" path="/student/predictive" element={<PredictiveAnalytics />} />,
    <Route key="student-recommendations" path="/student/recommendations" element={<Recommendations />} />,
    <Route key="student-notifications" path="/student/notifications" element={<StudentNotifications />} />,
    <Route key="student-progress" path="/student/progress" element={<StudentProgress />} />,
    <Route key="student-preferences" path="/student/preferences" element={<StudentPreferences />} />,
    <Route key="student-mock-interview" path="/student/mock-interview" element={<StudentInterview />} />,
    <Route key="student-problems" path="/problems" element={<ProblemList />} />,
    <Route key="student-problem-solve" path="/problems/:id" element={<ProblemSolve />} />,
    <Route key="student-all-courses" path="/courses" element={<Courses />} />,
    <Route key="student-exams" path="/exams" element={<Exams />} />,
    <Route key="student-exam-solve" path="/exams/:id" element={<ExamPage />} />,
    <Route key="student-certificates" path="/student/certificates" element={<StudentCertificates />} />,
    <Route key="student-global-hud" path="/student/global-hud" element={<GlobalHUDOverride />} />,
    <Route key="student-developer-portfolio" path="/student/developer-portfolio" element={<DeveloperPortfolio />} />
];

export default StudentRoutes;
