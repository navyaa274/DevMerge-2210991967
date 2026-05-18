const { buildCopilotContext } = require('../../utils/facultyCopilotContextBuilder');
const { generateCopilotContent } = require('./copilotService');
const Submission = require('../../models/assessment/problems/Submission');
const Problem = require('../../models/assessment/problems/Problem');

/**
 * AI Code Review Assistant Service
 */
exports.generateCodeReview = async (params) => {
  const { facultyId, courseId, submissionId, settings = {} } = params;

  // 1. Fetch Technical Artifacts
  const submission = await Submission.findById(submissionId).populate('student', 'name');
  if (!submission) throw new Error('Submission not found');

  const problem = await Problem.findById(submission.problem);
  if (!problem) throw new Error('Problem context not found');

  // 2. Build Copilot Context
  // We pass null for unitId unless we can derive it from the problem topics/syllabus mapping
  const payload = await buildCopilotContext(facultyId, courseId);

  // 3. Construct Review Instruction
  const testResults = `Status: ${submission.status}\nTests Passed: ${submission.testsPassed}/${submission.totalTests}`;

  const actionInstruction = `Conduct a professional code review for the following submission.

PROBLEM DESCRIPTION:
${problem.description}
CONSTRAINTS: ${problem.constraints || 'None'}
LANGUAGE: ${submission.language}

STUDENT CODE:
\`\`\`${submission.language}
${submission.code}
\`\`\`

TEST EXECUTION RESULTS:
${testResults}

REVIEW SETTINGS:
- Include Complexity Analysis: ${settings.includeComplexity !== false}
- Include Security Review: ${settings.includeSecurity !== false}

STRICT PEDAGOGICAL RULES:
- Evaluate correctness based on logic and test results.
- Analyze Time & Space complexity (Big-O).
- Suggest optimizations without giving away the full solution if possible.
- Identify edge cases (empty input, large constraints, boundary values).
- Review code quality (readability, naming, modularity).

STRICT JSON OUTPUT FORMAT:
{
  "correctnessAnalysis": {
    "logicalFlow": "string",
    "bugRisks": ["string"],
    "edgeCaseCoverage": ["string"]
  },
  "complexityAnalysis": {
    "timeComplexity": "string (Big-O)",
    "spaceComplexity": "string (Big-O)",
    "optimizationSuggestions": ["string"]
  },
  "codeQuality": {
    "readability": "string",
    "modularity": "string",
    "namingConventions": "string"
  },
  "securityReview": ["string"],
  "scoreRecommendation": {
    "suggestedScore": "number (0-10)",
    "maxScore": 10,
    "justification": "string"
  }
}`;

  payload.instruction = actionInstruction;

  // 4. Generate Review
  const review = await generateCopilotContent(facultyId, courseId, payload, 'code_review');

  // 5. Audit Enrichment
  review.metadata = {
    submissionId,
    studentName: submission.student.name,
    problemTitle: problem.title,
    reviewedAt: new Date()
  };

  return review;
};
