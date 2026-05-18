/**
 * Middleware to authorize access based on user roles
 * @param  {...string} allowedRoles - List of roles permitted to access the route
 */
module.exports = (...roles) => {
    const allowedRoles = roles.length === 1 && Array.isArray(roles[0]) ? roles[0] : roles;

    return (req, res, next) => {
        // req.user is expected to be populated by the authentication middleware
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            console.warn(
                `[SECURITY] Access denied for user ${req.user?._id || 'ANONYMOUS'} with role ${req.user?.role || 'NONE'} on path ${req.originalUrl}`
            );
            console.warn(`[SECURITY] Required roles: ${allowedRoles.join(', ')}`);
            return res.status(403).json({
                success: false,
                message: "Access denied: Insufficient permissions",
                required: allowedRoles,
                currentRole: req.user?.role
            });
        }
        next();
    };
};
