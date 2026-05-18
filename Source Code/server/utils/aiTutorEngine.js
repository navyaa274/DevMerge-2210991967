const { generateWithOllama } = require('./aiService');
const ChatSession = require('../models/communication/ChatSession');
const StudentWeakness = require('../models/analytics/StudentWeakness');

/**
 * AI Tutor Engine with adaptive learning
 */
class AITutorEngine {
    constructor() {
        this.modes = {
            ExplainConcept: 'Detailed explanation with examples',
            SolveDoubt: 'Step-by-step problem solving',
            PrepareExam: 'Focused revision and important topics',
            GenerateNotes: 'Structured notes generation',
            PracticeQuestions: 'Generate practice problems',
            ReviseQuickly: 'Quick revision with key points',
            SocraticMode: 'Guided learning through questions',
            General: 'General tutoring'
        };
    }

    /**
     * Process student message and generate response
     */
    async processMessage(config) {
        const {
            studentId,
            message,
            sessionId,
            mode = 'General',
            course,
            semester,
            subject,
            topic
        } = config;

        try {
            // Get or create session
            let session = sessionId
                ? await ChatSession.findById(sessionId)
                : await this.createSession(studentId, { mode, course, semester, subject, topic });

            // Detect student level if not set
            if (!session.detectedLevel || session.detectedLevel === 'Average') {
                session.detectedLevel = await this.detectStudentLevel(studentId, subject);
            }

            // Get student weaknesses
            const weaknesses = await this.getStudentWeaknesses(studentId, course);

            // Build context-aware prompt
            let ragContext = "";
            if (course || topic) {
                try {
                    const { retrieveContext } = require('./vectorRetriever');
                    const contextResults = await retrieveContext(message, { courseId: course }, 3);
                    if (contextResults && contextResults.length > 0) {
                        ragContext = contextResults.map(c => c.content).join("\n---\n");
                    }
                } catch (ragError) {
                    console.warn("RAG retrieval failed, proceeding with base context", ragError.message);
                }
            }

            const prompt = this.buildTutorPrompt({
                message,
                mode: session.mode,
                level: session.detectedLevel,
                course,
                semester,
                subject,
                topic,
                conversationHistory: session.messages.slice(-5), // Last 5 messages
                weaknesses,
                ragContext
            });

            // Generate AI response
            const aiResponse = await generateWithOllama(prompt, 'llama3.2:latest');

            // Parse response for metadata
            const parsedResponse = this.parseResponse(aiResponse);

            // Update session
            session.messages.push(
                { role: 'user', content: message, timestamp: new Date() },
                {
                    role: 'assistant',
                    content: parsedResponse.content,
                    timestamp: new Date(),
                    metadata: parsedResponse.metadata
                }
            );

            session.messageCount = session.messages.length;

            // Track concepts
            if (parsedResponse.metadata.conceptExplained) {
                session.conceptsCovered.push(parsedResponse.metadata.conceptExplained);
            }

            await session.save();

            // Update weakness analysis if needed
            if (parsedResponse.metadata.weaknessDetected) {
                await this.updateWeakness(studentId, course, topic, parsedResponse.metadata);
            }

            return {
                response: parsedResponse.content,
                metadata: parsedResponse.metadata,
                sessionId: session._id,
                detectedLevel: session.detectedLevel
            };

        } catch (error) {
            console.error('AI Tutor Error:', error);
            throw error;
        }
    }

    /**
     * Build comprehensive tutor prompt
     */
    buildTutorPrompt(config) {
        const {
            message,
            mode,
            level,
            course,
            semester,
            subject,
            topic,
            conversationHistory,
            weaknesses
        } = config;

        let systemPrompt = `You are an expert AI tutor for university students.

STUDENT CONTEXT:
- Course: ${course || 'General'}
- Semester: ${semester || 'N/A'}
- Subject: ${subject || 'General'}
- Topic: ${topic || 'General'}
- Student Level: ${level}
- Teaching Mode: ${mode}

`;

        // Add RAG context
        if (config.ragContext) {
            systemPrompt += `\nRELEVANT COURSE MATERIAL (Syllabus/Manuals):
${config.ragContext}

Use the above material to ensure your explanation follows the university curriculum.
`;
        }

        // Add mode-specific instructions
        systemPrompt += this.getModeInstructions(mode, level);

        // Add weakness context
        if (weaknesses && weaknesses.length > 0) {
            systemPrompt += `\nSTUDENT WEAK AREAS:
${weaknesses.map(w => `- ${w.topic}: ${w.severity} severity`).join('\n')}

Be extra careful when explaining these topics. Use simpler language and more examples.
`;
        }

        // Add conversation history
        if (conversationHistory && conversationHistory.length > 0) {
            systemPrompt += `\nRECENT CONVERSATION:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}
`;
        }

        systemPrompt += `\nSTUDENT QUESTION: ${message}

RESPONSE GUIDELINES:
1. Adapt explanation to ${level} level
2. Use real-world examples
3. Break down complex concepts
4. Ask guiding questions if in Socratic mode
5. Provide code examples when relevant
6. Suggest practice problems
7. Be encouraging and supportive

Respond naturally and helpfully.`;

        return systemPrompt;
    }

    /**
     * Get mode-specific instructions
     */
    getModeInstructions(mode, level) {
        const instructions = {
            ExplainConcept: `MODE: Explain Concept
- Start with a simple definition
- Provide real-world analogy
- Give step-by-step explanation
- Include code examples
- End with a summary
- Suggest related concepts`,

            SolveDoubt: `MODE: Solve Doubt
- Understand the specific confusion
- Break down the problem
- Explain step-by-step
- Show multiple approaches if possible
- Verify understanding with a question`,

            PrepareExam: `MODE: Exam Preparation
- Focus on important topics
- Provide short, crisp notes
- List common exam questions
- Give quick revision tips
- Highlight key formulas/concepts`,

            GenerateNotes: `MODE: Generate Notes
- Create structured notes
- Use bullet points
- Include definitions, examples, and diagrams
- Add important points to remember
- Provide summary at the end`,

            PracticeQuestions: `MODE: Practice Questions
- Generate 3-5 practice problems
- Vary difficulty levels
- Include solutions
- Explain the approach`,

            ReviseQuickly: `MODE: Quick Revision
- Provide concise summary
- List key points only
- Use mnemonics if helpful
- Quick recall questions`,

            SocraticMode: `MODE: Socratic Teaching
- Don't give direct answers
- Ask guiding questions
- Lead student to discover answer
- Encourage critical thinking
- Provide hints, not solutions`,

            General: `MODE: General Tutoring
- Be conversational and helpful
- Adapt to student's needs
- Provide comprehensive answers`
        };

        return instructions[mode] || instructions.General;
    }

    /**
     * Parse AI response for metadata
     */
    parseResponse(response) {
        const metadata = {
            conceptExplained: null,
            questionAsked: false,
            codeProvided: false,
            quizGenerated: false,
            weaknessDetected: false
        };

        // Detect if code is provided
        if (response.includes('```') || response.includes('function') || response.includes('def ')) {
            metadata.codeProvided = true;
        }

        // Detect if question is asked
        if (response.includes('?')) {
            metadata.questionAsked = true;
        }

        // Extract concept if mentioned
        const conceptMatch = response.match(/(?:concept|topic|about)\s+(?:of\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
        if (conceptMatch) {
            metadata.conceptExplained = conceptMatch[1];
        }

        return {
            content: response,
            metadata
        };
    }

    /**
     * Detect student level from performance
     */
    async detectStudentLevel(studentId, subject) {
        try {
            const weakness = await StudentWeakness.findOne({ student: studentId });

            if (!weakness) return 'Average';

            const overallProgress = weakness.overallProgress || 50;

            if (overallProgress < 40) return 'Weak';
            if (overallProgress > 70) return 'Advanced';
            return 'Average';

        } catch (error) {
            return 'Average';
        }
    }

    /**
     * Get student weaknesses
     */
    async getStudentWeaknesses(studentId, course) {
        try {
            const weakness = await StudentWeakness.findOne({
                student: studentId,
                course
            });

            if (!weakness) return [];

            return weakness.weakTopics
                .filter(w => w.severity === 'Critical' || w.severity === 'High')
                .slice(0, 5);

        } catch (error) {
            return [];
        }
    }

    /**
     * Create new chat session
     */
    async createSession(studentId, config) {
        const session = new ChatSession({
            student: studentId,
            mode: config.mode,
            course: config.course && config.course.trim() !== '' ? config.course : undefined,
            semester: config.semester,
            subject: config.subject,
            topic: config.topic,
            messages: [],
            conceptsCovered: [],
            weakTopics: [],
            strongTopics: [],
            questionsAsked: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            messageCount: 0
        });

        await session.save();
        return session;
    }

    /**
     * Update student weakness
     */
    async updateWeakness(studentId, course, topic, metadata) {
        try {
            let weakness = await StudentWeakness.findOne({
                student: studentId,
                course
            });

            if (!weakness) {
                weakness = new StudentWeakness({
                    student: studentId,
                    course,
                    weakTopics: [],
                    masteryScores: [],
                    commonMistakes: [],
                    recommendedActions: []
                });
            }

            // Add or update weak topic
            const existingTopic = weakness.weakTopics.find(w => w.topic === topic);

            if (existingTopic) {
                existingTopic.attempts += 1;
                existingTopic.lastAttempt = new Date();
            } else {
                weakness.weakTopics.push({
                    topic,
                    subject: metadata.subject,
                    severity: 'Medium',
                    attempts: 1,
                    successRate: 0,
                    lastAttempt: new Date()
                });
            }

            weakness.lastAnalyzed = new Date();
            await weakness.save();

        } catch (error) {
            console.error('Update Weakness Error:', error);
        }
    }

    /**
     * Generate mini quiz
     */
    async generateQuiz(topic, difficulty, count = 3) {
        const prompt = `Generate ${count} practice questions on ${topic} at ${difficulty} difficulty level.

Format as JSON:
{
    "questions": [
        {
            "question": "Question text",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "A",
            "explanation": "Why this is correct"
        }
    ]
}`;

        try {
            const response = await generateWithOllama(prompt, 'llama3.2:latest');
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return { questions: [] };
        } catch (error) {
            return { questions: [] };
        }
    }
}

module.exports = new AITutorEngine();
