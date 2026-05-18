import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy load admin pages
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminAcademicCalendar = lazy(() => import('../pages/admin/AcademicCalendar'));
const AdminReportsCenter = lazy(() => import('../pages/admin/ReportsCenter'));
const AdminWebhooks = lazy(() => import('../pages/admin/Webhooks'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const AdminAPIManagement = lazy(() => import('../pages/admin/APIManagement'));
const AdminSettings = lazy(() => import('../pages/admin/Settings'));
const AdminBulkOperations = lazy(() => import('../pages/admin/BulkOperations'));
const AdminAnnouncements = lazy(() => import('../pages/admin/Announcements'));
const AdminDepartments = lazy(() => import('../pages/admin/Departments'));
const AdminPrograms = lazy(() => import('../pages/admin/Programs'));
const AdminAcademicYears = lazy(() => import('../pages/admin/AcademicYears'));
const AdminSections = lazy(() => import('../pages/admin/Sections'));
const AdminEnrollments = lazy(() => import('../pages/admin/Enrollments'));
const AdminSemesters = lazy(() => import('../pages/admin/Semesters'));
const AdminReportBuilder = lazy(() => import('../pages/admin/ReportBuilder'));
const AdminScheduledReports = lazy(() => import('../pages/admin/ScheduledReports'));
const AdminDataVisualization = lazy(() => import('../pages/admin/DataVisualization'));
const AdminIntegrations = lazy(() => import('../pages/admin/Integrations'));
const PerformanceDashboard = lazy(() => import('../pages/admin/PerformanceDashboard'));
const AnomalyDetection = lazy(() => import('../pages/admin/AnomalyDetection'));
const RealtimeDashboard = lazy(() => import('../pages/admin/RealtimeDashboard'));
const TrendAnalysis = lazy(() => import('../pages/admin/TrendAnalysis'));
const AdminModeration = lazy(() => import('../pages/admin/Moderation'));
const ProgramOutcomes = lazy(() => import('../pages/hod/ProgramOutcomes'));
const AnalyticsDashboard = lazy(() => import('../pages/admin/AnalyticsDashboard'));
const Profile = lazy(() => import('../pages/common/Profile'));

const AdminRoutes = [
    <Route key="admin-dashboard" path="/admin/dashboard" element={<AdminDashboard />} />,
    <Route key="admin-calendar" path="/admin/calendar" element={<AdminAcademicCalendar />} />,
    <Route key="admin-reports" path="/admin/reports" element={<AdminReportsCenter />} />,
    <Route key="admin-webhooks" path="/admin/webhooks" element={<AdminWebhooks />} />,
    <Route key="admin-audit-logs" path="/admin/audit-logs" element={<AdminAuditLogs />} />,
    <Route key="admin-api-keys" path="/admin/api-keys" element={<AdminAPIManagement />} />,
    <Route key="admin-settings" path="/admin/settings" element={<AdminSettings />} />,
    <Route key="admin-bulk" path="/admin/bulk-operations" element={<AdminBulkOperations />} />,
    <Route key="admin-announcements" path="/admin/announcements" element={<AdminAnnouncements />} />,
    <Route key="admin-departments" path="/admin/departments" element={<AdminDepartments />} />,
    <Route key="admin-programs" path="/admin/programs" element={<AdminPrograms />} />,
    <Route key="admin-academic-years" path="/admin/academic-years" element={<AdminAcademicYears />} />,
    <Route key="admin-sections" path="/admin/sections" element={<AdminSections />} />,
    <Route key="admin-enrollments" path="/admin/enrollments" element={<AdminEnrollments />} />,
    <Route key="admin-semesters" path="/admin/semesters" element={<AdminSemesters />} />,
    <Route key="admin-report-builder" path="/admin/report-builder" element={<AdminReportBuilder />} />,
    <Route key="admin-scheduled-reports" path="/admin/scheduled-reports" element={<AdminScheduledReports />} />,
    <Route key="admin-data-vis" path="/admin/data-visualization" element={<AdminDataVisualization />} />,
    <Route key="admin-integrations" path="/admin/integrations" element={<AdminIntegrations />} />,
    <Route key="admin-performance" path="/admin/performance" element={<PerformanceDashboard />} />,
    <Route key="admin-anomaly" path="/admin/anomaly-detection" element={<AnomalyDetection />} />,
    <Route key="admin-realtime" path="/admin/realtime-dashboard" element={<RealtimeDashboard />} />,
    <Route key="admin-trend" path="/admin/trend-analysis" element={<TrendAnalysis />} />,
    <Route key="admin-moderation" path="/admin/moderation" element={<AdminModeration />} />,
    <Route key="admin-po" path="/admin/program-outcomes" element={<ProgramOutcomes />} />,
    <Route key="admin-analytics" path="/admin/analytics" element={<AnalyticsDashboard />} />
];

export default AdminRoutes;
