const { generateWithOllama } = require('./aiService');

/**
 * Generate ultimate lab manual with full structure
 */
async function generateUltimateLab(config) {
    const {
        course = 'BTech_CSE',
        semester = 3,
        subject = 'Data Structures',
        topic = 'Linked Lists',
        labType = 'Programming',
        difficulty = 'Medium',
        labNumber = 1
    } = config;

    const prompt = buildLabPrompt(config);

    try {
        const response = await generateWithOllama(prompt, 'llama3.2:latest');
        const labData = parseLabResponse(response);

        return {
            ...labData,
            labNumber,
            course,
            semester,
            subject,
            labType,
            difficulty
        };
    } catch (error) {
        console.error('Lab Generation Error:', error);
        throw error;
    }
}

/**
 * Build comprehensive lab generation prompt
 */
function buildLabPrompt(config) {
    const {
        course,
        semester,
        subject,
        topic,
        labType,
        difficulty
    } = config;

    return `You are an expert university professor creating a comprehensive lab manual.

ACADEMIC CONTEXT:
- Course: ${course}
- Semester: ${semester}
- Subject: ${subject}
- Topic: ${topic}
- Lab Type: ${labType}
- Difficulty: ${difficulty}

Create a COMPLETE lab manual with the following structure in JSON format:

{
    "title": "Lab title",
    "aim": "Clear objective of the lab",
    "learningOutcomes": [
        "What students will learn",
        "Skills they will develop"
    ],
    "courseOutcomes": [
        {
            "code": "CO1",
            "description": "Course outcome description"
        }
    ],
    "programOutcomes": [
        {
            "code": "PO1",
            "correlation": "High"
        }
    ],
    "theory": "Detailed theoretical explanation of the concept (minimum 300 words)",
    "algorithm": "Step-by-step algorithm",
    "code": {
        "javascript": "Complete working JavaScript code with comments",
        "python": "Complete working Python code with comments",
        "cpp": "Complete working C++ code with comments",
        "java": "Complete working Java code with comments"
    },
    "sampleOutput": "Expected output with explanation",
    "vivaQuestions": [
        {
            "question": "Viva question",
            "difficulty": "Basic",
            "answer": "Detailed answer"
        },
        {
            "question": "Intermediate question",
            "difficulty": "Intermediate",
            "answer": "Detailed answer"
        },
        {
            "question": "Advanced question",
            "difficulty": "Advanced",
            "answer": "Detailed answer"
        }
    ],
    "commonMistakes": [
        {
            "mistake": "Common error students make",
            "explanation": "Why this happens",
            "solution": "How to fix it"
        }
    ],
    "industrialApplication": "How this concept is used in real industry (minimum 200 words)",
    "realWorldUseCase": "Specific real-world example",
    "flowExplanation": "Explain the algorithm flow as if drawing a flowchart",
    "prerequisites": ["Required knowledge"],
    "references": ["Books, articles, websites"],
    "estimatedTime": 120
}

IMPORTANT:
1. Make theory comprehensive and educational
2. Include working code in all 4 languages
3. Create 6-8 viva questions covering all difficulty levels
4. Provide practical, industry-relevant applications
5. Include at least 3 common mistakes
6. Make it suitable for ${difficulty} difficulty level
7. Ensure code is production-quality with proper comments

Generate the complete lab manual now.`;
}

/**
 * Parse lab response
 */
function parseLabResponse(response) {
    try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in response');
        }

        const labData = JSON.parse(jsonMatch[0]);

        // Validate required fields
        const required = ['title', 'aim', 'theory', 'code'];
        for (const field of required) {
            if (!labData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Ensure arrays exist
        labData.learningOutcomes = labData.learningOutcomes || [];
        labData.courseOutcomes = labData.courseOutcomes || [];
        labData.programOutcomes = labData.programOutcomes || [];
        labData.vivaQuestions = labData.vivaQuestions || [];
        labData.commonMistakes = labData.commonMistakes || [];
        labData.prerequisites = labData.prerequisites || [];
        labData.references = labData.references || [];

        // Set default grading rubric
        labData.gradingRubric = {
            implementation: 40,
            understanding: 20,
            viva: 20,
            recordWork: 10,
            innovation: 10
        };

        return labData;
    } catch (error) {
        console.error('Parse Lab Error:', error);
        throw new Error('Failed to parse lab response: ' + error.message);
    }
}

/**
 * Generate viva quiz from lab
 */
function generateVivaQuiz(lab, count = 5) {
    const questions = lab.vivaQuestions || [];
    
    // Shuffle and select random questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Generate lab series (multiple labs for a subject)
 */
async function generateLabSeries(config) {
    const {
        course,
        semester,
        subject,
        topics = [],
        labType = 'Programming',
        difficulty = 'Medium'
    } = config;

    const labs = [];
    
    for (let i = 0; i < topics.length; i++) {
        try {
            const lab = await generateUltimateLab({
                course,
                semester,
                subject,
                topic: topics[i],
                labType,
                difficulty,
                labNumber: i + 1
            });
            labs.push(lab);
        } catch (error) {
            console.error(`Failed to generate lab ${i + 1}:`, error);
            labs.push({ error: error.message, topic: topics[i] });
        }
    }

    return labs;
}

module.exports = {
    generateUltimateLab,
    generateLabSeries,
    generateVivaQuiz
};
