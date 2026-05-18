/**
 * Monitoring and Observability Configuration
 */

const PROMETHEUS_CONFIG = {
    enabled: process.env.PROMETHEUS_ENABLED === 'true',
    port: process.env.PROMETHEUS_PORT || 9091,
    metricsPath: '/metrics',
    collectDefaultMetrics: true,
    requestDurationBuckets: [0.1, 0.5, 1, 2, 5],
};

module.exports = {
    PROMETHEUS_CONFIG,
};
