const logger = require("../utils/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    if (res.statusCode >= 400) {
      logger.warn("Request completed with error", logData);
    } else {
      logger.info("Request completed", logData);
    }
  });

  next();
};

const errorLogger = (error, req, res, next) => {
  logger.error("Error occurred", {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  next(error);
};

module.exports = {
  requestLogger,
  errorLogger,
};
