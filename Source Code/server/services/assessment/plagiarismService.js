const { detectPlagiarism } = require('../../utils/plagiarismDetector');

/**
 * Plagiarism Service — batch plagiarism detection with concurrency control
 */

/**
 * Compare a target submission against a list of other submissions
 * Uses controlled concurrency to avoid N+1 sequential calls
 */
const batchDetectPlagiarism = async (targetCode, others, options = {}) => {
  const { useAI = false, starterCode = '', concurrency = 5 } = options;

  // Simple concurrency limiter
  const results = [];
  for (let i = 0; i < others.length; i += concurrency) {
    const batch = others.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(
      batch.map(other =>
        detectPlagiarism(targetCode, other.code, { useAI, starterCode })
          .then(result => ({ otherId: other._id, ...result }))
      )
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error('Plagiarism comparison failed:', result.reason?.message);
      }
    }
  }

  return results;
};

module.exports = {
  batchDetectPlagiarism
};
