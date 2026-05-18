const VivaSession = require('../../models/assessment/logic/VivaSession');
const LabManual = require('../../models/assessment/labs/LabManual');
const ultimateGenService = require('./ultimateProblemGeneratorService');
const studentAnalyticsService = require('../learning/studentAnalyticsService');

/**
 * Viva-Voce Interviewer Service
 * Conducts dynamic, AI-driven oral examinations to verify concept mastery.
 */
class VivaVoceService {
    /**
     * Start a new Viva session for a student on a specific topic/lab
     */
    async startSession(studentId, courseId, topic, labId = null) {
        const session = new VivaSession({
            student: studentId,
            course: courseId,
            topic: topic,
            labManual: labId,
            status: 'InProgress',
            startedAt: new Date()
        });

        // 1. Generate Initial Questions
        const prompt = `
            Act as an Academic Professor conducting a Viva-Voce.
            Subject: ${topic}
            Generate 3 oral examination questions for a university student.
            1. Conceptual Reasoning (Intermediate)
            2. Debugging/Scenario Question (Advanced)
            3. Foundation Question (Basic)
            Return JSON: { "questions": [{ "question": "String", "expectedAnswer": "String", "difficulty": "Basic|Intermediate|Advanced" }] }
        `;

        const response = await ultimateGenService._callAI(prompt, "Experienced University Examiner.");
        session.questions = response.questions.map(q => ({
            ...q,
            answeredAt: null
        }));

        await session.save();
        return session;
    }

    /**
     * Submit an answer to a viva question and get immediate AI scoring
     */
    async submitAnswer(sessionId, questionId, studentAnswer) {
        const session = await VivaSession.findById(sessionId);
        if (!session) throw new Error("Viva session not found");

        const question = session.questions.id(questionId);
        if (!question) throw new Error("Question not found in session");

        // scoring using AI
        const scoringPrompt = `
            Question: ${question.question}
            Key Concept Expected: ${question.expectedAnswer}
            Student's Oral Response: "${studentAnswer}"
            Score the response accurately on a scale of 0 to 10.
            Return JSON: { "score": Number, "feedback": "String", "perfectResponse": "String" }
        `;

        const evaluation = await ultimateGenService._callAI(scoringPrompt, "Fair and logic-driven Academic Scorer.");

        question.studentAnswer = studentAnswer;
        question.aiScore = evaluation.score;
        question.aiFeedback = evaluation.feedback;
        question.answeredAt = new Date();

        await session.save();
        return evaluation;
    }

    /**
     * Complete the session and compile overall results
     */
    async completeSession(sessionId) {
        const session = await VivaSession.findById(sessionId);
        if (!session) throw new Error("Viva session not found");

        const totalEarned = session.questions.reduce((sum, q) => sum + (q.aiScore || 0), 0);
        const maxPossible = session.questions.length * 10;
        session.overallScore = Math.round((totalEarned / maxPossible) * 100);

        const feedbackPrompt = `Summarize this Viva performance for a student. Score: ${session.overallScore}%. Include improvement tips.`;
        const feedback = await ultimateGenService._callAI(feedbackPrompt, "Supportive Academic Mentor.");

        session.overallFeedback = typeof feedback === 'string' ? feedback : feedback.summary;
        session.status = 'Completed';
        session.completedAt = new Date();

        await session.save();

        // Update Student Analytics
        await studentAnalyticsService.analyzePerformance(session.student, session.course);

        return session;
    }
}

module.exports = new VivaVoceService();
