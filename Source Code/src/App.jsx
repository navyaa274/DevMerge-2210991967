import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";

// Components
import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSpinner from "./components/common/LoadingSpinner";
import AdminLayout from "./components/AdminLayout";
import SuperAdminLayout from "./components/SuperAdminLayout";
import HODLayout from "./components/HODLayout";
import Topbar from "./components/layout/Topbar";
import UniversityLayout from "./components/layout/UniversityLayout";

// Route Configurations
import PublicRoutes from "./routes/PublicRoutes";
import StudentRoutes from "./routes/StudentRoutes";
import FacultyRoutes from "./routes/FacultyRoutes";
import HODRoutes from "./routes/HODRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";

import MainLayout from "./components/layout/MainLayout";

// Shared Protected Component
const Profile = lazy(() => import("./pages/common/Profile"));
const TwoFactorSettings = lazy(() => import("./pages/auth/TwoFactorSettings"));

/**
 * ProtectedRoute Component
 * Handles authentication and role-based access control
 */
const ProtectedRoute = ({
  children,
  requiredRole,
  layout: Layout = UniversityLayout,
}) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const content = Layout ? <Layout>{children}</Layout> : children;

  return <Suspense fallback={<LoadingSpinner />}>{content}</Suspense>;
};

const App = () => {
  // Global error handler for uncaught errors
  useEffect(() => {
    const handleError = (event) => {
      const error = event.error;
      console.error("=== GLOBAL ERROR ===");
      console.error("Error object:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      console.error("Error toString:", error?.toString());
      console.error(
        "Full error:",
        JSON.stringify(error, Object.getOwnPropertyNames(error)),
      );
    };

    const handleUnhandledRejection = (event) => {
      // Ignore Monaco Editor cancellation errors (expected behavior)
      if (event.reason?.type === "cancelation") {
        event.preventDefault();
        return;
      }

      console.error("=== UNHANDLED REJECTION ===");
      console.error("Rejection reason:", event.reason);
      console.error("Rejection type:", typeof event.reason);
      console.error("Rejection message:", event.reason?.message);
      console.error("Rejection stack:", event.reason?.stack);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return (
    <ErrorBoundary>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-300">
          <Routes>
            {/* Public Routes (No Navbar/Layout) */}
            {PublicRoutes}

            {/* Shared Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute
                  requiredRole={[
                    "student",
                    "faculty",
                    "admin",
                    "hod",
                    "super_admin",
                  ]}
                >
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/security"
              element={
                <ProtectedRoute
                  requiredRole={["student", "faculty", "admin", "super_admin"]}
                >
                  <TwoFactorSettings />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            {StudentRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.props.path}
                element={
                  <ProtectedRoute 
                    requiredRole={["student"]}
                    layout={MainLayout}
                  >
                    {route.props.element}
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Faculty Routes */}
            {FacultyRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.props.path}
                element={
                  <ProtectedRoute 
                    requiredRole={["faculty", "admin"]}
                    layout={MainLayout}
                  >
                    {route.props.element}
                  </ProtectedRoute>
                }
              />
            ))}

            {/* HOD Routes */}
            {HODRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.props.path}
                element={
                  <ProtectedRoute
                    requiredRole={["hod", "admin"]}
                    layout={HODLayout}
                  >
                    {route.props.element}
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Admin Routes with Layout */}
            {AdminRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.props.path}
                element={
                  <ProtectedRoute requiredRole={["admin"]}>
                    {route.props.element}
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Super Admin Routes with Layout */}
            {SuperAdminRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.props.path}
                element={
                  <ProtectedRoute requiredRole={["super_admin"]}>
                    {route.props.element}
                  </ProtectedRoute>
                }
              />
            ))}
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
