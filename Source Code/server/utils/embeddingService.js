const axios = require('axios');

/**
 * Embedding Service
 * Connects to local Ollama instance for vector generation
 */
exports.generateEmbedding = async (text) => {
    try {
        const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
        const response = await axios.post(`${ollamaUrl}/api/embeddings`, {
            model: 'nomic-embed-text', // Or another local embedding model
            prompt: text
        }, { timeout: 3000 }); // Short timeout for fallback
        return response.data.embedding;
    } catch (error) {
        console.warn('⚠️  Ollama Embedding Unavailable, using neutral fallback vector.', error.message);
        // Return a zero vector of typical size (768 for nomic/llama) to prevent crashes
        return new Array(768).fill(0);
    }
};
