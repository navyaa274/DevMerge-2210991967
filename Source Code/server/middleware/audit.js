const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');

// Create audit logger
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/audit.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Audit middleware for logging sensitive operations
const auditLog = (action, details = {}) => {
  return (req, res, next) => {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      user: req.user ? req.user.id : 'anonymous',
      role: req.user ? req.user.role : 'none',
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      details
    };

    auditLogger.info('AUDIT', auditEntry);
    next();
  };
};

// Audit helper for programmatic logging
const logAudit = (action, userId, details = {}) => {
  const auditEntry = {
    timestamp: new Date().toISOString(),
    action,
    user: userId,
    details
  };

  auditLogger.info('AUDIT', auditEntry);
};

// Security event logging
const logSecurity = (event, userId, details = {}) => {
  const securityEntry = {
    timestamp: new Date().toISOString(),
    event,
    user: userId,
    level: 'security',
    details
  };

  auditLogger.warn('SECURITY', securityEntry);
};

module.exports = {
  auditLog,
  logAudit,
  logSecurity
};
