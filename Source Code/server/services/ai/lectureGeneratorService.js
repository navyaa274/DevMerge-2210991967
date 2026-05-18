const { buildCopilotContext } = require('../../utils/facultyCopilotContextBuilder');
const { generateCopilotContent } = require('./copilotService');

/**
 * AI Lecture Notes & PPT Generator
 */
exports.generateLecture = async (params) => {
    const { facultyId, courseId, unitId, durationMinutes, bloomFocus } = params;

    // 1. Build Context (Grounded in Syllabus + COs)
    const payload = await buildCopilotContext(facultyId, courseId, unitId);

    // 2. Pedagogical Scaling Logic (Heuristic-based)
    // 60m -> ~10-12 slides. 90m -> ~15-18 slides.
    const approximateSlides = Math.ceil(durationMinutes / 5);

    // 3. Construct Action Instruction
    const actionInstruction = `Generate a structured lecture plan and slide-by-slide breakdown.
DURATION: ${durationMinutes} minutes
TARGET BLOOM FOCUS: ${bloomFocus || 'Understand/Apply'}
APPROXIMATE SLIDE COUNT: ${approximateSlides}

STRICT PEDAGOGICAL RULES:
- Map every Learning Objective to an allowed CO from context.
- Align content complexity to the Bloom Focus: ${bloomFocus}.
- Include 1 In-Class Activity (Problem Solving / Discussion).
- Include 1 Homework Suggestion.

STRICT JSON OUTPUT FORMAT:
{
  "lectureTitle": "string",
  "learningObjectives": [
    {
      "objective": "string",
      "bloomLevel": "string",
      "coMapping": ["CO code from context"]
    }
  ],
  "slideDeck": [
    {
      "slideNumber": "number",
      "title": "string",
      "keyPoints": ["string"],
      "example": "string (optional)",
      "visualSuggestion": "string (description for a graphic/chart)"
    }
  ],
  "inClassActivity": {
    "type": "string",
    "description": "string",
    "estimatedTime": "mins"
  },
  "homework": {
    "description": "string",
    "estimatedTime": "mins"
  }
}`;

    payload.instruction = actionInstruction;

    // 4. Generate & Validate
    const lecture = await generateCopilotContent(facultyId, courseId, payload, 'lecture_notes_gen');

    // 5. Supplement with metadata
    lecture.metadata = {
        unitId,
        plannedDuration: durationMinutes,
        generatedAt: new Date()
    };

    return lecture;
};
