const stringSimilarity = require('string-similarity');
const { checkPlagiarism: callAIPlagiarism } = require('./aiService');

/**
 * Intelligent Plagiarism Detector
 * Combines structural analysis with AI for high-fidelity detection
 */
const detectPlagiarism = async (code1, code2, options = {}) => {
  const {
    useAI = false,
    aiThreshold = 75,
    starterCode = ""
  } = options;

  // Basic normalization
  const normalize = (code) => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  /**
   * Create a structural signature that ignores variable names
   * Catching "Search & Replace" plagiarism
   */
  const createStructuralSignature = (code) => {
    let sig = code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .replace(/(["'])(?:[^"'\\]|\\.)*\1/g, 'STR')
      .replace(/`(?:[^`\\]|\\.)*`/g, 'STR')
      .replace(/\b\d+(\.\d+)?\b/g, 'NUM')
      .replace(/\s+/g, '');

    const keywords = [
      'function', 'return', 'if', 'else', 'for', 'while', 'let', 'const', 'var',
      'class', 'new', 'try', 'catch', 'finally', 'throw', 'async', 'await'
    ];

    sig = sig.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g, (match) => {
      if (keywords.includes(match)) return match;
      return 'ID';
    });

    return sig;
  };

  // 1. Template-Aware Filtering (Subtract starter code if provided)
  const filterStarter = (code, starter) => {
    if (!starter) return code;
    const normStarter = normalize(starter);
    if (!normStarter) return code;

    // Simple heuristic: if code contains starter exactly, it's weighted down
    return code.replace(normStarter, '');
  };

  const processed1 = filterStarter(code1, starterCode);
  const processed2 = filterStarter(code2, starterCode);

  const normalized1 = normalize(processed1);
  const normalized2 = normalize(processed2);

  const sig1 = createStructuralSignature(processed1);
  const sig2 = createStructuralSignature(processed2);

  // 2. Statistical Similarity
  const exactSim = stringSimilarity.compareTwoStrings(normalized1, normalized2);
  const structuralSim = stringSimilarity.compareTwoStrings(sig1, sig2);

  let score = Math.round(((exactSim * 0.3) + (structuralSim * 0.7)) * 100);
  let aiDeepAnalysis = null;

  // 3. AI Deep Analysis for Marginal/High Similarity
  if (useAI && score > aiThreshold) {
    try {
      const aiResult = await callAIPlagiarism(code1, code2);
      score = aiResult.similarityScore;
      aiDeepAnalysis = aiResult.explanation;
    } catch (error) {
      console.warn('Plagiarism AI service unavailable, sticking to structural score');
    }
  }

  let severity = 'Low';
  if (score >= 85) severity = 'Critical';
  else if (score >= 70) severity = 'High';
  else if (score >= 50) severity = 'Medium';

  return {
    score,
    severity,
    aiDeepAnalysis,
    details: {
      exactMatchScore: Math.round(exactSim * 100),
      structuralMatchScore: Math.round(structuralSim * 100)
    }
  };
};

module.exports = { detectPlagiarism };
