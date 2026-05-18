const { generateCopilotContent } = require('../services/ai/copilotService');
const { buildCopilotContext } = require('./facultyCopilotContextBuilder');
const { sanitizeTestCases } = require('./universalJudge');

// Bloom's Taxonomy Prompts
const bloomsPrompts = {
    Remember: "Create a problem that tests recall and recognition of facts, terms, and basic concepts.",
    Understand: "Create a problem that tests comprehension and explanation of ideas or concepts.",
    Apply: "Create a problem that requires using information in new situations and solving problems.",
    Analyze: "Create a problem that requires breaking information into parts and finding patterns.",
    Evaluate: "Create a problem that requires making judgments based on criteria and standards.",
    Create: "Create a problem that requires producing new or original work, designing solutions."
};

// Course-specific contexts
const courseContexts = {
    BTech_CSE: "Computer Science Engineering with focus on algorithms, data structures, and system design",
    BCA: "Bachelor of Computer Applications with practical programming emphasis",
    MCA: "Master of Computer Applications with advanced concepts",
    BTech_IT: "Information Technology with focus on networks and databases",
    Management: "Business management with case studies and decision-making",
    Law: "Legal studies with scenario-based analysis"
};

// Semester difficulty mapping
const semesterDifficulty = {
    1: { level: "Beginner", focus: "Basic syntax, definitions, simple logic" },
    2: { level: "Beginner", focus: "Fundamental concepts, basic problem solving" },
    3: { level: "Intermediate", focus: "Data structures, applied logic" },
    4: { level: "Intermediate", focus: "Algorithms, complexity analysis" },
    5: { level: "Advanced", focus: "Optimization, design patterns" },
    6: { level: "Advanced", focus: "System design, advanced algorithms" },
    7: { level: "Expert", focus: "Research-level, complex systems" },
    8: { level: "Expert", focus: "Industry-level, production systems" }
};

/**
 * Generate ultimate problem with full metadata
 */
async function generateUltimateProblem(config) {
    const {
        course = 'BTech_CSE',
        semester = 3,
        subject = 'Data Structures',
        topic = 'Arrays',
        bloomsLevel = 'Apply',
        questionType = 'Coding',
        problemMode = 'Practice',
        difficulty = 'Medium',
        realWorldContext = true,
        leetcodeStyle = false,
        includeTestCases = true,
        includeConstraints = true,
        includeTimeComplexity = true,
        includeSpaceComplexity = true,
        facultyId,
        courseId
    } = config;

    // 1. Build Context if IDs are provided
    let context = "";
    if (facultyId && courseId) {
        const payload = await buildCopilotContext(facultyId, courseId);
        context = payload.context;
    }

    // 2. Build comprehensive prompt
    const prompt = buildProblemPrompt(config);

    try {
        const problemData = await generateCopilotContent(
            facultyId || 'system',
            courseId || 'unknown',
            { system: prompt, context, instruction: "Generate a structured academic problem." },
            'problem_gen'
        );

        console.log('Raw AI Response:', problemData);
        console.log('Response type:', typeof problemData);

        // Parse the AI response if it's a string
        let parsedData = problemData;
        if (typeof problemData === 'string') {
            try {
                // Try to extract JSON from the response
                const jsonMatch = problemData.match(/\{[\s\S]*\}/);
                console.log('JSON Match found:', !!jsonMatch);
                
                if (jsonMatch) {
                    const jsonString = jsonMatch[0];
                    console.log('Extracted JSON:', jsonString.substring(0, 200) + '...');
                    parsedData = JSON.parse(jsonString);
                    console.log('Successfully parsed JSON');
                } else {
                    console.log('No JSON found in response, creating basic structure');
                    // If no JSON found, create a basic structure
                    parsedData = {
                        title: "Generated Problem",
                        description: problemData,
                        difficulty: difficulty,
                        examples: [],
                        constraints: "",
                        testCases: []
                    };
                }
            } catch (parseError) {
                console.warn('Failed to parse AI response as JSON:', parseError.message);
                console.log('Problem data that failed to parse:', problemData.substring(0, 500));
                // Fallback to basic structure
                parsedData = {
                    title: "Generated Problem",
                    description: problemData,
                    difficulty: difficulty,
                    examples: [],
                    constraints: "",
                    testCases: []
                };
            }
        }

        console.log('Final parsed data keys:', Object.keys(parsedData));

        // Sanitize test cases to ensure consistent format
        if (parsedData.testCases && Array.isArray(parsedData.testCases)) {
            parsedData.testCases = sanitizeTestCases(parsedData.testCases);
        }

        // Enhance with metadata
        return {
            ...parsedData,
            metadata: {
                course,
                semester,
                subject,
                bloomsLevel,
                questionType,
                problemMode,
                difficulty,
                generatedAt: new Date()
            }
        };
    } catch (error) {
        console.error('Ultimate Problem Generation Error:', error);
        throw error;
    }
}

/**
 * Build comprehensive problem generation prompt
 */
function buildProblemPrompt(config) {
    const {
        course,
        semester,
        subject,
        topic,
        bloomsLevel,
        questionType,
        problemMode,
        difficulty,
        realWorldContext,
        leetcodeStyle = false,
        includeTestCases = true,
        includeConstraints = true,
        includeTimeComplexity = true,
        includeSpaceComplexity = true
    } = config;

    const semesterInfo = semesterDifficulty[semester] || semesterDifficulty[3];
    const courseContext = courseContexts[course] || courseContexts.BTech_CSE;
    const bloomsPrompt = bloomsPrompts[bloomsLevel] || bloomsPrompts.Apply;

    // LeetCode-style specific prompt
    if (leetcodeStyle) {
        return `You are creating a professional LeetCode-style programming problem. Generate a comprehensive coding problem with the following specifications:

## Problem Requirements:
- **Subject**: ${subject}
- **Topic**: ${topic}
- **Difficulty**: ${difficulty} (Easy/Medium/Hard)
- **Type**: ${questionType}
- **Style**: Professional LeetCode format

## Problem Structure:
1. **Title**: Clear, concise problem name
2. **Description**: Detailed problem statement with examples
3. **Examples**: At least 2-3 concrete examples with input/output
4. **Constraints**: Realistic constraints for the problem
5. **Follow-up**: Optional follow-up questions
${includeTimeComplexity ? "6. **Time Complexity**: Expected time complexity analysis" : ""}
${includeSpaceComplexity ? "7. **Space Complexity**: Expected space complexity analysis" : ""}

## CRITICAL: Output Format Requirements:
You MUST respond with ONLY a valid JSON object. No additional text, no explanations, no markdown formatting.

\`\`\`json
{
  "title": "Problem title",
  "description": "Detailed problem description",
  "difficulty": "${difficulty}",
  "examples": [
    {
      "input": "Example input",
      "output": "Expected output",
      "explanation": "Explanation of the example"
    }
  ],
  "constraints": "List of constraints separated by newlines",
  "followUp": "Optional follow-up questions",
  "timeComplexity": "Expected time complexity",
  "spaceComplexity": "Expected space complexity",
  "starterCode": {
    "javascript": "function solve(input) {\\n  // TODO: Implement your solution\\n  return result;\\n}",
    "python": "def solve(input):\\n    # TODO: Implement your solution\\n    return result",
    "java": "class Solution {\\n    public int solve(int[] input) {\\n        // TODO: Implement your solution\\n        return result;\\n    }\\n}"
  },
  "testCases": [
    {
      "input": "Test case input",
      "expectedOutput": "Expected output",
      "description": "Test case description"
    }
  ]
}
\`\`\`

## Guidelines:
- Make the problem challenging but solvable
- Include edge cases in examples
- Constraints should be realistic (e.g., array lengths, value ranges)
- Provide clear function signatures
- Include multiple test cases covering different scenarios
- Make it suitable for technical interviews
- **IMPORTANT**: Respond ONLY with the JSON object, nothing else

${bloomsPrompt}

Generate the LeetCode problem now!`;
    }

    // Original prompt for non-LeetCode style
    let prompt = `You are an expert university professor creating a ${difficulty} difficulty ${questionType} problem.

ACADEMIC CONTEXT:
- Course: ${courseContext}
- Semester: ${semester} (${semesterInfo.level} level)
- Subject: ${subject}
- Topic: ${topic}
- Bloom's Taxonomy Level: ${bloomsLevel}
- ${bloomsGuidance}

PROBLEM MODE: ${problemMode}
${getProblemModeGuidance(problemMode)}

`;

    if (realWorldContext) {
        prompt += `REAL-WORLD CONTEXT:
Create a problem that relates to real-world scenarios, industry applications, or practical use cases.
Instead of generic problems, frame it in a professional context.

`;
    }

    prompt += `REQUIRED OUTPUT FORMAT (JSON):
{
    "title": "Clear, descriptive title",
    "description": "Detailed problem description with context",
    "difficulty": "${difficulty}",
    "topics": ["${topic}", "related topics"],
    "constraints": "Input constraints and limits",
    "examples": [
        {
            "input": "Sample input",
            "output": "Expected output",
            "explanation": "Why this output"
        }
    ],
    "testCases": [
        {
            "input": "Test input",
            "output": "Expected output",
            "isHidden": false
        },
        {
            "input": "Edge case input",
            "output": "Expected output",
            "isHidden": true
        }
    ],
    "starterCode": {
        "javascript": "function solve() { }",
        "python": "def solve():\\n    pass",
        "java": "class Solution { }",
        "cpp": "class Solution { };"
    },
    "hints": ["Hint 1", "Hint 2"],
    "expectedTimeComplexity": "O(n)",
    "expectedSpaceComplexity": "O(1)",
    "realWorldApplication": "How this is used in industry",
    "learningOutcomes": ["What students will learn"],
    "commonMistakes": ["Common errors to avoid"],
    "evaluationCriteria": {
        "correctness": 40,
        "efficiency": 20,
        "codeQuality": 20,
        "edgeCaseHandling": 20
    }
}

Generate a comprehensive, well-structured problem following this format.`;

    return prompt;
}

/**
 * Get problem mode specific guidance
 */
function getProblemModeGuidance(mode) {
    const guidance = {
        Assignment: "Include detailed hints, step-by-step guidance, and learning resources. Make it educational.",
        Exam: "No hints. Strict evaluation. Clear requirements. Time-bound suitable.",
        Practice: "Include hints and solutions. Focus on learning and understanding.",
        Competitive: "Optimize for speed. Include time limits. Focus on efficiency."
    };

    return guidance[mode] || guidance.Practice;
}

/**
 * Parse AI response and validate
 */
function parseAIResponse(response) {
    try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in response');
        }

        const problemData = JSON.parse(jsonMatch[0]);

        // Validate required fields
        const required = ['title', 'description', 'difficulty', 'topics'];
        for (const field of required) {
            if (!problemData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Ensure arrays exist
        problemData.examples = problemData.examples || [];
        problemData.testCases = problemData.testCases || [];
        problemData.hints = problemData.hints || [];
        problemData.learningOutcomes = problemData.learningOutcomes || [];

        return problemData;
    } catch (error) {
        console.error('Parse Error:', error);
        throw new Error('Failed to parse AI response: ' + error.message);
    }
}

/**
 * Generate multiple problems in batch
 */
async function generateProblemBatch(configs) {
    const problems = [];
    for (const config of configs) {
        try {
            const problem = await generateUltimateProblem(config);
            problems.push(problem);
        } catch (error) {
            console.error('Batch generation error:', error);
            problems.push({ error: error.message, config });
        }
    }
    return problems;
}

/**
 * Generate anti-cheating variant
 */
function generateVariant(baseProblem, parameterRanges) {
    // Randomize parameters within ranges
    const variant = JSON.parse(JSON.stringify(baseProblem));

    if (parameterRanges) {
        // Modify numerical values in examples and test cases
        variant.examples = variant.examples.map(ex => ({
            ...ex,
            input: randomizeInput(ex.input, parameterRanges)
        }));
    }

    return variant;
}

/**
 * Randomize input values
 */
function randomizeInput(input, ranges) {
    // Simple randomization logic
    // Can be enhanced based on specific needs
    return input;
}

module.exports = {
    generateUltimateProblem,
    generateProblemBatch,
    generateVariant,
    bloomsPrompts,
    courseContexts,
    semesterDifficulty
};
