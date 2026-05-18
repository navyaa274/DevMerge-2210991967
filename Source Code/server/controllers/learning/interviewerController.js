const MockInterview = require('../../models/learning/mentorship/MockInterview');
const User = require('../../models/auth/User');
const LabSubmission = require('../../models/assessment/labs/LabSubmission');
const aiService = require('../../utils/aiService');

/**
 * AI Interviewer Controller
 * Manages specialized mock-interview sessions powered by AI.
 */
class InterviewerController {

    /**
     * Start a new mock interview session
     */
    async startSession(req, res) {
        try {
            const studentId = req.user.id;
            const { targetRole } = req.body;

            // 1. Fetch student portfolio context for AI grounding
            const [student, labCount] = await Promise.all([
                User.findById(studentId),
                LabSubmission.countDocuments({ student: studentId, grade: { $ne: null } })
            ]);

            const profile = {
                skills: student.skills || ['JavaScript', 'Web Development'],
                projectsCount: labCount,
                avgGrade: student.academicInfo?.gpa || 'N/A'
            };

            // 2. Initialize session in DB
            const session = await MockInterview.create({
                student: studentId,
                title: `${targetRole || 'Software Engineer'} Mock Interview`,
                status: 'In-Progress',
                portfolioSnapshot: profile,
                transcript: [{
                    role: 'agent',
                    content: `Hello ${student.firstName}! I am Professor Turing. I've reviewed your portfolio and I'm excited to start this mock interview for the ${targetRole || 'Software Engineer'} role. Ready?`
                }]
            });

            res.status(201).json({
                success: true,
                sessionId: session._id,
                initialMessage: session.transcript[0]
            });
        } catch (error) {
            console.error('Start Interview Error:', error);
            res.status(500).json({ success: false, message: 'Failed to start interview session' });
        }
    }

    /**
     * Submit student response and get AI follow-up
     */
    async submitResponse(req, res) {
        try {
            const { sessionId, content } = req.body;
            const session = await MockInterview.findById(sessionId);

            if (!session || session.status === 'Completed') {
                return res.status(400).json({ success: false, message: 'Invalid or completed session' });
            }

            // 1. Record student response
            session.transcript.push({ role: 'student', content });

            // 2. Get AI follow-up
            const result = await aiService.conductInterview(
                session.transcript,
                session.portfolioSnapshot,
                session.title.split(' ')[0] // Basic role extraction
            );

            // 3. Record AI response
            session.transcript.push({
                role: 'agent',
                content: result.response,
                metadata: { confidence: result.metadata?.confidence }
            });

            // 4. Update session status/evaluation if over
            if (result.metadata?.isOver) {
                session.status = 'Completed';
                session.evaluation = result.metadata.evaluation;
                session.endedAt = new Date();
            }

            await session.save();

            res.json({
                success: true,
                message: result.response,
                metadata: result.metadata
            });
        } catch (error) {
            console.error('Interview Response Error:', error);
            res.status(500).json({ success: false, message: 'Failed to process interview response' });
        }
    }

    /**
     * Get session history / evaluation
     */
    async getSession(req, res) {
        try {
            const session = await MockInterview.findById(req.params.id);
            if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

            res.json({ success: true, data: session });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch session' });
        }
    }

    /**
     * Get student's interview history
     */
    async getStudentHistory(req, res) {
        try {
            const history = await MockInterview.find({ student: req.user.id }).sort({ createdAt: -1 });
            res.json({ success: true, data: history });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Failed to fetch interview history' });
        }
    }
}

module.exports = new InterviewerController();
