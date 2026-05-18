import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy load super admin pages
const SuperAdminDashboard = lazy(() => import('../pages/super-admin/Dashboard'));
const SuperAdminSystemLogs = lazy(() => import('../pages/super-admin/SystemLogs'));
const SuperAdminUserManagement = lazy(() => import('../pages/super-admin/UserManagement'));
const SuperAdminSecurity = lazy(() => import('../pages/super-admin/SecurityCenter'));
const SuperAdminSettings = lazy(() => import('../pages/super-admin/GlobalSettings'));
const SuperAdminDatabase = lazy(() => import('../pages/super-admin/DatabaseOps'));
const SuperAdminRoles = lazy(() => import('../pages/super-admin/RoleEngine'));
const ComplianceReport = lazy(() => import('../pages/super-admin/ComplianceReport'));
const Profile = lazy(() => import('../pages/common/Profile'));

const SuperAdminRoutes = [
    <Route key="super-admin-dashboard" path="/super-admin/dashboard" element={<SuperAdminDashboard />} />,
    <Route key="super-admin-logs" path="/super-admin/system-logs" element={<SuperAdminSystemLogs />} />,
    <Route key="super-admin-users" path="/super-admin/users" element={<SuperAdminUserManagement />} />,
    <Route key="super-admin-security" path="/super-admin/security" element={<SuperAdminSecurity />} />,
    <Route key="super-admin-settings" path="/super-admin/settings" element={<SuperAdminSettings />} />,
    <Route key="super-admin-db" path="/super-admin/database" element={<SuperAdminDatabase />} />,
    <Route key="super-admin-roles" path="/super-admin/roles" element={<SuperAdminRoles />} />,
    <Route key="compliance-report" path="/super-admin/compliance-report" element={<ComplianceReport />} />
];

export default SuperAdminRoutes;
