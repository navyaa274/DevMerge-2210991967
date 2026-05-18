const aiService = require('./aiService');

/**
 * AI Tutor Service
 * Logic for interacting with the AI engine (Groq primary)
 */
exports.generateTutorResponse = async (promptPayload, studentQuestion, chatHistory = []) => {
    try {
        // 1. Format Chat History
        const conversationHistory = chatHistory.map(m => ({
            role: m.role === 'ai' ? 'assistant' : 'user',
            content: m.content
        }));

        // 2. Prepare Messages for Groq
        const messages = [
            { role: 'system', content: `${promptPayload.system}\n\n${promptPayload.context}` },
            ...conversationHistory,
            { role: 'user', content: studentQuestion }
        ];

        // 3. Leverage Consolidated AI Service
        const aiResponse = await aiService.aiChatbot(chatHistory.concat({ role: 'user', content: studentQuestion }));

        return {
            answer: aiResponse,
            model: 'groq-llama-3.3-70b',
            tokenCount: Math.ceil(aiResponse.length / 4) // Simplified heuristic
        };
    } catch (error) {
        console.error('AI Tutor Generation Error:', error.message);
        throw new Error('Intelligence Engine is momentarily offline. Please try again shortly.');
    }
};
