const CopilotUsageLog = require('../../models/analytics/CopilotUsageLog');
const logger = require('../../utils/logger');
const { PROMETHEUS_CONFIG } = require('../../config/monitoring');

/**
 * Institutional Observability Service
 * Tracks AI consumption, latency, and system health
 */

exports.getAIConsumptionMetrics = async (timeRangeDays = 30) => {
    try {
        const sinceDate = new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000);

        const logs = await CopilotUsageLog.aggregate([
            { $match: { createdAt: { $gte: sinceDate } } },
            {
                $group: {
                    _id: '$actionType',
                    totalPrompts: { $sum: '$promptSize' },
                    totalGenerations: { $sum: '$generationSize' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const dailyTrend = await CopilotUsageLog.aggregate([
            { $match: { createdAt: { $gte: sinceDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    tokens: { $sum: { $add: ["$promptSize", "$generationSize"] } }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        return {
            byAction: logs,
            dailyTrend,
            totalTokenVolume: logs.reduce((sum, l) => sum + l.totalPrompts + l.totalGenerations, 0)
        };
    } catch (error) {
        logger.error('[Observability AI Metrics Error]', error);
        throw error;
    }
};

exports.getCachePerformance = async () => {
    try {
        if (!redisClient.isRedisConnected()) return { status: 'OFFLINE' };

        const info = await redisClient.getClient().info('stats');
        // Simple extraction of keyspace hits/misses from INFO string
        const hits = info.match(/keyspace_hits:(\d+)/)?.[1] || 0;
        const misses = info.match(/keyspace_misses:(\d+)/)?.[1] || 0;

        return {
            status: 'ONLINE',
            hits: parseInt(hits),
            misses: parseInt(misses),
            hitRate: hits > 0 ? ((hits / (parseInt(hits) + parseInt(misses))) * 100).toFixed(1) + '%' : '0%'
        };
    } catch (error) {
        logger.error('[Observability Cache Performance Error]', error);
        return { status: 'ERROR' };
    }
};

/**
 * Request Latency Tracker (Middleware logic support)
 * In a real production system, this would push to Prometheus/Grafana
 */
exports.getSystemHealthSnapshot = async () => {
    const aiMetrics = await this.getAIConsumptionMetrics(7); // Last 7 days
    const cacheMetrics = await this.getCachePerformance();

    return {
        timestamp: new Date(),
        ai: aiMetrics,
        cache: cacheMetrics,
        systemStability: 'STABLE' // Placeholder for health-check logic
    };
};
