const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../../models/auth/User');
const emailService = require('../../utils/emailService');
const validation = require('../../utils/validation');

/**
 * Register a new user
 * @access Public
 */
exports.register = async (req, res) => {
    try {
        // Validate input
        const { error } = validation.validateRegistration(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const { firstName, lastName, email, password, role, department, programId } = req.body;

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email address',
                code: 'USER_EXISTS'
            });
        }

        // Create email verification token
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create new user
        const user = new User({
            firstName,
            lastName,
            email,
            password,
            role: role || 'student',
            department,
            programId,
            emailVerificationToken,
            emailVerificationExpires
        });

        await user.save();

        // Send verification email
        const verificationUrl = `${process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;
        try {
            await emailService.sendEmail({
                to: email,
                subject: 'Verify Your Email - AI University Platform',
                template: 'email-verification',
                data: {
                    firstName,
                    platformName: 'AI University Platform',
                    tagline: 'Empowering Education with AI',
                    greetingMessage: 'Thank you for registering with AI University Platform.',
                    message: 'Please verify your email address by clicking the button below to complete your registration.',
                    actionUrl: verificationUrl,
                    actionText: 'Verify Email',
                    highlightText: 'This verification link will expire in 24 hours.',
                    additionalInfo: '<p>If you did not create this account, please ignore this email.</p>'
                }
            });
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        // Generate tokens
        const authToken = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token
        await user.addRefreshToken(
            refreshToken,
            req.get('User-Agent') || 'Unknown Device',
            req.ip,
            req.get('User-Agent') || 'Unknown Device'
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email for verification.',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    isEmailVerified: user.isEmailVerified,
                    profilePicture: user.profilePicture
                },
                tokens: {
                    authToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            code: 'REGISTRATION_ERROR'
        });
    }
};

/**
 * Login user
 * @access Public
 */
exports.login = async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            // Development mode - mock login
            const { email, password } = req.body;
            
            // Simple mock validation
            if (email && password) {
                const mockUser = {
                    _id: 'dev_user_123',
                    firstName: 'Development',
                    lastName: 'User',
                    email: email,
                    role: email.includes('admin') ? 'admin' : email.includes('faculty') ? 'faculty' : 'student',
                    isActive: true,
                    isSuspended: false,
                    isLocked: false,
                    twoFactorEnabled: false
                };
                
                // Generate mock tokens
                const jwt = require('jsonwebtoken');
                const token = jwt.sign(
                    { id: mockUser._id, email: mockUser.email, role: mockUser.role },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRE || '24h' }
                );
                
                const refreshToken = jwt.sign(
                    { id: mockUser._id, email: mockUser.email },
                    process.env.JWT_REFRESH_SECRET,
                    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
                );
                
                return res.status(200).json({
                    success: true,
                    message: 'Login successful (development mode)',
                    token,
                    refreshToken,
                    user: {
                        id: mockUser._id,
                        firstName: mockUser.firstName,
                        lastName: mockUser.lastName,
                        email: mockUser.email,
                        role: mockUser.role,
                        isActive: mockUser.isActive
                    },
                    devMode: true
                });
            }
            
            return res.status(400).json({
                success: false,
                message: 'Email and password required',
                code: 'VALIDATION_ERROR'
            });
        }

        // Validate input
        const { error } = validation.validateLogin(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const { email, password, twoFactorToken } = req.body;

        // Find user with password field
        const user = await User.findByEmail(email).select('+password +loginAttempts +lockUntil +twoFactorEnabled +twoFactorSecret').populate('department', 'name');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(423).json({
                success: false,
                message: 'Account is temporarily locked due to multiple failed attempts',
                code: 'ACCOUNT_LOCKED',
                lockUntil: user.lockUntil
            });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated',
                code: 'ACCOUNT_DEACTIVATED'
            });
        }

        // Check if account is suspended
        if (user.isSuspended) {
            return res.status(401).json({
                success: false,
                message: user.suspensionReason || 'Account is suspended',
                code: 'ACCOUNT_SUSPENDED',
                suspensionEnds: user.suspensionEnds
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            await user.incrementLoginAttempts();
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Reset lockout fields
        user.loginAttempts = 0;
        user.lockUntil = undefined;

        // Check two-factor authentication
        if (user.twoFactorEnabled) {
            if (!twoFactorToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Two-factor authentication token required',
                    code: '2FA_REQUIRED'
                });
            }

            const isValidTwoFactor = user.verifyTwoFactorToken(twoFactorToken);
            if (!isValidTwoFactor) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid two-factor authentication token',
                    code: 'INVALID_2FA_TOKEN'
                });
            }
        }

        // Update login information
        user.lastLogin = new Date();
        user.lastLoginIP = req.ip;
        user.loginCount += 1;
        await user.save();

        // Generate tokens
        const authToken = user.generateAuthToken();
        const refreshToken = user.generateRefreshToken();

        // Save refresh token
        await user.addRefreshToken(
            refreshToken,
            req.get('User-Agent') || 'Unknown Device',
            req.ip,
            req.get('User-Agent') || 'Unknown Device'
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    _id: user._id,
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    studentId: user.studentId,
                    employeeId: user.employeeId,
                    isEmailVerified: user.isEmailVerified,
                    twoFactorEnabled: user.twoFactorEnabled,
                    profilePicture: user.profilePicture,
                    department: user.department?._id || user.department,
                    departmentName: user.department?.name || 'Global',
                    preferences: user.preferences,
                    lastLogin: user.lastLogin
                },
                tokens: {
                    authToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error during login',
            code: 'LOGIN_ERROR'
        });
    }
};

/**
 * Refresh access token
 * @access Public
 */
exports.refresh = async (req, res) => {
    try {
        const user = req.user;
        const refreshToken = req.refreshToken;

        // Generate new tokens
        const authToken = user.generateAuthToken();
        const newRefreshToken = user.generateRefreshToken();

        // Remove old refresh token and add new one
        await user.removeRefreshToken(refreshToken);
        await user.addRefreshToken(
            newRefreshToken,
            req.get('User-Agent') || 'Unknown Device',
            req.ip,
            req.get('User-Agent') || 'Unknown Device'
        );

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                tokens: {
                    authToken,
                    refreshToken: newRefreshToken
                }
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during token refresh',
            code: 'REFRESH_ERROR'
        });
    }
};

/**
 * Logout user
 * @access Private
 */
exports.logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const user = req.user;

        if (refreshToken) {
            await user.removeRefreshToken(refreshToken);
        }

        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout',
            code: 'LOGOUT_ERROR'
        });
    }
};

/**
 * Verify email with token
 * @access Public
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required',
                code: 'TOKEN_REQUIRED'
            });
        }

        const user = await User.findOne({
            emailVerificationToken: token,
            emailVerificationExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token',
                code: 'INVALID_VERIFICATION_TOKEN'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during email verification',
            code: 'VERIFY_EMAIL_ERROR'
        });
    }
};

// In-memory OTP store (should be replaced with Redis in production)
const otpStore = new Map();

/**
 * Send OTP to email
 * @access Public
 */
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000,
            attempts: 0
        });

        await emailService.sendEmail({
            to: email,
            subject: 'Your OTP - AI University Platform',
            text: `Your OTP is ${otp}`
        });

        res.json({ success: true, message: 'OTP sent to your email' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

/**
 * Verify OTP
 * @access Public
 */
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Email and OTP are required' });
        }

        const storedOtpData = otpStore.get(email);

        if (!storedOtpData) {
            return res.status(400).json({ success: false, message: 'OTP not found or expired' });
        }

        if (Date.now() > storedOtpData.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'OTP has expired' });
        }

        if (storedOtpData.attempts >= 3) {
            otpStore.delete(email);
            return res.status(400).json({ success: false, message: 'Too many attempts. Please request a new OTP' });
        }

        if (storedOtpData.otp !== otp) {
            storedOtpData.attempts++;
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        otpStore.delete(email);

        res.json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
};

/**
 * Resend OTP
 * @access Public
 */
exports.resendOtp = async (req, res) => {
    return exports.sendOtp(req, res);
};
