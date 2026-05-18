const axios = require('axios');
const ultimateGenService = require('./ultimateProblemGeneratorService');
const Embedding = require('../../models/admin/Embedding');
const { generateEmbedding } = require('../../utils/embeddingService');

/**
 * AI Tutor Service
 * Provides pedagogical support for students via interactive explanations and code hinting
 */
class AiTutorService {
    /**
     * Explain a concept using RAG (Retrieval Augmented Generation)
     */
    async explainConcept(query, courseId) {
        let context = "";
        try {
            const vector = await generateEmbedding(query);
            const matches = await Embedding.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: vector,
                        numCandidates: 10,
                        limit: 3
                    }
                }
            ]);
            context = matches.map(m => m.content).join("\n---\n");
        } catch (e) {
            console.warn("[AiTutor] RAG Context retrieval failed:", e.message);
        }

        const prompt = `
            Student Query: ${query}
            Relevant Academic Context:
            ${context}
            
            Task: Explain this concept clearly.
            Rules:
            1. Use a pedagogical tone ("Think of it as...", "Here is an analogy...").
            2. Break it down into: Simple Explanation, Technical Deep Dive, and a Practice Question.
            3. If context is provided, prioritize facts from the context.
        `;

        return await ultimateGenService._callAI(prompt, "You are a friendly, expert AI Teaching Assistant at a top university.");
    }

    /**
     * Analyze student code and provide progressive hints
     */
    async getCodeHint(problemDescription, studentCode, language) {
        const prompt = `
            Problem Description: ${problemDescription}
            Language: ${language}
            Student's Current Code:
            \`\`\`${language}
            ${studentCode}
            \`\`\`
            
            Task: Provide 3 progressive hints for the student.
            Hint 1: A subtle nudge (Logical/High-level).
            Hint 2: A bit more specific (Focus on the part that might be failing).
            Hint 3: A near-solution description (Explain exactly what syntax/logic is missing).
            
            Constraint: NEVER provide the full corrected code. Guide them to solve it.
            Return JSON: { "hints": ["String", "String", "String"], "analysis": "Brief analysis of where they are stuck" }
        `;

        return await ultimateGenService._callAI(prompt, "You are an expert Coding Tutor. You help students find bugs without giving them the direct answer.");
    }
}

module.exports = new AiTutorService();
