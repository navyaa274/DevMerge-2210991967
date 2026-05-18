const mongoose = require("mongoose");

/**
 * Middleware to validate if a specific parameter in req.params is a valid MongoDB ObjectId
 * @param {string} paramName - The name of the parameter in req.params to validate
 */
module.exports = (paramName) => (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
        return res.status(400).json({
            success: false,
            message: `Invalid ID format for parameter: ${paramName}`
        });
    }
    next();
};
