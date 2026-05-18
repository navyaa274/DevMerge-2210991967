const Embedding = require('../models/admin/Embedding');
const { generateEmbedding } = require('./embeddingService');

/**
 * Vector Retriever Service
 * Implements MongoDB Vector Search to find relevant context
 */
exports.retrieveContext = async (query, filters = {}, limit = 5) => {
    try {
        // 1. Generate embedding for current query
        const queryVector = await generateEmbedding(query);

        // 2. Execute MongoDB Atlas Vector Search
        // Note: This requires an Atlas Vector Index named 'default' on the Embedding collection
        const results = await Embedding.aggregate([
            {
                $vectorSearch: {
                    index: "embedding_index",
                    path: "embedding",
                    queryVector: queryVector,
                    numCandidates: 100,
                    limit: limit,
                    filter: filters // e.g. { courseId: courseId }
                }
            },
            {
                $project: {
                    content: 1,
                    sourceType: 1,
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]);

        return results;
    } catch (error) {
        console.error('Vector Retrieval Error:', error.message);
        return []; // Return empty context to allow fallback to base LLM
    }
};
