/**
 * Text Chunker Utility
 * Slices academic content into overlapping fragments
 */
exports.chunkText = (text, chunkSize = 1000, overlap = 200) => {
    if (!text) return [];

    const chunks = [];
    let i = 0;

    while (i < text.length) {
        // Slice chunk
        const chunk = text.slice(i, i + chunkSize);
        chunks.push(chunk);

        // Move index by chunkSize minus overlap to preserve context
        i += (chunkSize - overlap);

        // Safety break for tiny overlaps or strings
        if (i <= 0) break;
    }

    return chunks;
};
