/**
 * Database Query Optimizer
 * Provides utilities for optimizing MongoDB queries
 */

class QueryOptimizer {
  /**
   * Add lean() to queries for better performance
   */
  static lean(query) {
    return query.lean();
  }

  /**
   * Add select() to limit fields returned
   */
  static select(query, fields) {
    return query.select(fields);
  }

  /**
   * Add pagination with limit and skip
   */
  static paginate(query, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }

  /**
   * Add sorting
   */
  static sort(query, sortBy = '-createdAt') {
    return query.sort(sortBy);
  }

  /**
   * Optimize query with common patterns
   */
  static optimize(query, options = {}) {
    const {
      lean = true,
      select = null,
      page = 1,
      limit = 20,
      sort = '-createdAt',
      populate = null
    } = options;

    let optimizedQuery = query;

    // Apply lean for better performance
    if (lean) {
      optimizedQuery = optimizedQuery.lean();
    }

    // Select specific fields
    if (select) {
      optimizedQuery = optimizedQuery.select(select);
    }

    // Add pagination
    if (page && limit) {
      const skip = (page - 1) * limit;
      optimizedQuery = optimizedQuery.skip(skip).limit(limit);
    }

    // Add sorting
    if (sort) {
      optimizedQuery = optimizedQuery.sort(sort);
    }

    // Add population
    if (populate) {
      if (Array.isArray(populate)) {
        populate.forEach(pop => {
          optimizedQuery = optimizedQuery.populate(pop);
        });
      } else {
        optimizedQuery = optimizedQuery.populate(populate);
      }
    }

    return optimizedQuery;
  }

  /**
   * Create indexes for better query performance
   */
  static async createIndexes(model, indexes) {
    try {
      for (const index of indexes) {
        await model.collection.createIndex(index.fields, index.options || {});
      }
      console.log(`✓ Indexes created for ${model.modelName}`);
    } catch (error) {
      console.error(`✗ Error creating indexes for ${model.modelName}:`, error.message);
    }
  }

  /**
   * Analyze query performance
   */
  static async explain(query) {
    const explanation = await query.explain('executionStats');
    return {
      executionTimeMs: explanation.executionStats.executionTimeMs,
      totalDocsExamined: explanation.executionStats.totalDocsExamined,
      totalKeysExamined: explanation.executionStats.totalKeysExamined,
      nReturned: explanation.executionStats.nReturned,
      indexUsed: explanation.executionStats.executionStages.indexName || 'COLLSCAN'
    };
  }

  /**
   * Batch operations for better performance
   */
  static async bulkWrite(model, operations) {
    try {
      const result = await model.bulkWrite(operations, { ordered: false });
      return {
        success: true,
        inserted: result.nInserted,
        updated: result.nModified,
        deleted: result.nRemoved
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Aggregate with optimization
   */
  static optimizeAggregate(pipeline, options = {}) {
    const {
      allowDiskUse = true,
      maxTimeMS = 30000
    } = options;

    return {
      pipeline,
      options: {
        allowDiskUse,
        maxTimeMS
      }
    };
  }

  /**
   * Create compound indexes for common queries
   */
  static getCommonIndexes() {
    return {
      User: [
        { fields: { email: 1 }, options: { unique: true } },
        { fields: { role: 1, isActive: 1 } },
        { fields: { department: 1, role: 1 } },
        { fields: { createdAt: -1 } }
      ],
      Problem: [
        { fields: { difficulty: 1, category: 1 } },
        { fields: { tags: 1 } },
        { fields: { isActive: 1, difficulty: 1 } },
        { fields: { createdAt: -1 } }
      ],
      Submission: [
        { fields: { userId: 1, problemId: 1 } },
        { fields: { userId: 1, status: 1 } },
        { fields: { problemId: 1, status: 1 } },
        { fields: { createdAt: -1 } }
      ],
      Course: [
        { fields: { department: 1, semester: 1 } },
        { fields: { instructor: 1 } },
        { fields: { isActive: 1 } },
        { fields: { createdAt: -1 } }
      ],
      Assignment: [
        { fields: { courseId: 1, dueDate: 1 } },
        { fields: { courseId: 1, isActive: 1 } },
        { fields: { createdAt: -1 } }
      ],
      Exam: [
        { fields: { courseId: 1, startTime: 1 } },
        { fields: { courseId: 1, isActive: 1 } },
        { fields: { createdAt: -1 } }
      ]
    };
  }
}

module.exports = QueryOptimizer;
