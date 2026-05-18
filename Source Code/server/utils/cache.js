// Redis-based cache for production performance
const redis = require('redis');

// Create Redis client
const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  retry_strategy: (options) => {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      console.error('Redis connection refused - falling back to in-memory cache');
      return new Error('Redis connection failed');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      console.error('Redis retry time exhausted - falling back to in-memory cache');
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      console.error('Redis max retries reached - falling back to in-memory cache');
      return new Error('Max retries reached');
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('connect', () => {
  console.log('✅ Redis cache connected');
});

client.on('error', (err) => {
  console.error('❌ Redis cache error:', err.message);
});

// Fallback in-memory cache
class InMemoryCache {
  constructor() {
    this.store = new Map();
    this.ttl = new Map();
  }

  set(key, value, expirationSeconds = 3600) {
    this.store.set(key, value);

    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key));
    }

    const timeout = setTimeout(() => {
      this.store.delete(key);
      this.ttl.delete(key);
    }, expirationSeconds * 1000);

    this.ttl.set(key, timeout);
  }

  get(key) {
    return this.store.get(key);
  }

  has(key) {
    return this.store.has(key);
  }

  delete(key) {
    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key));
      this.ttl.delete(key);
    }
    this.store.delete(key);
  }

  clear() {
    this.store.forEach((_, key) => this.delete(key));
  }

  stats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys())
    };
  }
}

// Use Redis if available, fallback to in-memory
let redisConnected = false;
client.on('connect', () => { redisConnected = true; });
client.on('error', () => { redisConnected = false; });

// Cache key validation and namespacing
const CACHE_NAMESPACE = process.env.CACHE_NAMESPACE || 'aiup';
const MAX_KEY_LENGTH = 256;

const validateAndPrefixKey = (key) => {
  if (typeof key !== 'string' || key.length === 0 || key.length > MAX_KEY_LENGTH) {
    throw new Error(`Invalid cache key: must be a non-empty string under ${MAX_KEY_LENGTH} chars`);
  }
  if (/[^a-zA-Z0-9:._\-]/.test(key)) {
    throw new Error('Invalid cache key: contains disallowed characters');
  }
  return `${CACHE_NAMESPACE}:${key}`;
};

// Cache operations with Redis priority
// Singleton in-memory cache for fallback
const inMemory = new InMemoryCache();

// Cache operations with Redis priority
const cache = {
  async set(key, value, expirationSeconds = 3600) {
    key = validateAndPrefixKey(key);
    if (redisConnected) {
      try {
        await client.setex(key, expirationSeconds, JSON.stringify(value));
        return true;
      } catch (error) {
        console.warn('Redis set failed, using in-memory:', error.message);
      }
    }
    // Fallback to in-memory
    inMemory.set(key, value, expirationSeconds);
    return true;
  },

  async get(key) {
    key = validateAndPrefixKey(key);
    if (redisConnected) {
      try {
        const data = await client.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.warn('Redis get failed, using in-memory:', error.message);
      }
    }
    // Fallback to in-memory
    return inMemory.get(key);
  },

  async has(key) {
    key = validateAndPrefixKey(key);
    if (redisConnected) {
      try {
        const exists = await client.exists(key);
        return exists === 1;
      } catch (error) {
        console.warn('Redis has failed, using in-memory:', error.message);
      }
    }
    return inMemory.has(key);
  },

  async delete(key) {
    key = validateAndPrefixKey(key);
    if (redisConnected) {
      try {
        await client.del(key);
        return true;
      } catch (error) {
        console.warn('Redis delete failed, using in-memory:', error.message);
      }
    }
    inMemory.delete(key);
    return true;
  },

  async clear() {
    if (redisConnected) {
      try {
        await client.flushall();
        return true;
      } catch (error) {
        console.warn('Redis clear failed, using in-memory:', error.message);
      }
    }
    inMemory.clear();
    return true;
  },

  async stats() {
    if (redisConnected) {
      try {
        const info = await client.info();
        return { redis: true, info };
      } catch (error) {
        console.warn('Redis stats failed:', error.message);
      }
    }
    return { redis: false, ...inMemory.stats() };
  }
};

// Cache key generators
const cacheKeys = {
  problems: (page, limit, difficulty, topic) =>
    `problems:${page}:${limit}:${difficulty || 'all'}:${topic || 'all'}`,

  problem: (id) => `problem:${id}`,

  leaderboard: (courseId, page, limit) =>
    `leaderboard:${courseId}:${page}:${limit}`,

  userStats: (userId) => `user:stats:${userId}`,

  courseData: (courseId) => `course:${courseId}`,

  submissions: (userId, page, limit) =>
    `submissions:${userId}:${page}:${limit}`,

  analytics: (userId) => `analytics:${userId}`,

  announcements: (page, limit) => `announcements:${page}:${limit}`
};

// Cache invalidation helpers
const invalidateCache = {
  problem: (id) => cache.delete(cacheKeys.problem(id)),

  problems: async () => {
    const stats = await cache.stats();
    if (stats.keys) {
      stats.keys.forEach(key => {
        if (key.startsWith('problems:')) cache.delete(key);
      });
    }
  },

  leaderboard: async (courseId) => {
    const stats = await cache.stats();
    if (stats.keys) {
      stats.keys.forEach(key => {
        if (key.startsWith(`leaderboard:${courseId}`)) cache.delete(key);
      });
    }
  },

  userStats: (userId) => cache.delete(cacheKeys.userStats(userId)),

  course: (courseId) => cache.delete(cacheKeys.courseData(courseId)),

  submissions: async (userId) => {
    const stats = await cache.stats();
    if (stats.keys) {
      stats.keys.forEach(key => {
        if (key.startsWith(`submissions:${userId}`)) cache.delete(key);
      });
    }
  },

  analytics: (userId) => cache.delete(cacheKeys.analytics(userId)),

  all: () => cache.clear()
};

module.exports = {
  cache,
  cacheKeys,
  invalidateCache
};
