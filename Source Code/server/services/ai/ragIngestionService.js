const Embedding = require('../../models/admin/Embedding');
const { generateEmbedding } = require('../../utils/embeddingService');
const { chunkText } = require('../../utils/textChunker');

/**
 * RAG Ingestion Service
 * Transforms raw content into searchable vectors
 */
exports.ingestContent = async (sourceId, sourceType, text, metadata = {}) => {
    try {
        console.log(`[RAG] Starting ingestion for ${sourceType}: ${sourceId}`);

        // 1. Clear existing vectors for this source (to allow updates)
        await Embedding.deleteMany({ sourceId });

        // 2. Fragment content
        const chunks = chunkText(text);
        console.log(`[RAG] Generated ${chunks.length} chunks`);

        // 3. Vectorize and Store
        const { courseId, departmentId, ...otherMetadata } = metadata;

        const embeddingNodes = await Promise.all(chunks.map(async (chunk, index) => {
            const vector = await generateEmbedding(chunk);

            return {
                sourceId,
                sourceType,
                courseId,
                departmentId,
                content: chunk,
                embedding: vector,
                metadata: {
                    ...otherMetadata,
                    chunkIndex: index,
                    tokens: chunk.length / 4
                }
            };
        }));

        await Embedding.insertMany(embeddingNodes);
        console.log(`[RAG] Successfully ingested ${embeddingNodes.length} nodes for ${sourceId}`);

        return true;
    } catch (error) {
        console.error(`[RAG] Ingestion Failed:`, error.message);
        return false;
    }
};
