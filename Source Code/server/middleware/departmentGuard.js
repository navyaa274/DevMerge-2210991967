/**
 * Middleware to restrict access based on department ownership.
 * Admins and Super Admins bypass this check.
 * @param {Function} getDepartmentIdFromRequest - Helper function to extract department ID from the request object (params, body, or query)
 */
module.exports = (getDepartmentIdFromRequest) => {
    return (req, res, next) => {
        const userDept = req.user.department?.toString();
        const targetDept = getDepartmentIdFromRequest(req);

        // Bypass for administrative roles
        if (
            req.user.role === "super_admin" ||
            req.user.role === "admin"
        ) {
            return next();
        }

        if (!userDept || !targetDept || String(userDept) !== String(targetDept)) {
            console.warn(
                `[SECURITY] Department access restricted for user ${req.user._id}. User Dept: ${userDept}, Target Dept: ${targetDept}`
            );
            return res.status(403).json({
                success: false,
                message: "Department access restricted"
            });
        }

        next();
    };
};
