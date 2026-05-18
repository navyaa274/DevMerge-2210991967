const redisService = require('../services/infrastructure/redisService');

class RedisCache {
  constructor() {
    this.prefix = 'devmerge:';
  }

  async get(key) {
    const fullKey = `${this.prefix}${key}`;
    return await redisService.get(fullKey);
  }

  async set(key, value, ttl = 3600) {
    const fullKey = `${this.prefix}${key}`;
    return await redisService.set(fullKey, value, ttl);
  }

  async del(key) {
    const fullKey = `${this.prefix}${key}`;
    return await redisService.del(fullKey);
  }

  async hGet(hash, field) {
    const fullHash = `${this.prefix}${hash}`;
    return await redisService.hGet(fullHash, field);
  }

  async hSet(hash, field, value) {
    const fullHash = `${this.prefix}${hash}`;
    return await redisService.hSet(fullHash, field, value);
  }

  async hDel(hash, field) {
    const fullHash = `${this.prefix}${hash}`;
    return await redisService.hDel(fullHash, field);
  }

  async incr(key) {
    const fullKey = `${this.prefix}${key}`;
    return await redisService.incr(fullKey);
  }

  async expire(key, seconds) {
    const fullKey = `${this.prefix}${key}`;
    return await redisService.expire(fullKey, seconds);
  }

  async exists(key) {
    const fullKey = `${this.prefix}${key}`;
    return await redisService.exists(fullKey);
  }
}

module.exports = new RedisCache();
