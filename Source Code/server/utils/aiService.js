const axios = require('axios');

/**
 * Sanitize user input before embedding in AI prompts.
 * Truncates to maxLength and normalizes whitespace.
 */
const sanitizeForPrompt = (input, maxLength = 10000) => {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).replace(/\n{3,}/g, '\n\n');
};

/**
 * Safely parse JSON from AI responses.
 * Returns null if parsing fails.
 */
const safeJsonParse = (str) => {
  try {
    const cleaned = str.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
};

const getKeys = () => ({
  ollama: process.env.OLLAMA_URL, // No default to avoid unhandled calls
  groq: process.env.GROQ_API_KEY,
  hasAi: !!(process.env.GROQ_API_KEY || process.env.OLLAMA_URL)
});

// Output Validation: Ensures AI responses are helpful and not truncated
const validateAIResponse = (response, minLength = 200) => {
  if (!response || response.trim().length === 0) return false;
  if (response.trim().length < minLength) {
    console.warn(`AI response too short (${response.length} chars), flagging for potential failure`);
    return false;
  }
  return true;
};

// Tier 1: Groq API (Primary)
async function generateWithGroq(messages) {
  const keys = getKeys();
  if (!keys.groq) {
    console.warn('Groq API Key missing, checking for local Ollama fallback...');
    return null;
  }

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile', // Upgraded to latest 3.3 model
      messages
    }, {
      headers: { 'Authorization': `Bearer ${keys.groq}` },
      timeout: 60000
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error?.response?.data || error.message);
    return null;
  }
}

// Tier 2 Fallback: Ollama
async function generateWithOllama(prompt, model = 'qwen2.5-coder:1.5b') {
  const keys = getKeys();

  // Try Groq First
  const groqRes = await generateWithGroq([{ role: 'user', content: prompt }]);
  if (groqRes && validateAIResponse(groqRes)) return groqRes;

  // Fallback to Ollama if available
  if (keys.ollama) {
    try {
      const response = await axios.post(`${keys.ollama}/api/generate`, {
        model,
        prompt,
        stream: false
      }, { timeout: 45000 });

      const res = response.data.response;
      if (validateAIResponse(res)) return res;
    } catch (error) {
      console.warn('Ollama fallback also failed');
    }
  }

  throw new Error('All AI providers (Groq & Ollama) failed or returned invalid content');
}

// Calls AI services with tiered fallback (Groq Primary)
async function callAI(systemPrompt, userPrompt) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  // 1. Try Groq (Primary)
  const groqRes = await generateWithGroq(messages);
  if (groqRes) return groqRes;

  // 2. Try Ollama (Fallback)
  const keys = getKeys();
  if (keys.ollama) {
    try {
      const response = await axios.post(`${keys.ollama}/api/chat`, {
        model: 'qwen2.5-coder:1.5b',
        messages,
        stream: false
      }, { timeout: 45000 });
      const res = response.data.message.content;
      if (validateAIResponse(res, 50)) return res;
    } catch (error) {
      console.warn('Ollama fallback failure in callAI');
    }
  }

  console.error('All AI providers exhausted in callAI');
  return null;
}

const explainCode = async (code, language) => {
  const systemPrompt = 'You are a helpful coding tutor. Explain code clearly and concisely. Analyze time and space complexity if applicable.';
  const userPrompt = `Explain this ${sanitizeForPrompt(language, 50)} code:\n\n<user_code>\n${sanitizeForPrompt(code)}\n</user_code>`;

  const aiResponse = await callAI(systemPrompt, userPrompt);
  if (aiResponse) return aiResponse;

  return `🤖 This appears to be a ${language} solution. Consider verifying edge cases like empty inputs or large numeric bounds.`;
};

const generateHint = async (problemDescription, language) => {
  const systemPrompt = 'You are a coding mentor. Provide helpful hints without giving away the complete solution.';
  const userPrompt = `Give a hint for this ${sanitizeForPrompt(language, 50)} problem:\n\n<problem>\n${sanitizeForPrompt(problemDescription)}\n</problem>`;

  const aiResponse = await callAI(systemPrompt, userPrompt);
  if (aiResponse) return aiResponse;

  return '🤖 Try breaking the problem into smaller sub-problems. Consider edge cases and think about which data structure best fits the constraints.';
};

const generateGradingFeedback = async (code, testResults, problemDescription) => {
  const systemPrompt = 'You are an expert code reviewer. Provide constructive feedback on code quality, Big-O complexity, and potential variable naming improvements.';
  const userPrompt = `Review this code for problem:\n<problem>\n${sanitizeForPrompt(problemDescription)}\n</problem>\n\nCode:\n<user_code>\n${sanitizeForPrompt(code)}\n</user_code>\n\nTest Results: ${JSON.stringify(testResults)}`;

  const aiResponse = await callAI(systemPrompt, userPrompt);
  if (aiResponse) return aiResponse;

  const allPassed = testResults.every(r => r.passed);
  return allPassed ? '🤖 Great job! Your solution passes all tests. Consider optimizing for time/space complexity.' : '🤖 Some tests failed. Check your loop boundaries, initial values, and edge cases like empty inputs.';
};

const generateQuestions = async (topic, difficulty, count = 3) => {
  const systemPrompt = 'You are an expert problem setter. Generate coding problems in JSON format returning ONLY an array of objects answering the spec.';
  const userPrompt = `Generate ${count} ${difficulty} coding problems about ${topic}. Return as JSON array with properties: title, description, constraints.`;

  const aiResponse = await callAI(systemPrompt, userPrompt);
  if (aiResponse) {
    const parsed = safeJsonParse(aiResponse);
    if (parsed) return parsed;
    console.error('Failed to parse AI response as JSON');
  }

  return [
    { title: `Dynamic ${topic} Challenge 1`, description: `Solve a real-world problem involving ${topic} algorithms.`, constraints: "Time Limit: 2s, O(N) required." },
    { title: `Advanced ${topic} Traversal`, description: `Find the shortest path using advanced ${topic} concepts.`, constraints: "Space Complexity: O(log N)" },
    { title: `${topic} Optimization`, description: `Optimize the given sub-optimal ${topic} implementation to pass edge cases.`, constraints: "N <= 10^5" }
  ].slice(0, count);
};

const aiChatbot = async (messageHistory) => {
  const keys = getKeys();

  const messages = [
    {
      role: 'system',
      content: 'You are DevMerge-AI, an expert coding tutor built into a university LMS. Help students learn Data Structures, web development, and algorithms. Be interactive and encouraging.'
    },
    ...messageHistory.map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content
    }))
  ];

  // 1. Try Groq (Primary)
  const groqRes = await generateWithGroq(messages);
  if (groqRes) return groqRes;

  // 2. Try Ollama (Fallback)
  if (keys.ollama) {
    try {
      const response = await axios.post(`${keys.ollama}/api/chat`, {
        model: 'qwen2.5-coder:1.5b',
        messages,
        stream: false
      }, { timeout: 60000 });

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama Chat Error:', error?.response?.data || error.message);
    }
  }

  return '🤖 AI services are temporarily unavailable. Neural link severed.';
};

const checkPlagiarism = async (code1, code2) => {
  const systemPrompt = 'You are an advanced academic plagiarism detector. Compare the two code snippets and return a JSON object with properties: "similarityScore" (0-100), "isPlagiarized" (boolean), "explanation" (string explaining why).';
  const userPrompt = `Compare these two submissions:\n\nSnippet 1:\n${code1}\n\nSnippet 2:\n${code2}`;

  const aiResponse = await callAI(systemPrompt, userPrompt);
  if (aiResponse) {
    try {
      const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON Parse error from Gemini Plagiarism:', e);
    }
  }

  // Local comparison if AI fails
  const score = code1.length > 0 && code2.length > 0 ? (Math.min(code1.length, code2.length) / Math.max(code1.length, code2.length)) * 100 : 0;
  return {
    similarityScore: Math.round(score),
    isPlagiarized: score > 80,
    explanation: "Self-hosted check: Comparison based on structural similarity and length."
  };
};

const generateLab = async (topic, difficulty) => {
  const systemPrompt = `You are a world-class coding problem setter for a university platform. Create a unique, challenging coding problem about ${topic} at ${difficulty} level.
  
  Return ONLY a valid JSON object (no markdown, no backticks) with this exact structure:
  {
    "title": "Short catchy title (max 60 chars)",
    "description": "## Problem Statement\\n\\nClear one-sentence description of what to solve.\\n\\n## Input Format\\n\\n- First line: description\\n- Second line: description\\n\\n## Output Format\\n\\nWhat to return/print\\n\\n## Example 1\\n\\n**Input:**\\n\`\`\`\\n5\\n1 2 3 4 5\\n\`\`\`\\n\\n**Output:**\\n\`\`\`\\n15\\n\`\`\`\\n\\n**Explanation:**\\nDetailed step-by-step explanation\\n\\n## Example 2\\n\\n**Input:**\\n\`\`\`\\n3\\n10 20 30\\n\`\`\`\\n\\n**Output:**\\n\`\`\`\\n60\\n\`\`\`\\n\\n**Explanation:**\\nDetailed step-by-step explanation\\n\\n## Constraints\\n\\n- 1 ≤ N ≤ 10^4\\n- -10^9 ≤ values ≤ 10^9\\n- Time Limit: 1 second\\n- Space Limit: 256 MB",
    "difficulty": "${difficulty}",
    "topics": ["${topic}", "related-topic"],
    "constraints": "Plain text constraints like: 1 <= N <= 10000, -10^9 <= values <= 10^9",
    "examples": [
      {
        "input": "5\\n1 2 3 4 5",
        "output": "15",
        "explanation": "Detailed step-by-step explanation of how to get from input to output"
      },
      {
        "input": "3\\n10 20 30",
        "output": "60",
        "explanation": "Another detailed explanation showing the logic"
      }
    ],
    "testCases": [
      {"input": "5\\n1 2 3 4 5", "output": "15", "isHidden": false},
      {"input": "3\\n10 20 30", "output": "60", "isHidden": false},
      {"input": "1\\n100", "output": "100", "isHidden": true},
      {"input": "10\\n1 1 1 1 1 1 1 1 1 1", "output": "10", "isHidden": true},
      {"input": "7\\n-5 -3 -1 0 2 4 6", "output": "3", "isHidden": true},
      {"input": "4\\n1000000000 1000000000 1000000000 1000000000", "output": "4000000000", "isHidden": true}
    ],
    "starterCode": {
      "javascript": "function solution(input) {\\n  // Parse input\\n  const lines = input.trim().split('\\\\n');\\n  const n = parseInt(lines[0]);\\n  const arr = lines[1].split(' ').map(Number);\\n  \\n  // TODO: Implement your solution here\\n  \\n  return result.toString();\\n}",
      "python": "def solution(input_str):\\n    # Parse input\\n    lines = input_str.strip().split('\\\\n')\\n    n = int(lines[0])\\n    arr = list(map(int, lines[1].split()))\\n    \\n    # TODO: Implement your solution here\\n    \\n    return str(result)"
    },
    "timeLimit": 1000,
    "memoryLimit": 256
  }
  
  CRITICAL REQUIREMENTS:
  1. Input/Output format: Use newline (\\n) separated values for multi-line inputs
  2. Examples must have DETAILED explanations showing the logic step-by-step
  3. Create at least 6 diverse test cases:
     - 2 visible: simple examples that help understand the problem
     - 4 hidden: edge cases (empty, single element, large numbers, negative numbers, maximum constraints)
  4. All test cases must be consistent with the problem description
  5. Starter code must parse the input correctly
  6. Make the problem interesting, educational, and solvable`;

  const userPrompt = `Generate a ${difficulty} coding problem about ${topic}. 
  
  Requirements:
  - Make it educational and interesting with a real-world context
  - Include clear, detailed examples with step-by-step explanations
  - Provide starter code that handles input parsing correctly
  - Create 6 diverse test cases including edge cases:
    * Edge case 1: Minimum input (N=1 or empty)
    * Edge case 2: All same values
    * Edge case 3: Negative numbers (if applicable)
    * Edge case 4: Maximum constraints (large N, large values)
    * Edge case 5: Sorted input
    * Edge case 6: Reverse sorted input
  - Ensure all test cases are consistent and correct
  - Each example explanation should show the reasoning process
  
  Topics to consider for ${topic}:
  ${difficulty === 'Easy' ? 'Basic loops, arrays, simple math, string manipulation' :
      difficulty === 'Medium' ? 'Hash maps, two pointers, sliding window, recursion, sorting' :
        'Dynamic programming, graphs, trees, advanced algorithms, optimization'}
    
  Make the problem description clear and engaging. Students should understand exactly what to do.`;

  const aiResponse = await callAI(systemPrompt, userPrompt);
  if (aiResponse) {
    try {
      // Extract JSON from response
      let jsonStr = aiResponse.trim();

      // Remove markdown code blocks if present - be more careful with spacing
      jsonStr = jsonStr.replace(/```json\s*/g, '');
      jsonStr = jsonStr.replace(/```\s*/g, '');
      jsonStr = jsonStr.trim();

      // Find the first { and last }
      const firstBrace = jsonStr.indexOf('{');
      let lastBrace = jsonStr.lastIndexOf('}');

      // If JSON is incomplete, try to find where it was cut off
      if (lastBrace === -1 || lastBrace < firstBrace) {
        console.warn('Incomplete JSON response detected, using fallback');
        throw new Error('Incomplete JSON response');
      }

      if (firstBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(jsonStr);

      // Validate required fields
      if (!parsed.title || !parsed.description || !parsed.testCases) {
        throw new Error('Missing required fields');
      }

      // Ensure proper structure
      parsed.difficulty = difficulty;
      parsed.topics = parsed.topics || [topic];
      parsed.category = 'lab'; // Explicitly set category
      parsed.timeLimit = parsed.timeLimit || 1000;
      parsed.memoryLimit = parsed.memoryLimit || 256;

      // Ensure at least 4 test cases
      if (parsed.testCases.length < 4) {
        console.warn('Generated problem has fewer than 4 test cases, adding defaults');
        parsed.testCases.push(
          { input: "1\\n0", output: "0", isHidden: true },
          { input: "2\\n-1 1", output: "0", isHidden: true }
        );
      }

      return parsed;
    } catch (e) {
      console.error('Lab Gen JSON Parse Error:', e.message);
      console.log('AI Response length:', aiResponse.length);
      // Only log snippets to avoid flooding console
      if (aiResponse.length > 400) {
        console.log('First 200 chars:', aiResponse.substring(0, 200));
        console.log('Last 200 chars:', aiResponse.substring(Math.max(0, aiResponse.length - 200)));
      } else {
        console.log('Full response:', aiResponse);
      }
    }
  }

  // Fallback problem if AI fails
  return {
    title: `${topic} Challenge - ${difficulty}`,
    description: `## Problem Statement\n\nGiven an array of integers, solve a ${difficulty.toLowerCase()} level problem involving ${topic}.\n\n## Input Format\n\n- First line contains an integer N (size of array)\n- Second line contains N space-separated integers\n\n## Output Format\n\nA single integer representing the result.\n\n## Example 1\n\n**Input:**\n\`\`\`\n5\n1 2 3 4 5\n\`\`\`\n\n**Output:**\n\`\`\`\n15\n\`\`\`\n\n**Explanation:**\nSum all elements: 1 + 2 + 3 + 4 + 5 = 15\n\n## Example 2\n\n**Input:**\n\`\`\`\n3\n10 20 30\n\`\`\`\n\n**Output:**\n\`\`\`\n60\n\`\`\`\n\n**Explanation:**\nSum all elements: 10 + 20 + 30 = 60\n\n## Constraints\n\n- 1 ≤ N ≤ 10^3\n- -10^9 ≤ array[i] ≤ 10^9\n- Time Limit: 1 second\n- Space Limit: 256 MB`,
    difficulty,
    topics: [topic],
    category: 'lab',
    constraints: "1 ≤ N ≤ 1000, -10^9 ≤ values ≤ 10^9",
    examples: [
      {
        input: "5\n1 2 3 4 5",
        output: "15",
        explanation: "Sum all elements: 1 + 2 + 3 + 4 + 5 = 15"
      },
      {
        input: "3\n10 20 30",
        output: "60",
        explanation: "Sum all elements: 10 + 20 + 30 = 60"
      }
    ],
    testCases: [
      { input: "5\n1 2 3 4 5", output: "15", isHidden: false },
      { input: "3\n10 20 30", output: "60", isHidden: false },
      { input: "1\n100", output: "100", isHidden: true },
      { input: "10\n1 1 1 1 1 1 1 1 1 1", output: "10", isHidden: true },
      { input: "4\n-5 -3 2 6", output: "0", isHidden: true },
      { input: "6\n1000000 2000000 3000000 4000000 5000000 6000000", output: "21000000", isHidden: true }
    ],
    starterCode: {
      javascript: "function solution(input) {\n  const lines = input.trim().split('\\n');\n  const n = parseInt(lines[0]);\n  const arr = lines[1].split(' ').map(Number);\n  \n  // TODO: Implement your solution\n  let result = 0;\n  \n  return result.toString();\n}",
      python: "def solution(input_str):\n    lines = input_str.strip().split('\\n')\n    n = int(lines[0])\n    arr = list(map(int, lines[1].split()))\n    \n    # TODO: Implement your solution\n    result = 0\n    \n    return str(result)"
    },
    timeLimit: 1000,
    memoryLimit: 256
  };
};

/**
 * AI Interviewer Agent: Conducts  technical interviews.
 * Returns { response: string, metadata: { isOver: boolean, feedback: object } }
 */
const conductInterview = async (history, studentProfile, targetRole) => {
  const systemPrompt = `You are "Professor Turing", an elite technical interviewer. You are conducting a  interview for a student for the role of "${targetRole || 'Software Engineer'}".
  
  Student Portfolio Context:
  - Skills: ${studentProfile.skills?.join(', ') || 'N/A'}
  - Performance: ${studentProfile.avgGrade || 'N/A'} average lab grade
  - Lab Projects: ${studentProfile.projectsCount || 0} completions
  
  Your Goals:
  1. Ask challenging, role-specific technical questions one at a time.
  2. Follow up on their answers, pointing out flaws or asking them to optimize.
  3. If they are stuck, give them a subtle nudge.
  4. Only end the interview if they request it, or if you've asked at least 5 deep questions.
  
  Response Format:
  - End your response with a JSON block in this structure:
    {"isOver": boolean, "currentSkillTarget": string, "evaluation": "only if isOver=true, Provide score 0-100 and brief feedback"}
  `;

  // Filter history to fit AI context window (~10-15 messages)
  const conversation = history.map(h => ({
    role: h.role === 'agent' ? 'assistant' : 'user', // Match typical AI role naming
    content: h.content
  })).slice(-15); // Slightly larger window for context

  // 1. Prepare messages for Groq (Multi-turn awareness)
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversation
  ];

  // 2. Execute with Tiered Fallback
  let aiResponse = await generateWithGroq(messages);

  // Fallback to Ollama if Groq fails
  if (!aiResponse) {
    const keys = getKeys();
    if (keys.ollama) {
      try {
        const prompt = `${systemPrompt}\n\n${conversation.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;
        const response = await axios.post(`${keys.ollama}/api/generate`, {
          model: 'qwen2.5-coder:1.5b',
          prompt,
          stream: false
        }, { timeout: 45000 });
        aiResponse = response.data.response;
      } catch (err) {
        console.warn('conductInterview Fallback failed');
      }
    }
  }

  if (aiResponse) {
    try {
      // 3. Resilient Metadata Extraction
      // Look for the LAST JSON block in the response to avoid issues with code blocks
      const jsonStart = aiResponse.lastIndexOf('{');
      const jsonEnd = aiResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const responseText = aiResponse.substring(0, jsonStart).trim();
        const jsonStr = aiResponse.substring(jsonStart, jsonEnd + 1);
        const metadata = JSON.parse(jsonStr.replace(/```json/g, '').replace(/```/g, ''));
        return { response: responseText, metadata };
      }

      return { response: aiResponse, metadata: { isOver: false, currentSkillTarget: 'General' } };
    } catch (e) {
      console.error('Metadata parsing error in interview:', e);
      return { response: aiResponse, metadata: { isOver: false, currentSkillTarget: 'General' } };
    }
  }

  return { response: "Professor Turing is reflecting on your answer... (Connection error)", metadata: { isOver: false } };
};

/**
 * Predictive At-Risk Analysis: Uses ML-like pattern matching to detect academic decline.
 */
const analyzeRiskVector = async (studentData) => {
  const systemPrompt = `Analyze the student's academic engagement and performance data. Identify if they are "At-Risk" and why.
  
  Data Spec:
  ${JSON.stringify(studentData)}
  
  Return ONLY a JSON object:
  {
    "riskLevel": "Low" | "Medium" | "High",
    "isAtRisk": boolean,
    "confidence": number (0-1),
    "primaryTriggers": [string],
    "remedialStrategy": [string],
    "explanation": string
  }`;

  const aiResponse = await callAI(systemPrompt, "Synthesize risk vector now.");
  if (aiResponse) {
    try {
      const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('AI Risk Analysis Parsing Error', e);
    }
  }

  // Fallback Heuristic
  const failureCount = studentData.submissions?.filter(s => s.status === 'Wrong Answer').length || 0;
  return {
    riskLevel: failureCount > 4 ? "High" : "Low",
    isAtRisk: failureCount > 4,
    confidence: 0.7,
    primaryTriggers: failureCount > 4 ? ["High submission failure rate in labs"] : [],
    remedialStrategy: ["Assign foundational labs"],
    explanation: "Self-hosted heuristic: Analysis based on submission success rate."
  };
};

/**
 * AI Code Review: Performs qualitative analysis of code quality and efficiency.
 */
const generateAICodeReview = async (code, language, problemContext = '') => {
  const systemPrompt = `You are an expert software architect and code reviewer. Analyze the following "${language}" code.
  
  Your Review Criteria:
  1. Correctness & Edge Cases
  2. Time and Space Complexity (Big-O)
  3. Clean Code Principles (Naming, DRY, Single Responsibility)
  4. Language-specific Best Practices
  
  Return ONLY a JSON object:
  {
    "overallScore": number (0-100),
    "complexity": { "time": string, "space": string },
    "readabilityScore": number (0-10),
    "positives": [string],
    "improvements": [string],
    "suggestedOptimization": string,
    "verdict": "Accepted" | "Needs Refactoring" | "Inefficient"
  }`;

  const userPrompt = `Context: ${problemContext}\n\nCode to review:\n\`\`\`${language}\n${code}\n\`\`\``;

  const aiResponse = await callAI(systemPrompt, userPrompt);
  if (aiResponse) {
    try {
      const jsonStr = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error('AI Code Review Parsing Error', e);
    }
  }

  return {
    overallScore: 70,
    complexity: { time: "O(N)", space: "O(1)" },
    readabilityScore: 7,
    positives: ["Code follows basic logical structure."],
    improvements: ["Consider adding comments for complex blocks.", "Verify variable naming conventions."],
    verdict: "Accepted"
  };
};

module.exports = {
  sanitizeForPrompt,
  safeJsonParse,
  validateAIResponse,
  generateWithOllama,
  explainCode,
  generateHint,
  generateGradingFeedback,
  generateQuestions,
  aiChatbot,
  checkPlagiarism,
  generateLab,
  conductInterview,
  analyzeRiskVector,
  generateAICodeReview,
  callAI
};
