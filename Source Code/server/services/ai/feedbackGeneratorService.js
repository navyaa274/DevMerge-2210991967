const { buildCopilotContext } = require('../../utils/facultyCopilotContextBuilder');
const { generateCopilotContent } = require('./copilotService');
const AssignmentSubmission = require('../../models/assessment/assignments/AssignmentSubmission');
const Rubric = require('../../models/assessment/logic/Rubric');
const Assignment = require('../../models/assessment/assignments/Assignment');

/**
 * AI Auto-Feedback Generator
 */
exports.generateAutoFeedback = async (params) => {
  const { facultyId, courseId, submissionId, rubricId, scoreBreakdown } = params;

  // 1. Fetch Artifacts
  const submission = await AssignmentSubmission.findById(submissionId).populate('student', 'name');
  if (!submission) throw new Error('Submission not found');

  const rubric = await Rubric.findById(rubricId);
  if (!rubric) throw new Error('Rubric not found');

  const assignment = await Assignment.findById(submission.assignment);

  // 2. Build Copilot Context
  const payload = await buildCopilotContext(facultyId, courseId);

  // 3. Construct Feedback Prompt
  const rubricContext = rubric.questions.map((q, i) => {
    const score = scoreBreakdown ? scoreBreakdown[q.questionText] || scoreBreakdown[`Q${i + 1}`] : 'Not yet graded';
    const criteria = q.criteria.map(c => `- ${c.criterion} (${c.marks} marks): ${c.description}`).join('\n');
    return `QUESTION ${i + 1}: ${q.questionText}\nMARKS: ${q.totalMarks}\nBLOOM: ${q.bloomLevel}\nSCORE GIVEN: ${score}\nRUBRIC:\n${criteria}`;
  }).join('\n\n');

  const actionInstruction = `Generate structured pedagogical feedback for the following student submission based on the provided rubric and scores.

STUDENT SUBMISSION:
"""
${submission.content}
"""

RUBRIC & SCORES:
${rubricContext}

STRICT PEDAGOGICAL RULES:
- Reference specific rubric criteria.
- Scale tone based on performance:
  - < 50%: Focus on foundational conceptual gaps and remedial steps.
  - 50-80%: Focus on refinement and logical consistency.
  - > 80%: Focus on depth, optimization, and advanced insights.
- Provide actionable "Next Steps" for learning.

STRICT JSON OUTPUT FORMAT:
{
  "overallSummary": "string",
  "perQuestionFeedback": [
    {
      "questionId": "string (e.g. Q1)",
      "strengths": ["string"],
      "improvementAreas": ["string"],
      "missedConcepts": ["string"],
      "recommendedPracticeTopics": ["string"]
    }
  ],
  "nextSteps": ["string"]
}`;

  payload.instruction = actionInstruction;

  // 4. Generate Feedback
  const feedback = await generateCopilotContent(facultyId, courseId, payload, 'feedback_gen');

  // 5. Supplement with metadata for Logging/UI
  feedback.metadata = {
    submissionId,
    studentName: submission.student.name,
    processedAt: new Date()
  };

  return feedback;
};
