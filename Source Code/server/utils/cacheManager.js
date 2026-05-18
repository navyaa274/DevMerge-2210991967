const redisClient = require('../config/redis');
const logger = require('./logger');

/**
 * Cache Manager Utility
 * Simplifies Redis interactions for institutional-level caching
 */
class CacheManager {
    /**
     * Set a value in cache
     * @param {string} key 
     * @param {any} value 
     * @param {number} ttlMinutes - Expiration in minutes (default 15)
     */
    async set(key, value, ttlMinutes = 15) {
        try {
            if (!redisClient.isRedisConnected()) return false;

            const client = redisClient.getClient();
            const serialized = JSON.stringify(value);

            await client.set(key, serialized, {
                EX: ttlMinutes * 60
            });
            return true;
        } catch (error) {
            logger.warn(`Cache: Failed to set key [${key}]`, error.message);
            return false;
        }
    }

    /**
     * Get a value from cache
     * @param {string} key 
     */
    async get(key) {
        try {
            if (!redisClient.isRedisConnected()) return null;

            const client = redisClient.getClient();
            const data = await client.get(key);

            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.warn(`Cache: Failed to get key [${key}]`, error.message);
            return null;
        }
    }

    /**
     * Delete a key from cache
     * @param {string} key 
     */
    async del(key) {
        try {
            if (!redisClient.isRedisConnected()) return false;

            const client = redisClient.getClient();
            await client.del(key);
            return true;
        } catch (error) {
            logger.warn(`Cache: Failed to delete key [${key}]`, error.message);
            return false;
        }
    }

    /**
     * Generate a cache key
     * @param {string} prefix 
     * @param {string} id 
     */
    generateKey(prefix, id) {
        return `inst:${prefix}:${id}`;
    }
}

module.exports = new CacheManager();
