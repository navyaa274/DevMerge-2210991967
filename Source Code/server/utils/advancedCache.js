const Redis = require('ioredis');
const { DATABASE } = require('../config');

// Reusing global redis connection if possible, or creating specifically for cache
const redis = new Redis(DATABASE.redis.url || 'redis://localhost:6379');

class AdvancedCache {
    /**
     * Cache-Aside Strategy
     * @param {string} key 
     * @param {Function} fetcher Async function to fetch data if not in cache
     * @param {number} ttl Time to live in seconds
     */
    static async getOrSet(key, fetcher, ttl = 3600) {
        const cached = await redis.get(key);
        if (cached) {
            return JSON.parse(cached);
        }

        const freshData = await fetcher();
        if (freshData !== undefined) {
            await redis.setex(key, ttl, JSON.stringify(freshData));
        }
        return freshData;
    }

    /**
     * Write-Through Strategy
     */
    static async set(key, data, ttl = 3600) {
        await redis.setex(key, ttl, JSON.stringify(data));
        // Additional database sync logic could go here
        return data;
    }

    /**
     * Cache Eviction / Invalidation
     */
    static async invalidate(key) {
        return await redis.del(key);
    }

    /**
     * Pattern-based Invalidation
     */
    static async invalidatePattern(pattern) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
            return await redis.del(...keys);
        }
        return 0;
    }
}

module.exports = AdvancedCache;
