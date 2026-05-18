/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces role-based permissions on the server side
 */
const { AppError, ErrorTypes } = require('../errors/AppError');
const logger = require('../utils/logger');

// Define role hierarchy and permissions
const rolePermissions = {
  super_admin: {
    level: 5,
    permissions: ['*'] // All permissions
  },
  admin: {
    level: 4,
    permissions: [
      'manage_users',
      'manage_departments',
      'manage_courses',
      'manage_faculty',
      'approve_problems',
      'approve_exams',
      'view_analytics',
      'manage_semesters',
      'manage_announcements',
      'export_reports'
    ]
  },
  hod: {
    level: 3,
    permissions: [
      'manage_faculty',
      'approve_problems',
      'view_department_analytics',
      'manage_department_courses'
    ]
  },
  faculty: {
    level: 2,
    permissions: [
      'create_problems',
      'create_courses',
      'create_exams',
      'create_assignments',
      'view_submissions',
      'grade_submissions',
      'view_analytics'
    ]
  },
  student: {
    level: 1,
    permissions: [
      'solve_problems',
      'submit_code',
      'take_exams',
      'view_leaderboard',
      'view_own_analytics',
      'collaborate'
    ]
  },
  public: {
    level: 0,
    permissions: [
      'view_public_pages',
      'register',
      'login'
    ]
  }
};

/**
 * Authorize middleware
 * Checks if user has required role/permission
 */
const authorize = (requiredRoles = [], requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        throw new AppError(
          'Authentication required',
          401,
          ErrorTypes.UNAUTHORIZED.code
        );
      }

      const userRole = req.user.role;
      const userPermissions = rolePermissions[userRole];

      if (!userPermissions) {
        throw new AppError(
          'Invalid user role',
          403,
          ErrorTypes.FORBIDDEN.code
        );
      }

      // Check role requirement
      if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
        logger.audit('unauthorized_access_attempt', req.user.id, {
          requiredRoles,
          userRole,
          path: req.path
        });

        throw new AppError(
          'Insufficient permissions for this action',
          403,
          ErrorTypes.INSUFFICIENT_PERMISSIONS.code
        );
      }

      // Check permission requirement
      if (requiredPermissions.length > 0) {
        const hasPermission = requiredPermissions.some(permission =>
          userPermissions.permissions.includes('*') ||
          userPermissions.permissions.includes(permission)
        );

        if (!hasPermission) {
          logger.audit('unauthorized_permission_attempt', req.user.id, {
            requiredPermissions,
            userPermissions: userPermissions.permissions,
            path: req.path
          });

          throw new AppError(
            'You do not have permission to perform this action',
            403,
            ErrorTypes.INSUFFICIENT_PERMISSIONS.code
          );
        }
      }

      // Log successful authorization
      logger.debug('Authorization successful', {
        userId: req.user.id,
        role: userRole,
        path: req.path
      });

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user has specific permission
 */
const hasPermission = (userRole, permission) => {
  const rolePerms = rolePermissions[userRole];
  if (!rolePerms) return false;
  return rolePerms.permissions.includes('*') || rolePerms.permissions.includes(permission);
};

/**
 * Check if user has specific role
 */
const hasRole = (userRole, requiredRole) => {
  const userLevel = rolePermissions[userRole]?.level || -1;
  const requiredLevel = rolePermissions[requiredRole]?.level || -1;
  return userLevel >= requiredLevel;
};

module.exports = {
  authorize,
  hasPermission,
  hasRole,
  rolePermissions
};
