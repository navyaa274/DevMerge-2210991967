const { buildCopilotContext } = require('../../utils/facultyCopilotContextBuilder');
const { generateCopilotContent } = require('./copilotService');
const Rubric = require('../../models/assessment/logic/Rubric');

/**
 * AI Rubric Generator Service
 */
exports.generateRubric = async (params) => {
  const { facultyId, courseId, assignment, strictnessLevel = 'standard' } = params;

  // 1. Build Context
  const payload = await buildCopilotContext(facultyId, courseId);

  // 2. Map Bloom Levels to Criteria Focus (Pedagogical Rule Injection)
  const bloomFocusMap = {
    'Remember': 'Accuracy of facts, definitions, and basic terminology.',
    'Understand': 'Clarity of explanation, interpretation of concepts, and summarizing ability.',
    'Apply': 'Correctness of methodology, execution of steps, and procedural accuracy.',
    'Analyze': 'Logical breakdown, identifying relationships, and organizational structure.',
    'Evaluate': 'Strength of justification, quality of critique, and evidence-based judgment.',
    'Create': 'Originality, design quality, structural integration, and innovation.'
  };

  // 3. Construct the Rubric Generator Instruction
  // We pass the assignment questions into the prompt
  const questionsString = assignment.questions.map((q, i) =>
    `Q${i + 1}: ${q.question} (Marks: ${q.marks}, Bloom: ${q.bloomLevel}, CO: ${q.coMapping.join(', ')})`
  ).join('\n');

  const actionInstruction = `Generate a structured grading rubric for the following questions:
${questionsString}

STRICTNESS LEVEL: ${strictnessLevel}

STRICT PEDAGOGICAL RULES:
- For each question, create 3-4 specific criteria.
- Criteria must align with the Bloom level focus:
${Object.entries(bloomFocusMap).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
- TOTAL MARKS PER QUESTION MUST MATCH THE ASSIGNED MARKS.
- Ensure CO alignment based on the coMapping.

STRICT JSON OUTPUT FORMAT:
{
  "rubric": [
    {
      "questionId": "string (e.g. Q1)",
      "totalMarks": "number",
      "criteria": [
        {
          "criterion": "string",
          "description": "string",
          "marks": "number"
        }
      ]
    }
  ]
}`;

  payload.instruction = actionInstruction;

  // 4. Generate & Validate
  const rubricData = await generateCopilotContent(facultyId, courseId, payload, 'rubric_gen');

  // 5. Marks Integrity Validator (Deterministic check)
  rubricData.rubric.forEach((item, index) => {
    const targetMarks = assignment.questions[index].marks;
    const calculatedSum = item.criteria.reduce((sum, c) => sum + c.marks, 0);

    if (calculatedSum !== targetMarks) {
      // Add integrity flag
      item.integrityError = true;
      item.targetMarks = targetMarks;
      item.calculatedSum = calculatedSum;
    } else {
      item.integrityError = false;
    }
    item.questionText = assignment.questions[index].question;
  });

  return rubricData;
};
