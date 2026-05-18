const redis = require('redis');
const logger = require('../utils/logger');

class RedisConnection {
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

  getClient() {
    return this.client;
  }

  isConnected() {
    return this.isConnected;
  }

  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

module.exports = new RedisConnection();
