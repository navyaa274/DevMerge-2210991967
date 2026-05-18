/**
 * Lazy Loading Utility
 * Implements lazy loading for large datasets
 */

class LazyLoader {
  /**
   * Create a lazy loading cursor
   */
  static createCursor(model, query = {}, options = {}) {
    const {
      batchSize = 100,
      select = null,
      sort = null
    } = options;

    let cursor = model.find(query).cursor({ batchSize });

    if (select) {
      cursor = cursor.select(select);
    }

    if (sort) {
      cursor = cursor.sort(sort);
    }

    return cursor;
  }

  /**
   * Process documents in batches
   */
  static async processBatch(model, query, processor, options = {}) {
    const {
      batchSize = 100,
      select = null,
      sort = null
    } = options;

    const cursor = this.createCursor(model, query, { batchSize, select, sort });
    let batch = [];
    let processedCount = 0;

    try {
      for await (const doc of cursor) {
        batch.push(doc);

        if (batch.length >= batchSize) {
          await processor(batch);
          processedCount += batch.length;
          batch = [];
        }
      }

      // Process remaining documents
      if (batch.length > 0) {
        await processor(batch);
        processedCount += batch.length;
      }

      return { success: true, processedCount };
    } catch (error) {
      return { success: false, error: error.message, processedCount };
    }
  }

  /**
   * Infinite scroll pagination
   */
  static async infiniteScroll(model, query, options = {}) {
    const {
      lastId = null,
      limit = 20,
      select = null,
      sort = '-createdAt'
    } = options;

    let findQuery = { ...query };

    // Add cursor-based pagination
    if (lastId) {
      if (sort.startsWith('-')) {
        findQuery._id = { $lt: lastId };
      } else {
        findQuery._id = { $gt: lastId };
      }
    }

    let queryBuilder = model.find(findQuery).limit(limit).sort(sort);

    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    const documents = await queryBuilder.lean();

    return {
      documents,
      hasMore: documents.length === limit,
      lastId: documents.length > 0 ? documents[documents.length - 1]._id : null
    };
  }

  /**
   * Virtual scroll for large lists
   */
  static async virtualScroll(model, query, options = {}) {
    const {
      offset = 0,
      limit = 50,
      select = null,
      sort = '-createdAt'
    } = options;

    // Get total count (cached if possible)
    const total = await model.countDocuments(query);

    let queryBuilder = model.find(query)
      .skip(offset)
      .limit(limit)
      .sort(sort);

    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    const documents = await queryBuilder.lean();

    return {
      documents,
      total,
      offset,
      limit,
      hasMore: offset + documents.length < total
    };
  }

  /**
   * Stream large datasets
   */
  static streamData(model, query, options = {}) {
    const {
      batchSize = 100,
      select = null,
      sort = null,
      transform = null
    } = options;

    const { Readable } = require('stream');

    return new Readable({
      objectMode: true,
      async read() {
        const cursor = LazyLoader.createCursor(model, query, { batchSize, select, sort });

        try {
          for await (const doc of cursor) {
            const data = transform ? transform(doc) : doc;
            this.push(data);
          }
          this.push(null); // End stream
        } catch (error) {
          this.destroy(error);
        }
      }
    });
  }

  /**
   * Lazy load related documents
   */
  static async lazyPopulate(document, field, model, options = {}) {
    const {
      select = null,
      limit = null
    } = options;

    if (!document[field]) {
      return document;
    }

    const ids = Array.isArray(document[field]) ? document[field] : [document[field]];
    
    let query = model.find({ _id: { $in: ids } });

    if (select) {
      query = query.select(select);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const populated = await query.lean();

    document[field] = Array.isArray(document[field]) ? populated : populated[0];

    return document;
  }

  /**
   * Chunk large arrays for processing
   */
  static chunkArray(array, chunkSize = 100) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Parallel processing with concurrency limit
   */
  static async parallelProcess(items, processor, concurrency = 5) {
    const results = [];
    const chunks = this.chunkArray(items, concurrency);

    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(item => processor(item))
      );
      results.push(...chunkResults);
    }

    return results;
  }
}

module.exports = LazyLoader;
