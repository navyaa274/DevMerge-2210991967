import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy load faculty pages
const GradingHub = lazy(() => import('../pages/faculty/GradingHub'));
const FacultyCodeReview = lazy(() => import('../pages/faculty/CodeReview'));
const FacultyMaterials = lazy(() => import('../pages/faculty/Materials'));
const FacultyGrading = lazy(() => import('../pages/faculty/Grading'));
const FacultyAnalytics = lazy(() => import('../pages/faculty/Analytics'));
const FacultyDashboard = lazy(() => import('../pages/faculty/Dashboard'));
const FacultyCourses = lazy(() => import('../pages/faculty/Courses'));
const FacultyStudents = lazy(() => import('../pages/faculty/Students'));
const FacultyStudentsList = lazy(() => import('../pages/faculty/StudentsList'));
const FacultyAssessments = lazy(() => import('../pages/faculty/Assessments'));
const FacultyCreateAssignment = lazy(() => import('../pages/faculty/CreateAssignment'));
const FacultyViewSubmissions = lazy(() => import('../pages/faculty/ViewSubmissions'));
const FacultyPlagiarismReports = lazy(() => import('../pages/faculty/PlagiarismReports'));
const FacultyCreateExam = lazy(() => import('../pages/faculty/CreateExam'));
const FacultyRunContest = lazy(() => import('../pages/faculty/RunContest'));
const ContestDetails = lazy(() => import('../pages/faculty/ContestDetails'));
const ContestLeaderboard = lazy(() => import('../pages/faculty/ContestLeaderboard'));
const FacultyCreateCourse = lazy(() => import('../pages/faculty/CreateCourse'));
const FacultyCreateProblem = lazy(() => import('../pages/faculty/CreateProblem'));
const FacultyGenerateProblems = lazy(() => import('../pages/faculty/GenerateProblems'));
const FacultyUltimateProblemGenerator = lazy(() => import('../pages/faculty/UltimateProblemGenerator'));
const FacultyUltimateLabGenerator = lazy(() => import('../pages/faculty/UltimateLabGenerator'));
const FacultyCopilotHub = lazy(() => import('../pages/faculty/CopilotHub'));
const LabManuals = lazy(() => import('../pages/faculty/LabManuals'));
const LabManualDetail = lazy(() => import('../pages/faculty/LabManualDetail'));
const FacultyAttendance = lazy(() => import('../pages/faculty/Attendance'));
const Profile = lazy(() => import('../pages/common/Profile'));
const ZeroDayQuest = lazy(() => import('../pages/faculty/ZeroDayQuest'));
const CognitiveVisualizer = lazy(() => import('../pages/faculty/CognitiveVisualizer'));
const AutoGraderOverride = lazy(() => import('../pages/faculty/AutoGraderOverride'));
const SmartCohort = lazy(() => import('../pages/faculty/SmartCohort'));

const FacultyRoutes = [
    <Route key="faculty-dashboard" path="/faculty/dashboard" element={<FacultyDashboard />} />,
    <Route key="faculty-courses" path="/faculty/courses" element={<FacultyCourses />} />,
    <Route key="faculty-course-detail-alias" path="/faculty/courses/:courseId" element={<FacultyMaterials />} />,
    <Route key="faculty-course-create-alias" path="/faculty/courses/create" element={<FacultyCreateCourse />} />,
    <Route key="faculty-students-list" path="/faculty/students" element={<FacultyStudentsList />} />,
    <Route key="faculty-students" path="/faculty/students/:courseId" element={<FacultyStudents />} />,
    <Route key="faculty-assessments" path="/faculty/assessments" element={<FacultyAssessments />} />,
    <Route key="faculty-materials" path="/faculty/materials/:courseId" element={<FacultyMaterials />} />,
    <Route key="faculty-copilot" path="/faculty/copilot/:courseId" element={<FacultyCopilotHub />} />,
    <Route key="faculty-create-assignment" path="/faculty/create-assignment" element={<FacultyCreateAssignment />} />,
    <Route key="faculty-create-course" path="/faculty/create-course" element={<FacultyCreateCourse />} />,
    <Route key="faculty-create-problem" path="/faculty/create-problem" element={<FacultyCreateProblem />} />,
    <Route key="faculty-generate-problems" path="/faculty/generate-problems" element={<FacultyGenerateProblems />} />,
    <Route key="faculty-ultimate-problem" path="/faculty/ultimate-problem-generator" element={<FacultyUltimateProblemGenerator />} />,
    <Route key="faculty-ultimate-lab" path="/faculty/ultimate-lab-generator" element={<FacultyUltimateLabGenerator />} />,
    <Route key="faculty-lab-manuals" path="/faculty/lab-manuals" element={<LabManuals />} />,
    <Route key="faculty-lab-manual-detail" path="/faculty/lab-manuals/:id" element={<LabManualDetail />} />,
    <Route key="faculty-submissions" path="/faculty/submissions/:assignmentId" element={<FacultyViewSubmissions />} />,
    <Route key="faculty-plagiarism" path="/faculty/plagiarism-reports" element={<FacultyPlagiarismReports />} />,
    <Route key="faculty-create-exam" path="/faculty/create-exam" element={<FacultyCreateExam />} />,
    <Route key="faculty-contests" path="/faculty/run-contest" element={<FacultyRunContest />} />,
    <Route key="faculty-contest-details" path="/faculty/contest/:id" element={<ContestDetails />} />,
    <Route key="faculty-contest-leaderboard" path="/faculty/contest/:id/leaderboard" element={<ContestLeaderboard />} />,
    <Route key="faculty-grading-hub" path="/faculty/grading" element={<GradingHub />} />,
    <Route key="faculty-grading-direct" path="/faculty/grading/:assignmentId" element={<FacultyGrading />} />,
    <Route key="faculty-copilot-hub" path="/faculty/copilot-hub" element={<FacultyCopilotHub />} />,
    <Route key="faculty-analytics" path="/faculty/analytics" element={<FacultyAnalytics />} />,
    <Route key="faculty-code-review" path="/faculty/code-review" element={<FacultyCodeReview />} />,
    <Route key="faculty-attendance" path="/faculty/attendance" element={<FacultyAttendance />} />,
    <Route key="faculty-zero-day" path="/faculty/zero-day-quest" element={<ZeroDayQuest />} />,
    <Route key="faculty-cognitive-visualizer" path="/faculty/cognitive-visualizer" element={<CognitiveVisualizer />} />,
    <Route key="faculty-auto-grader-override" path="/faculty/auto-grader-override" element={<AutoGraderOverride />} />,
    <Route key="faculty-smart-cohort" path="/faculty/smart-cohort" element={<SmartCohort />} />
];

export default FacultyRoutes;
