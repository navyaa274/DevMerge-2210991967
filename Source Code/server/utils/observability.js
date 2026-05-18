const client = require('prom-client');
const register = new client.Registry();

// Enable standard default metrics (CPU, Memory, GC)
client.collectDefaultMetrics({ register });

// Define custom metrics
const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});

const activeConnections = new client.Gauge({
    name: 'http_active_connections',
    help: 'Current number of active HTTP connections',
});

const requestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
});

register.registerMetric(httpRequestCounter);
register.registerMetric(activeConnections);
register.registerMetric(requestDuration);

const metricsMiddleware = (req, res, next) => {
    const start = Date.now();
    activeConnections.inc();

    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        activeConnections.dec();

        httpRequestCounter.inc({
            method: req.method,
            route: req.path,
            status_code: res.statusCode,
        });

        requestDuration.observe(
            { method: req.method, route: req.path, status_code: res.statusCode },
            duration
        );
    });

    next();
};

const getMetrics = async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error);
    }
};

module.exports = { metricsMiddleware, getMetrics };
