const CopilotUsageLog = require('../../models/analytics/CopilotUsageLog');
const aiService = require('../../utils/aiService');

/**
 * Faculty Copilot Service
 * Central AI interface for faculty automation tools
 * Implements Phase 4 Item 34 (Copilot Hub) and Item 31 (Ultimate Problem Gen)
 */
exports.generateCopilotContent = async (facultyId, courseId, promptPayload, actionType, options = { useQueue: false }) => {
    // 0. Queue Check (Stub for heavy background jobs)
    if (options.useQueue) {
        // Future: Integration with Redis/Bull for long-running generation
    }

    const { system, context, instruction } = promptPayload;

    // Construct robust prompts for structured output
    const systemPrompt = `${system}\n\nStrict Output Requirement: Return ONLY clean JSON in the requested schema. No conversational filler.`;
    const userPrompt = `CONTEXT:\n${context || 'No additional context'}\n\nACTION: ${instruction}`;

    try {
        // 1. Leverage Tiered AI (Ollama -> Groq) via aiService
        const aiResponse = await aiService.callAI(systemPrompt, userPrompt);

        if (!aiResponse) {
            throw new Error('AI failed to provide a timely response');
        }

        // 2. Advanced JSON Extraction
        let structuredData = null;
        try {
            // Standard path
            const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            structuredData = JSON.parse(cleanJson);
            console.log('Successfully parsed JSON from AI response');
        } catch (e) {
            console.log('Failed to parse JSON, trying fallback methods:', e.message);
            
            // Heuristic fallback: Find matches for { } or [ ]
            const braceMatch = aiResponse.match(/\{[\s\S]*\}/);
            const bracketMatch = aiResponse.match(/\[[\s\S]*\}/);

            if (braceMatch) {
                try {
                    structuredData = JSON.parse(braceMatch[0]);
                    console.log('Successfully parsed JSON from brace match');
                } catch (braceError) {
                    console.log('Failed to parse brace match:', braceError.message);
                }
            }
            else if (bracketMatch) {
                try {
                    structuredData = JSON.parse(bracketMatch[0]);
                    console.log('Successfully parsed JSON from bracket match');
                } catch (bracketError) {
                    console.log('Failed to parse bracket match:', bracketError.message);
                }
            }

            // If still no structured data, create a fallback structure
            if (!structuredData) {
                console.log('No JSON found, creating fallback structure from HTML/text response');
                structuredData = {
                    title: "Generated Problem",
                    description: aiResponse,
                    difficulty: "Medium",
                    examples: [],
                    constraints: "",
                    testCases: [],
                    isHtmlFormat: true // Flag to indicate this is HTML format
                };
            }
        }

        // 3. Governance Logging (Phase 8 Audit requirement)
        await CopilotUsageLog.create({
            faculty: (facultyId !== 'system' && facultyId !== 'ADMIN') ? facultyId : null,
            course: courseId !== 'unknown' ? courseId : null,
            actionType,
            promptSize: (systemPrompt.length + userPrompt.length),
            generationSize: aiResponse ? aiResponse.length : 0,
            metadata: {
                status: 'success',
                modelUsed: 'DevMerge-Tiered-AI'
            }
        });

        return structuredData;

    } catch (error) {
        console.error(`[Copilot Service Error]: ${error.message}`);

        // Detailed audit of failures
        await CopilotUsageLog.create({
            faculty: (facultyId !== 'system' && facultyId !== 'ADMIN') ? facultyId : null,
            course: courseId !== 'unknown' ? courseId : null,
            actionType,
            metadata: {
                status: 'error',
                error: error.message
            }
        });

        throw error;
    }
};
