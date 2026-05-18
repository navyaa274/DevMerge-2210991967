const express = require('express');
const {
  authenticate,
  validateRefreshToken,
  authLimiter,
  loginLimiter
} = require('../../middleware/auth');
const authController = require('../../controllers/auth/authController');
const profileController = require('../../controllers/auth/profileController');
const passwordController = require('../../controllers/auth/passwordController');
const twoFactorController = require('../../controllers/auth/twoFactorController');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('../../security/jwt');

// Dedicated OTP rate limiter: max 3 attempts / 15 min per IP
const otpLimiter = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: { message: "Too many OTP attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
  })(req, res, next);
};

const router = express.Router();

// Registration & Email Verification
router.post('/register', authLimiter, authController.register);
router.post('/verify-email', authLimiter, authController.verifyEmail);

// Login & Session Management
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', validateRefreshToken, authController.refresh);
router.post('/logout', authenticate, authController.logout);

// Password Management
router.post('/forgot-password', authLimiter, passwordController.forgotPassword);
router.post('/reset-password', authLimiter, passwordController.resetPassword);

// Profile & Settings
router.get('/me', authenticate, profileController.getMe);
router.put('/profile', authenticate, profileController.updateProfile);
router.put('/change-password', authenticate, profileController.changePassword);
router.get('/settings', authenticate, profileController.getSettings);
router.put('/settings', authenticate, profileController.updateSettings);

// OTP Routes
router.post('/otp/send-otp', otpLimiter, authController.sendOtp);
router.post('/otp/verify-otp', otpLimiter, authController.verifyOtp);
router.post('/otp/resend-otp', otpLimiter, authController.resendOtp);

// Two-Factor Authentication Routes
router.post('/two-factor/enable', verifyToken, twoFactorController.enable2FA);
router.post('/two-factor/verify', verifyToken, twoFactorController.verifyAndEnable2FA);
router.post('/two-factor/disable', verifyToken, twoFactorController.disable2FA);
router.post('/two-factor/login-verify', twoFactorController.loginVerify2FA);
router.get('/two-factor/status', verifyToken, twoFactorController.get2FAStatus);

module.exports = router;
