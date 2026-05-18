const crypto = require('crypto');
const ExecutionLog = require('../../models/analytics/ExecutionLog'); // ing token usage store for now

class AIGovernanceService {
    /**
     * 1. Prompt Injection Detection (Heuristics + Semantic)
     * Prevents students from explicitly telling AI to "ignore previous instructions"
     * and providing direct exam answers.
     */
    static detectInjection(prompt) {
        const maliciousPatterns = [
            /ignore (all )?previous (instructions|prompts|directions)/i,
            /you are now a (developer|hacker|root)/i,
            /tell me the (exact )?answer/i,
            /bypass (rules|guidelines)/i,
            /forget everything/i,
            /print your system prompt/i,
            /what is your initial prompt/i
        ];

        for (const pattern of maliciousPatterns) {
            if (pattern.test(prompt)) {
                return {
                    safe: false,
                    reason: `Blocked by AI Safety Governance: Potential injection pattern matched ${pattern}`
                };
            }
        }
        return { safe: true };
    }

    /**
     * 2. Token Usage Estimator
     * Rough heuristic: ~4 characters per token
     */
    static estimateTokens(text) {
        if (!text) return 0;
        return Math.ceil(text.length / 4);
    }

    /**
     * 3. Response Caching Logic
     * Exact Match Cache for heavy repetitive query offloading
     */
    static generateCacheKey(context, prompt) {
        const combined = `${context}_${prompt}`.trim().toLowerCase();
        return crypto.createHash('sha256').update(combined).digest('hex');
    }

    /**
     * 4. Hallucination Confidence Scoring
     * Analyzes AI response string for expressions of uncertainty to penalize score
     */
    static scoreConfidence(responseText) {
        const uncertaintyMarkers = [
            'i think', 'maybe', 'not sure', 'possibly', 'could be', 'might',
            'i am an ai', 'i do not have direct access', 'it appears'
        ];

        let confidence = 100;
        let markersFound = 0;

        const lowerResponse = responseText.toLowerCase();

        // Deduct points for each expression of uncertainty
        uncertaintyMarkers.forEach(marker => {
            if (lowerResponse.includes(marker)) {
                confidence -= 10;
                markersFound++;
            }
        });

        // Floor confidence at 10%
        return {
            confidenceScore: Math.max(10, confidence),
            hallucinationRisk: markersFound > 3 ? 'High' : (markersFound > 1 ? 'Medium' : 'Low'),
            markersDetected: markersFound
        };
    }

}

module.exports = AIGovernanceService;
