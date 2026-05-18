import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

// Lazy load public pages
const Home = lazy(() => import('../pages/public/Home'));
const About = lazy(() => import('../pages/public/About'));
const Contact = lazy(() => import('../pages/public/Contact'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const VerifyEmail = lazy(() => import('../pages/auth/VerifyEmail'));
const OTPVerification = lazy(() => import('../pages/auth/OTPVerification'));
const TwoFactorSetup = lazy(() => import('../pages/auth/TwoFactorSetup'));
const TwoFactorVerify = lazy(() => import('../pages/auth/TwoFactorVerify'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const CourseCatalog = lazy(() => import('../pages/Landing/CourseCatalog'));
const NotFound = lazy(() => import('../pages/NotFound'));

const PublicRoutes = [
    <Route key="home" path="/" element={<Home />} />,
    <Route key="about" path="/about" element={<About />} />,
    <Route key="contact" path="/contact" element={<Contact />} />,
    <Route key="login" path="/login" element={<Login />} />,
    <Route key="register" path="/register" element={<Register />} />,
    <Route key="verify-email" path="/verify-email/:token" element={<VerifyEmail />} />,
    <Route key="verify-otp" path="/verify-otp" element={<OTPVerification />} />,
    <Route key="setup-2fa" path="/setup-2fa" element={<TwoFactorSetup />} />,
    <Route key="verify-2fa" path="/verify-2fa" element={<TwoFactorVerify />} />,
    <Route key="forgot-password" path="/forgot-password" element={<ForgotPassword />} />,
    <Route key="reset-password" path="/reset-password/:token" element={<ResetPassword />} />,
    <Route key="course-catalog" path="/programs" element={<CourseCatalog />} />
];

export default PublicRoutes;
