/**
 * Middleware to sanitize empty string values on ObjectId fields.
 * Converts "" to undefined so Mongoose doesn't try to cast ""
 * as an ObjectId, which throws a BSONError.
 *
 * Usage:
 *   const { sanitizeObjectIds } = require('../middleware/sanitizeObjectIds');
 *   router.post('/endpoint', authenticate, sanitizeObjectIds(['course', 'semester', 'department']), handler);
 */

function sanitizeObjectIds(fields = []) {
    return (req, res, next) => {
        const targets = [req.body, req.query, req.params];

        for (const target of targets) {
            if (!target) continue;
            for (const field of fields) {
                if (target[field] !== undefined && target[field] !== null) {
                    const val = String(target[field]).trim();
                    if (val === '') {
                        target[field] = undefined;
                    }
                }
            }
        }

        next();
    };
}

module.exports = { sanitizeObjectIds };
