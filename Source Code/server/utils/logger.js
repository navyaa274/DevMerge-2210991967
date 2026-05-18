/**
 * Centralized Logging System
 * Uses Winston for production-grade logging
 */
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logger implementation (can be replaced with Winston)
class Logger {
  constructor() {
    this.logLevels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
    this.currentLevel = process.env.LOG_LEVEL || 'info';
  }

  formatLog(level, message, data = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data,
      env: process.env.NODE_ENV
    });
  }

  writeLog(level, message, data) {
    const logMessage = this.formatLog(level, message, data);
    const logFile = path.join(logsDir, `${level}.log`);

    // Write to file
    fs.appendFileSync(logFile, logMessage + '\n');

    // Also write to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(logMessage);
    }
  }

  error(message, data = {}) {
    this.writeLog('error', message, data);
  }

  warn(message, data = {}) {
    if (this.logLevels[this.currentLevel] >= this.logLevels.warn) {
      this.writeLog('warn', message, data);
    }
  }

  info(message, data = {}) {
    if (this.logLevels[this.currentLevel] >= this.logLevels.info) {
      this.writeLog('info', message, data);
    }
  }

  debug(message, data = {}) {
    if (this.logLevels[this.currentLevel] >= this.logLevels.debug) {
      this.writeLog('debug', message, data);
    }
  }

  // Audit logging for security-sensitive operations
  audit(action, userId, details = {}) {
    const auditFile = path.join(logsDir, 'audit.log');
    const auditLog = JSON.stringify({
      timestamp: new Date().toISOString(),
      action,
      userId,
      ...details
    });
    fs.appendFileSync(auditFile, auditLog + '\n');
  }
}

module.exports = new Logger();
