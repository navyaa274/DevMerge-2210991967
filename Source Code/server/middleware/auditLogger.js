/**
 * Security Audit Logger
 * Logs all security-sensitive operations for compliance
 */
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class AuditLogger {
  constructor() {
    this.auditDir = path.join(__dirname, '../../logs/audit');
    this.ensureAuditDir();
  }

  ensureAuditDir() {
    if (!fs.existsSync(this.auditDir)) {
      fs.mkdirSync(this.auditDir, { recursive: true });
    }
  }

  /**
   * Log user authentication
   */
  logAuthentication(userId, email, success, ipAddress, userAgent) {
    this.log('authentication', {
      userId,
      email,
      success,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log authorization failures
   */
  logAuthorizationFailure(userId, action, resource, reason) {
    this.log('authorization_failure', {
      userId,
      action,
      resource,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log role changes
   */
  logRoleChange(userId, oldRole, newRole, changedBy) {
    this.log('role_change', {
      userId,
      oldRole,
      newRole,
      changedBy,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log admin actions
   */
  logAdminAction(adminId, action, targetId, details) {
    this.log('admin_action', {
      adminId,
      action,
      targetId,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log exam violations
   */
  logExamViolation(userId, examId, violationType, details) {
    this.log('exam_violation', {
      userId,
      examId,
      violationType,
      details,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log data access
   */
  logDataAccess(userId, dataType, resourceId, action) {
    this.log('data_access', {
      userId,
      dataType,
      resourceId,
      action,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(userId, activityType, details, ipAddress) {
    this.log('suspicious_activity', {
      userId,
      activityType,
      details,
      ipAddress,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log API key usage
   */
  logAPIKeyUsage(keyId, endpoint, success, ipAddress) {
    this.log('api_key_usage', {
      keyId,
      endpoint,
      success,
      ipAddress,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log configuration changes
   */
  logConfigChange(adminId, configKey, oldValue, newValue) {
    this.log('config_change', {
      adminId,
      configKey,
      oldValue,
      newValue,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Internal logging method
   */
  log(eventType, data) {
    try {
      const logFile = path.join(this.auditDir, `${eventType}.log`);
      const logEntry = JSON.stringify({
        ...data,
        eventType
      });

      fs.appendFileSync(logFile, logEntry + '\n');

      // Also log to main logger
      logger.audit(eventType, data.userId || 'system', data);
    } catch (error) {
      logger.error('Failed to write audit log:', { error: error.message });
    }
  }

  /**
   * Get audit logs for a specific event type
   */
  getAuditLogs(eventType, limit = 100) {
    try {
      const logFile = path.join(this.auditDir, `${eventType}.log`);

      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.trim().split('\n');

      return lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
    } catch (error) {
      logger.error('Failed to read audit logs:', { error: error.message });
      return [];
    }
  }

  /**
   * Get all audit logs for a user
   */
  getUserAuditLogs(userId, limit = 100) {
    try {
      const allLogs = [];
      const files = fs.readdirSync(this.auditDir);

      for (const file of files) {
        const logs = this.getAuditLogs(file.replace('.log', ''), limit);
        allLogs.push(...logs.filter(log => log.userId === userId));
      }

      return allLogs
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      logger.error('Failed to get user audit logs:', { error: error.message });
      return [];
    }
  }

  /**
   * Export audit logs for compliance
   */
  exportAuditLogs(eventType, startDate, endDate) {
    try {
      const logs = this.getAuditLogs(eventType, 10000);

      return logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
      });
    } catch (error) {
      logger.error('Failed to export audit logs:', { error: error.message });
      return [];
    }
  }
}

module.exports = new AuditLogger();
