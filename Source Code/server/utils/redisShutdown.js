const redisService = require('../services/infrastructure/redisService');
const logger = require('../utils/logger');

class RedisShutdown {
  async shutdown() {
    try {
      logger.info('Redis: Shutting down connection...');
      await redisService.close();
      logger.info('Redis: Connection closed successfully');
    } catch (error) {
      logger.error('Redis: Error during shutdown', error.message);
    }
  }
}

module.exports = new RedisShutdown();
