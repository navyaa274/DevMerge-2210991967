const logger = require('../utils/logger');

/**
 * Institutional Response Latency Middleware
 * Measures and logs API performance for governance transparency
 */
exports.latencyTracker = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const timeInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        // Track path and method
        const fullPath = req.originalUrl || req.url;

        if (timeInMs > 500) {
            logger.warn(`[Latency Warning] ${req.method} ${fullPath} took ${timeInMs}ms`);
        } else if (process.env.DEBUG_LATENCY === 'true') {
            logger.info(`[Latency] ${req.method} ${fullPath} took ${timeInMs}ms`);
        }

        // In a real production stack, we would push this to a Time-Series DB like Influx or Prometheus
    });

    next();
};
