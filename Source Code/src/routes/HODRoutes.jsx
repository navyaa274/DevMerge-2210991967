import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy load HOD pages
const HODDashboard = lazy(() => import('../pages/hod/Dashboard'));
const HODDepartments = lazy(() => import('../pages/hod/Departments'));
const HODPrograms = lazy(() => import('../pages/hod/Programs'));
const HODCourses = lazy(() => import('../pages/hod/Courses'));
const HODSections = lazy(() => import('../pages/hod/Sections'));
const HODFacultyLoad = lazy(() => import('../pages/hod/FacultyLoad'));
const HODAnalytics = lazy(() => import('../pages/hod/Analytics'));
const HODManageFaculty = lazy(() => import('../pages/hod/ManageFaculty'));
const HODAccreditation = lazy(() => import('../pages/hod/Accreditation'));
const ProgramOutcomes = lazy(() => import('../pages/hod/ProgramOutcomes'));
const HODAuditLogs = lazy(() => import('../pages/hod/AuditLogs'));
const HODContests = lazy(() => import('../pages/hod/Contests'));
const HODGamificationOverride = lazy(() => import('../pages/hod/GamificationOverride'));
const HODCopilot = lazy(() => import('../pages/hod/HODCopilot'));
const HODPredictiveRadar = lazy(() => import('../pages/hod/PredictiveRadar'));
const HODSkillMatrix = lazy(() => import('../pages/hod/SkillMatrix'));
const HODIntegrityHeatmap = lazy(() => import('../pages/hod/IntegrityHeatmap'));
const HODResourceOptimizer = lazy(() => import('../pages/hod/ResourceOptimizer'));
const HODResearchGrants = lazy(() => import('../pages/hod/ResearchGrants'));
const HODAlumniBridge = lazy(() => import('../pages/hod/AlumniBridge'));
const HODGlobalBroadcast = lazy(() => import('../pages/hod/GlobalBroadcast'));
const HODPolicyEngine = lazy(() => import('../pages/hod/PolicyEngine'));
const HODSentimentAnalyzer = lazy(() => import('../pages/hod/SentimentAnalyzer'));

const HODRoutes = [
    <Route key="hod-dashboard" path="/hod/dashboard" element={<HODDashboard />} />,
    <Route key="hod-programs" path="/hod/programs" element={<HODPrograms />} />,
    <Route key="hod-courses" path="/hod/courses" element={<HODCourses />} />,
    <Route key="hod-departments" path="/hod/departments" element={<HODDepartments />} />,
    <Route key="hod-sections" path="/hod/sections" element={<HODSections />} />,
    <Route key="hod-faculty-load" path="/hod/faculty-load" element={<HODFacultyLoad />} />,
    <Route key="hod-analytics" path="/hod/analytics" element={<HODAnalytics />} />,
    <Route key="hod-faculty" path="/hod/faculty" element={<HODManageFaculty />} />,
    <Route key="hod-accreditation" path="/hod/accreditation" element={<HODAccreditation />} />,
    <Route key="hod-po" path="/hod/program-outcomes" element={<ProgramOutcomes />} />,
    <Route key="hod-audit-logs" path="/hod/audit-logs" element={<HODAuditLogs />} />,
    <Route key="hod-contests" path="/hod/contests" element={<HODContests />} />,
    <Route key="hod-gamification-override" path="/hod/gamification-override" element={<HODGamificationOverride />} />,
    <Route key="hod-copilot" path="/hod/copilot" element={<HODCopilot />} />,
    <Route key="hod-predictive-radar" path="/hod/predictive-radar" element={<HODPredictiveRadar />} />,
    <Route key="hod-skill-matrix" path="/hod/skill-matrix" element={<HODSkillMatrix />} />,
    <Route key="hod-integrity-heatmap" path="/hod/integrity-heatmap" element={<HODIntegrityHeatmap />} />,
    <Route key="hod-resource-optimizer" path="/hod/resource-optimizer" element={<HODResourceOptimizer />} />,
    <Route key="hod-research-grants" path="/hod/research-grants" element={<HODResearchGrants />} />,
    <Route key="hod-alumni-bridge" path="/hod/alumni-bridge" element={<HODAlumniBridge />} />,
    <Route key="hod-global-broadcast" path="/hod/global-broadcast" element={<HODGlobalBroadcast />} />,
    <Route key="hod-policy-engine" path="/hod/policy-engine" element={<HODPolicyEngine />} />,
    <Route key="hod-sentiment-analyzer" path="/hod/sentiment-analyzer" element={<HODSentimentAnalyzer />} />
];

export default HODRoutes;
