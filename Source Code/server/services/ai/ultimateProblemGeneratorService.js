const axios = require('axios');
const Course = require('../../models/academic/Course');
const Program = require('../../models/academic/Program');
const LabManual = require('../../models/assessment/labs/LabManual');
const Problem = require('../../models/assessment/problems/Problem');
const Embedding = require('../../models/admin/Embedding');
const { generateEmbedding } = require('../../utils/embeddingService');

/**
 * Ultimate Problem & Lab Generator Service
 * Implements AI-driven academic content generation with curriculum awareness
 */
class UltimateProblemGeneratorService {
    constructor() {
        this.aiConfig = {
            model: process.env.FACULTY_COPILOT_MODEL || 'llama3.2:1b',
            baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/api/generate',
            groqKey: process.env.GROQ_API_KEY
        };
    }

    /**
     * Internal method to call AI (Groq or Ollama)
     */
    async _callAI(prompt, systemPrompt = "You are an expert AI academic architect.") {
        if (this.aiConfig.groqKey) {
            try {
                const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt + "\n\nCRITICAL: Respond ONLY with valid JSON." }
                    ],
                    temperature: 0.1, // Lower temperature for more consistent JSON
                    response_format: { type: 'json_object' }
                }, {
                    headers: { 'Authorization': `Bearer ${this.aiConfig.groqKey}` },
                    timeout: 20000
                });

                const content = response.data.choices[0].message.content;
                return typeof content === 'string' ? JSON.parse(content) : content;
            } catch (error) {
                console.error("[AI Service] Groq Error:", error.response?.data?.error?.message || error.message);
            }
        }

        try {
            const response = await axios.post(this.aiConfig.baseUrl, {
                model: this.aiConfig.model,
                prompt: `System: ${systemPrompt}\nUser: ${prompt}\nOutput only valid JSON.`,
                stream: false,
                format: 'json'
            }, { timeout: 30000 });
            return JSON.parse(response.data.response);
        } catch (error) {
            console.error("[AI Service] Both Groq and Ollama failed. Check your API keys and local server.", error.message);
            throw new Error("AI Generation unavailable at this moment.");
        }
    }

    /**
     * Generate a full Lab Manual for a specific course/subject
     */
    async generateLabManual(options) {
        const {
            programCode,
            semester,
            subjectName,
            topic,
            difficulty = 'Medium',
            labNumber = 1,
            userId
        } = options;

        console.log(`[UltimateGen] Generating Lab ${labNumber} for ${subjectName}: ${topic}`);

        let ragContext = "";
        try {
            const queryVector = await generateEmbedding(`${subjectName} ${topic}`);
            const matches = await Embedding.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: queryVector,
                        numCandidates: 10,
                        limit: 3
                    }
                }
            ]);
            ragContext = matches.map(m => m.content).join("\n---\n");
        } catch (e) {
            console.warn("[UltimateGen] RAG search skipped:", e.message);
        }

        const prompt = `
            Task: Generate a structured academic Lab Manual experiment.
            Subject: ${subjectName}, Topic: ${topic}, Sem: ${semester}, Diff: ${difficulty}
            Context: ${ragContext}
            Return JSON: {
                "title": "String",
                "aim": "String",
                "learningOutcomes": ["String"],
                "theory": "Markdown String",
                "algorithm": "String",
                "code": {"python": "String", "javascript": "String", "cpp": "String", "java": "String"},
                "sampleOutput": "String",
                "vivaQuestions": [{"question": "String", "answer": "String", "difficulty": "Basic|Intermediate|Advanced"}],
                "industrialApplication": "String",
                "realWorldUseCase": "String",
                "prerequisites": ["String"]
            }
        `;

        const labData = await this._callAI(prompt, "Senior University Professor. Industry relevant labs.");

        const newLab = new LabManual({
            ...labData,
            labNumber,
            semester,
            difficulty,
            createdBy: userId,
            isAiGenerated: true,
            status: 'Draft',
            labType: 'Programming'
        });

        const course = await Course.findOne({ name: new RegExp(subjectName, 'i'), semester });
        if (course) {
            newLab.course = course._id;
            newLab.assignedTo = [course._id];
        }

        await newLab.save();
        return newLab;
    }

    /**
     * Generate a Coding Problem / Assignment
     */
    async generateProblem(options) {
        const { subjectName, topic, difficulty = 'Medium', userId } = options;

        const prompt = `
            Task: Generate a Competitive Coding Problem.
            Subject: ${subjectName}, Topic: ${topic}, Difficulty: ${difficulty}
            Return JSON: {
                "title": "String",
                "description": "String",
                "constraints": "String",
                "examples": [{"input": "String", "output": "String", "explanation": "String"}],
                "hints": ["String"],
                "testCases": [{"input": "String", "output": "String", "weight": 10}],
                "starterCode": {"python": "String", "java": "String", "javascript": "String", "cpp": "String"}
            }
        `;

        const problemData = await this._callAI(prompt, "Expert Competitive Programmer. LeetCode style.");

        const problem = new Problem({
            ...problemData,
            difficulty,
            topics: [topic],
            createdBy: userId,
            isAiGenerated: true,
            category: 'problem',
            status: 'Published'
        });

        await problem.save();
        return problem;
    }

    /**
     * Get semester status and subjects
     */
    async getSemesterOverview(programCode, semester) {
        const program = await Program.findOne({ code: programCode });
        if (!program) throw new Error("Program not found");

        const courses = await Course.find({ program: program._id, semester });
        const labs = await LabManual.find({ semester, course: { $in: courses.map(c => c._id) } });

        return {
            program: program.name,
            semester,
            courses: courses.map(c => ({
                id: c._id,
                name: c.name,
                code: c.code,
                labCount: labs.filter(l => l.course?.toString() === c._id.toString()).length
            }))
        };
    }
}

module.exports = new UltimateProblemGeneratorService();
