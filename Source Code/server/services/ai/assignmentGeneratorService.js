const { buildCopilotContext } = require('../../utils/facultyCopilotContextBuilder');
const { generateCopilotContent } = require('./copilotService');

/**
 * AI Assignment Generator
 */
exports.generateAssignment = async (params) => {
    const { facultyId, courseId, unitId, type, totalMarks, bloomLevel, bypassAuth } = params;
    const payload = await buildCopilotContext(facultyId, courseId, unitId, bypassAuth);

    // 2. Define Action Specifics - SIMPLIFIED for small models
    const numQuestions = Math.min(3, Math.floor(totalMarks / 10)); // Max 3 questions
    const marksPerQuestion = Math.floor(totalMarks / numQuestions);

    const actionInstruction = `Create ${numQuestions} assignment questions. Total marks: ${totalMarks}.

Return this exact JSON format:
{
  "assignmentTitle": "Assignment on Data Structures",
  "unit": "${unitId || 1}",
  "questions": [
    {"question": "Explain arrays", "marks": ${marksPerQuestion}, "coMapping": ["CO1"], "bloomLevel": "${bloomLevel}"},
    {"question": "Implement linked list", "marks": ${marksPerQuestion}, "coMapping": ["CO2"], "bloomLevel": "${bloomLevel}"}
  ]
}

Rules:
- Write ${numQuestions} real questions (not examples)
- Each question: ${marksPerQuestion} marks
- Use COs from context
- Return ONLY JSON`;

    payload.instruction = actionInstruction;

    // 3. Generate & Validate
    const assignment = await generateCopilotContent(facultyId, courseId, payload, 'assignment_gen');

    if (!assignment || !assignment.questions) {
        throw new Error('AI returned an invalid assignment structure');
    }

    // 4. Add bloom distribution (simplified for small models)
    if (!assignment.bloomDistribution) {
        assignment.bloomDistribution = {
            "Remember": 0,
            "Understand": 0,
            "Apply": 0,
            "Analyze": 0,
            "Evaluate": 0,
            "Create": 0
        };
        // Count from questions
        assignment.questions.forEach(q => {
            if (q && q.bloomLevel && assignment.bloomDistribution[q.bloomLevel] !== undefined) {
                assignment.bloomDistribution[q.bloomLevel]++;
            }
        });
    }

    // 5. Marks Integrity Logic
    const calculatedSum = assignment.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    if (calculatedSum !== totalMarks) {
        // Simple fix if delta is small, otherwise regenerate
        // For now, we report the mismatch for governance review
        assignment.integrity = {
            matchesTargetMarks: false,
            calculatedSum,
            targetMarks: totalMarks
        };
    } else {
        assignment.integrity = { matchesTargetMarks: true };
    }

    return assignment;
};
