/**
 * Database Index Manager
 * Manages and optimizes database indexes
 */

const QueryOptimizer = require('./queryOptimizer');

class IndexManager {
  /**
   * Initialize all indexes
   */
  static async initializeIndexes(models) {
    console.log('🔧 Initializing database indexes...');

    const indexDefinitions = QueryOptimizer.getCommonIndexes();

    for (const [modelName, indexes] of Object.entries(indexDefinitions)) {
      const model = models[modelName];
      if (model) {
        await QueryOptimizer.createIndexes(model, indexes);
      }
    }

    console.log('✓ Database indexes initialized');
  }

  /**
   * Create custom index
   */
  static async createIndex(model, fields, options = {}) {
    try {
      await model.collection.createIndex(fields, options);
      console.log(`✓ Index created: ${JSON.stringify(fields)}`);
      return { success: true };
    } catch (error) {
      console.error(`✗ Error creating index:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Drop index
   */
  static async dropIndex(model, indexName) {
    try {
      await model.collection.dropIndex(indexName);
      console.log(`✓ Index dropped: ${indexName}`);
      return { success: true };
    } catch (error) {
      console.error(`✗ Error dropping index:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * List all indexes for a model
   */
  static async listIndexes(model) {
    try {
      const indexes = await model.collection.indexes();
      return { success: true, indexes };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze index usage
   */
  static async analyzeIndexUsage(model) {
    try {
      const stats = await model.collection.stats();
      const indexes = await model.collection.indexes();

      return {
        success: true,
        stats: {
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          storageSize: stats.storageSize,
          indexes: indexes.length,
          indexSizes: stats.indexSizes
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Rebuild indexes
   */
  static async rebuildIndexes(model) {
    try {
      await model.collection.reIndex();
      console.log(`✓ Indexes rebuilt for ${model.modelName}`);
      return { success: true };
    } catch (error) {
      console.error(`✗ Error rebuilding indexes:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get index recommendations
   */
  static async getRecommendations(model, sampleQueries = []) {
    const recommendations = [];

    for (const query of sampleQueries) {
      try {
        const explanation = await model.find(query).explain('executionStats');
        const stats = explanation.executionStats;

        // Check if query is doing a collection scan
        if (stats.executionStages.stage === 'COLLSCAN') {
          recommendations.push({
            query,
            issue: 'Collection scan detected',
            recommendation: `Create index on: ${Object.keys(query).join(', ')}`,
            docsExamined: stats.totalDocsExamined,
            executionTime: stats.executionTimeMs
          });
        }

        // Check if too many documents are examined
        if (stats.totalDocsExamined > stats.nReturned * 10) {
          recommendations.push({
            query,
            issue: 'Inefficient query',
            recommendation: 'Consider adding compound index or refining query',
            docsExamined: stats.totalDocsExamined,
            docsReturned: stats.nReturned,
            executionTime: stats.executionTimeMs
          });
        }
      } catch (error) {
        console.error('Error analyzing query:', error.message);
      }
    }

    return recommendations;
  }

  /**
   * Optimize indexes based on query patterns
   */
  static async optimizeIndexes(model, queryPatterns) {
    const recommendations = await this.getRecommendations(model, queryPatterns);
    const optimizations = [];

    for (const rec of recommendations) {
      if (rec.issue === 'Collection scan detected') {
        const fields = Object.keys(rec.query).reduce((acc, key) => {
          acc[key] = 1;
          return acc;
        }, {});

        const result = await this.createIndex(model, fields);
        if (result.success) {
          optimizations.push({
            query: rec.query,
            action: 'Index created',
            fields
          });
        }
      }
    }

    return {
      recommendations,
      optimizations
    };
  }

  /**
   * Monitor index performance
   */
  static async monitorPerformance(model, duration = 60000) {
    const startTime = Date.now();
    const metrics = {
      queries: 0,
      avgExecutionTime: 0,
      slowQueries: []
    };

    // This would typically integrate with MongoDB profiler
    // For now, return structure for implementation
    return {
      model: model.modelName,
      duration,
      metrics,
      timestamp: new Date()
    };
  }
}

module.exports = IndexManager;
