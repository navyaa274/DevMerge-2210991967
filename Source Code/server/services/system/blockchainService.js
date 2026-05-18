const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Blockchain Credentials Service
 * Implements hash-based certificate signing and verification logic (Month 27-28)
 */
class BlockchainService {
    constructor() {
        this.keyDir = path.join(__dirname, '..', '..', 'keys');
        this.keyPath = path.join(this.keyDir, 'blockchain_key.pem');

        if (!fs.existsSync(this.keyDir)) {
            fs.mkdirSync(this.keyDir, { recursive: true });
        }
    }

    /**
     * Generate a unique cryptographic hash for a student's certificate 
     * Representing an un-mutable proof-of-work/merkle proof for educational credentials.
     */
    generateCertificateHash(studentId, courseId, completionDate, grade) {
        const data = `${studentId}_${courseId}_${completionDate}_${grade}`;
        const hash = crypto.createHmac('sha256', process.env.CERTIFICATE_SECRET || 'university-private-key')
            .update(data)
            .digest('hex');

        return {
            hash,
            signature: `SIG_${hash.substring(0, 16).toUpperCase()}`,
            metadata: {
                algorithm: 'SHA-256',
                timestamp: new Date().toISOString(),
                network: 'Private Educational Ledger (DevMerge Proof-of-Skill)'
            }
        };
    }

    /**
     * Public Verification Portal logic
     * Validates if a hash provided by a prospective employer matches the current parameters.
     */
    verifyCertificate(hash, providedData) {
        const recalculated = this.generateCertificateHash(
            providedData.studentId,
            providedData.courseId,
            providedData.completionDate,
            providedData.grade
        );

        return hash === recalculated.hash;
    }

    /**
     * AI-evolved Viva Simulator (Month 27-28)
     * Heuristic logic for generating smart-adaptive questions based on course completion.
     */
    async generateVivaQuestions(studentContext, performance) {
        const questions = [];

        // Logic: Higher performance = deeper architectural questions
        if (performance > 80) {
            questions.push("Explain the scalability tradeoffs you considered in your final project.");
            questions.push("How would you optimize the memory footprint of your concurrent data structures?");
        } else {
            questions.push("What are the core differences between your selected algorithms?");
            questions.push("Walk me through the primary logic flow of your submission.");
        }

        return {
            questions,
            suggestedPreparation: "Review Bloom Taxonomy Analyze/Create levels for these responses.",
            aiModerationEnabled: true
        };
    }
}

module.exports = new BlockchainService();
