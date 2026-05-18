const jwt = require('jsonwebtoken');
const User = require('../models/auth/User');
const UserRole = require('../models/assessment/userRoles');
const RolePermission = require('../models/assessment/rolePermissions');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const LOCAL_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

const shouldSkipAuthRateLimit = (req) => {
  if (process.env.DISABLE_AUTH_RATE_LIMIT === '1') return true;
  // Never rate-limit auth endpoints outside production
  if (process.env.NODE_ENV !== 'production') return true;

  if (LOCAL_IPS.has(req.ip)) return true;
  if (req.hostname === 'localhost') return true;
  return false;
};

// Rate limiting for authentication endpoints
const authLimiter = (req, res, next) => {
  if (shouldSkipAuthRateLimit(req)) {
    return next();
  }
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return req.ip + ':' + (req.headers['user-agent'] || '');
    }
  })(req, res, next);
};

// Stricter rate limiting for login attempts
const loginLimiter = (req, res, next) => {
  if (shouldSkipAuthRateLimit(req)) {
    return next();
  }
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_LOGIN_ATTEMPTS) || 5,
    message: {
      error: 'Too many login attempts, please try again later.',
      retryAfter: 15 * 60
    },
    skipSuccessfulRequests: true,
    keyGenerator: (req) => {
      return req.ip + ':' + (req.body.email || '');
    }
  })(req, res, next);
};

/**
 * JWT Authentication Middleware
 * Verifies JWT token and sets req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    // Get user from database
    if (mongoose.connection.readyState !== 1) {
      // Development mode - create mock user from token
      const mockUser = {
        _id: decoded.id,
        id: decoded.id,
        email: decoded.email,
        role: decoded.role || 'student',
        name: decoded.name || 'Development User',
        isActive: true,
        isSuspended: false,
        isLocked: false,
        twoFactorEnabled: false,
        devMode: true
      };
      
      req.user = mockUser;
      return next();
    }

    const user = await User.findById(decoded.id).select('+refreshTokens +loginAttempts +lockUntil');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      return res.status(401).json({
        success: false,
        message: user.suspensionReason || 'Account is suspended.',
        code: 'ACCOUNT_SUSPENDED',
        suspensionEnds: user.suspensionEnds
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to multiple failed attempts.',
        code: 'ACCOUNT_LOCKED',
        lockUntil: user.lockUntil
      });
    }

    // Check if email is verified (except for email verification endpoints)
    const emailVerificationPaths = new Set(['/verify-email', '/resend-verification']);
    const currentPath = req.path.split('?')[0];
    if (!user.isEmailVerified && !emailVerificationPaths.has(currentPath)) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Update last activity — debounced to avoid DB write on every request
    // Only updates once per 5 minutes per user via a simple in-memory throttle
    const lastActiveKey = `_lastActive_${user._id}`;
    if (!authenticate._lastActiveCache) authenticate._lastActiveCache = new Map();
    const lastUpdate = authenticate._lastActiveCache.get(lastActiveKey);
    if (!lastUpdate || Date.now() - lastUpdate > 5 * 60 * 1000) {
      User.updateOne({ _id: user._id }, { lastActive: new Date() }).exec(); // fire-and-forget
      authenticate._lastActiveCache.set(lastActiveKey, Date.now());
    }

    // Set user in request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional Authentication Middleware
 * Attaches user to request if token is valid, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    // Silently continue if token is invalid
    next();
  }
};

/**
 * Role-based Authorization Middleware
 * Checks if user has required role(s) or permission(s)
 */
const authorize = (...roles) => {
  // Allow passing an array as the first argument or multiple arguments
  const allowedRoles = roles.length === 1 && Array.isArray(roles[0]) ? roles[0] : roles;

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    try {
      // Get user's roles from the new role system
      const userRoles = await UserRole.find({
        user_id: req.user._id,
        is_active: true
      }).populate('role_id').lean();

      if (!userRoles || userRoles.length === 0) {
        // Fallback to legacy role system if no roles assigned
        if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. Insufficient permissions.',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: allowedRoles,
            current: req.user.role
          });
        }
        return next();
      }

      // Check if user has any of the required roles
      const userRoleNames = userRoles.map(ur => ur.role_id.name);
      const hasRole = allowedRoles.some(role => userRoleNames.includes(role));

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions.',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: allowedRoles,
          current: userRoleNames
        });
      }

      // Attach user roles and permissions to request for later use
      req.userRoles = userRoles;
      req.userPermissions = [];

      // Get permissions for all user's roles
      for (const userRole of userRoles) {
        const rolePermissions = await RolePermission.find({
          role_id: userRole.role_id._id
        }).populate('permission_id').lean();

        req.userPermissions.push(...rolePermissions.map(rp => rp.permission_id));
      }

      // Remove duplicates
      req.userPermissions = req.userPermissions.filter((perm, index, self) =>
        index === self.findIndex(p => p._id.toString() === perm._id.toString())
      );

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authorization.',
        code: 'AUTHORIZATION_ERROR'
      });
    }
  };
};

/**
 * Permission-based Authorization Middleware
 * Checks if user has specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
      });
    }

    const userPermissions = req.user.getPermissions();

    if (!userPermissions.includes(permission) &&
      !userPermissions.includes(`${permission.split(':')[0]}:*`) &&
      !userPermissions.includes('*')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Required permission missing.',
        code: 'PERMISSION_DENIED',
        required: permission,
        userPermissions
      });
    }

    next();
  };
};

/**
 * Two-Factor Authentication Middleware
 * Requires 2FA if enabled for user
 */
const requireTwoFactor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  // Check if 2FA is enabled for user
  if (req.user.twoFactorEnabled) {
    const twoFactorToken = req.header('X-2FA-Token');

    if (!twoFactorToken) {
      return res.status(401).json({
        success: false,
        message: 'Two-factor authentication token required.',
        code: '2FA_REQUIRED'
      });
    }

    // Verify 2FA token
    if (!req.user.verifyTwoFactorToken(twoFactorToken)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid two-factor authentication token.',
        code: 'INVALID_2FA_TOKEN'
      });
    }
  }

  next();
};

/**
 * Email Verification Middleware
 * Requires email to be verified
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isEmailVerified) {
    return res.status(401).json({
      success: false,
      message: 'Email verification required.',
      code: 'EMAIL_VERIFICATION_REQUIRED'
    });
  }

  next();
};

/**
 * Faculty-only Middleware
 * Checks if user is faculty or higher role
 */
const requireFaculty = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isFaculty()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Faculty privileges required.',
      code: 'FACULTY_REQUIRED'
    });
  }

  next();
};

/**
 * Admin-only Middleware
 * Checks if user is admin or super admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

/**
 * Super Admin-only Middleware
 * Checks if user is super admin
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.',
      code: 'AUTH_REQUIRED'
    });
  }

  if (!req.user.isSuperAdmin()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.',
      code: 'SUPER_ADMIN_REQUIRED'
    });
  }

  next();
};

/**
 * Refresh Token Validation Middleware
 * Validates refresh token
 */
const validateRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is required.',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.',
        code: 'INVALID_TOKEN_TYPE'
      });
    }

    // Get user with refresh tokens
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token.',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    // Check if refresh token exists and is not expired
    const tokenExists = user.refreshTokens.some(rt =>
      rt.token === refreshToken && rt.expiresAt > new Date()
    );

    if (!tokenExists) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired or invalid.',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }

    req.user = user;
    req.refreshToken = refreshToken;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    console.error('Refresh token validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during refresh token validation.',
      code: 'REFRESH_TOKEN_ERROR'
    });
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  requirePermission,
  requireTwoFactor,
  requireEmailVerification,
  requireFaculty,
  requireAdmin,
  requireSuperAdmin,
  validateRefreshToken,
  authLimiter,
  loginLimiter
};



