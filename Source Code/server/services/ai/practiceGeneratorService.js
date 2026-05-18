const { retrieveContext } = require('../../utils/vectorRetriever');
const { classifyStudentLevel } = require('../../utils/studentLevelClassifier');
const { generateTutorResponse } = require('../../utils/aiTutorService');
const { getDifficultySettings } = require('../../utils/difficultyEngine');
const StudentWeakness = require('../../models/analytics/StudentWeakness');
const Course = require('../../models/academic/Course');

/**
 * Adaptive Practice Generator Service
 */
exports.generateAdaptivePractice = async (studentId, courseId, specificTopic = null, count = 3) => {
    // 1. Determine Target Topic (Explicit or based on Weakness Priority)
    let targetTopic = specificTopic;
    let weaknessSeverity = 'Low';

    const weaknessProfile = await StudentWeakness.findOne({ student: studentId, course: courseId });

    if (!targetTopic && weaknessProfile && weaknessProfile.weakTopics.length > 0) {
        // Sort by attempts/severity to find highest priority
        const priorityTopic = weaknessProfile.weakTopics.sort((a, b) => b.attempts - a.attempts)[0];
        targetTopic = priorityTopic.topic;
        weaknessSeverity = priorityTopic.severity || 'Medium';
    } else if (!targetTopic) {
        throw new Error('Please specify a topic or ensure your weakness profile is populated.');
    }

    // 2. Fetch Performance Intelligence
    const studentLevel = await classifyStudentLevel(studentId, courseId);
    const difficultySettings = getDifficultySettings(studentLevel, weaknessSeverity);

    // 3. Load Academic Context (RAG)
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course node not found');

    const contextChunks = await retrieveContext(targetTopic, { courseId });
    const semanticContext = contextChunks.map(c => c.content).join('\n\n');

    // 4. Construct Multi-Level Practice Prompt
    const systemPrompt = `You are a professional examiner for "${course.title}".
Your goal is to generate ${count} practice questions for: "${targetTopic}".

STUDENT STATE:
- Level: ${studentLevel}
- Topic Weakness: ${weaknessSeverity}
- Target Difficulty: ${difficultySettings.target}
- Bloom's Range: ${difficultySettings.bloomRange.join(', ')}

DIFFICULTY DISTRIBUTION:
- Easy: ${Math.round(difficultySettings.distribution.easy * 100)}%
- Medium: ${Math.round(difficultySettings.distribution.medium * 100)}%
- Hard: ${Math.round(difficultySettings.distribution.hard * 100)}%

CONTEXT:
${semanticContext}

STRICT OUTPUT FORMAT:
Return ONLY a valid JSON object:
{
  "topic": "${targetTopic}",
  "difficulty": "${difficultySettings.target}",
  "questions": [
    {
      "question": "string",
      "type": "mcq",
      "bloomLevel": "string",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "string",
      "explanation": "string",
      "estimatedTime": "string (e.g. 5 mins)"
    }
  ]
}`;

    // 5. Generation & Validation Loop
    let attempts = 0;
    while (attempts < 2) {
        try {
            const response = await generateTutorResponse({ system: systemPrompt, context: "" }, "Generate structured practice set.");
            const jsonMatch = response.answer.match(/\{[\s\S]*\}/);

            if (!jsonMatch) throw new Error('No JSON found in response');

            const practiceSet = JSON.parse(jsonMatch[0]);

            // Basic validation
            if (!practiceSet.questions || !Array.isArray(practiceSet.questions)) {
                throw new Error('Invalid practice structure');
            }

            return practiceSet;
        } catch (err) {
            console.error(`Attempt ${attempts + 1} failed:`, err.message);
            attempts++;
        }
    }

    throw new Error('Failed to generate a valid adaptive practice set after multiple attempts.');
};
