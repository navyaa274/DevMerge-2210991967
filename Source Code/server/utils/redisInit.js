const redisConfig = require('../config/redis');
const logger = require('../utils/logger');

class RedisInit {
  async init() {
    if (process.env.NODE_ENV === 'test') {
      logger.info('Redis: Skipping connection in test mode');
      return true;
    }
    try {
      logger.info('Redis: Initializing connection...');
      await redisConfig.connect();

      if (redisConfig.isRedisConnected()) {
        logger.info('Redis: Connection established');
        return true;
      } else {
        logger.warn('Redis: Connection failed, running without cache');
        return false;
      }
    } catch (error) {
      logger.warn('Redis: Failed to initialize', error.message);
      return false;
    }
  }
}

module.exports = new RedisInit();
