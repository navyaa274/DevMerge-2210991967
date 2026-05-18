const redis = require('redis');
const logger = require('../../utils/logger');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.warn('Redis: Max reconnection attempts reached');
              return false;
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis: Connected successfully');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis: Connection error', err);
        this.isConnected = false;
      });

      this.client.on('disconnect', () => {
        logger.warn('Redis: Disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      logger.warn('Redis: Failed to connect, running without cache', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis: GET error', error.message);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis: SET error', error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis: DEL error', error.message);
      return false;
    }
  }

  async hGet(hash, field) {
    if (!this.isConnected || !this.client) return null;

    try {
      const value = await this.client.hGet(hash, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis: HGET error', error.message);
      return null;
    }
  }

  async hSet(hash, field, value) {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.hSet(hash, field, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis: HSET error', error.message);
      return false;
    }
  }

  async hDel(hash, field) {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.hDel(hash, field);
      return true;
    } catch (error) {
      logger.error('Redis: HDEL error', error.message);
      return false;
    }
  }

  async incr(key) {
    if (!this.isConnected || !this.client) return null;

    try {
      return await this.client.incr(key);
    } catch (error) {
      logger.error('Redis: INCR error', error.message);
      return null;
    }
  }

  async expire(key, seconds) {
    if (!this.isConnected || !this.client) return false;

    try {
      await this.client.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error('Redis: EXPIRE error', error.message);
      return false;
    }
  }

  async exists(key) {
    if (!this.isConnected || !this.client) return false;

    try {
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Redis: EXISTS error', error.message);
      return 0;
    }
  }

  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

module.exports = new CacheService();
