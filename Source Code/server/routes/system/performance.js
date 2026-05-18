const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { authorize } = require('../../middleware/rbac');
const IndexManager = require('../../utils/indexManager');
const LazyLoader = require('../../utils/lazyLoader');
const QueryOptimizer = require('../../utils/queryOptimizer');
const CDNIntegration = require('../../utils/cdnIntegration');

// Initialize CDN
const cdn = new CDNIntegration({
  cdnUrl: process.env.CDN_URL,
  enabled: process.env.CDN_ENABLED === 'true'
});

/**
 * @route   GET /api/performance/stats
 * @desc    Get performance statistics
 * @access  Admin
 */
router.get('/stats', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const stats = {
      cdn: await cdn.getStats(),
      cache: {
        enabled: !!process.env.REDIS_URL,
        ttl: {
          problems: process.env.CACHE_TTL_PROBLEMS || 3600,
          leaderboard: process.env.CACHE_TTL_LEADERBOARD || 1800,
          analytics: process.env.CACHE_TTL_ANALYTICS || 21600,
          course: process.env.CACHE_TTL_COURSE || 7200
        }
      },
      compression: {
        enabled: process.env.COMPRESSION_ENABLED === 'true',
        level: process.env.COMPRESSION_LEVEL || 6,
        threshold: process.env.COMPRESSION_THRESHOLD || 1024
      },
      batching: {
        enabled: process.env.BATCH_ENABLED === 'true',
        timeout: process.env.BATCH_TIMEOUT || 50,
        maxSize: process.env.BATCH_MAX_SIZE || 100
      },
      websocket: {
        batchInterval: process.env.WS_BATCH_INTERVAL || 50,
        maxConnections: process.env.WS_MAX_CONNECTIONS || 10000
      }
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/performance/indexes/:model
 * @desc    Get indexes for a model
 * @access  Admin
 */
router.get('/indexes/:model', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { model: modelName } = req.params;
    const model = require(`../models/${modelName}`);

    const result = await IndexManager.listIndexes(model);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/performance/indexes/:model
 * @desc    Create index for a model
 * @access  Admin
 */
router.post('/indexes/:model', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { model: modelName } = req.params;
    const { fields, options } = req.body;
    const model = require(`../models/${modelName}`);

    const result = await IndexManager.createIndex(model, fields, options);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   DELETE /api/performance/indexes/:model/:indexName
 * @desc    Drop index for a model
 * @access  Admin
 */
router.delete('/indexes/:model/:indexName', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { model: modelName, indexName } = req.params;
    const model = require(`../models/${modelName}`);

    const result = await IndexManager.dropIndex(model, indexName);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/performance/indexes/:model/analyze
 * @desc    Analyze index usage for a model
 * @access  Admin
 */
router.get('/indexes/:model/analyze', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { model: modelName } = req.params;
    const model = require(`../models/${modelName}`);

    const result = await IndexManager.analyzeIndexUsage(model);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/performance/indexes/:model/rebuild
 * @desc    Rebuild indexes for a model
 * @access  Admin
 */
router.post('/indexes/:model/rebuild', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { model: modelName } = req.params;
    const model = require(`../models/${modelName}`);

    const result = await IndexManager.rebuildIndexes(model);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/performance/indexes/:model/optimize
 * @desc    Optimize indexes based on query patterns
 * @access  Admin
 */
router.post('/indexes/:model/optimize', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { model: modelName } = req.params;
    const { queryPatterns } = req.body;
    const model = require(`../models/${modelName}`);

    const result = await IndexManager.optimizeIndexes(model, queryPatterns);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/performance/cdn/purge
 * @desc    Purge CDN cache
 * @access  Admin
 */
router.post('/cdn/purge', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { paths } = req.body;

    const result = await cdn.purgeCache(paths);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/performance/cdn/manifest
 * @desc    Get CDN asset manifest
 * @access  Admin
 */
router.get('/cdn/manifest', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { assetsDir = './public' } = req.query;

    const manifest = await cdn.generateManifest(assetsDir);

    res.json(manifest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   POST /api/performance/query/explain
 * @desc    Explain query performance
 * @access  Admin
 */
router.post('/query/explain', authenticate, authorize(['admin', 'super_admin']), async (req, res) => {
  try {
    const { model: modelName, query } = req.body;
    const model = require(`../models/${modelName}`);

    const queryBuilder = model.find(query);
    const explanation = await QueryOptimizer.explain(queryBuilder);

    res.json(explanation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/performance/health
 * @desc    Get performance health check
 * @access  Public
 */
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
