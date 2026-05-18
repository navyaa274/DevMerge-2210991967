const Exam = require('../../models/assessment/exams/Exam');
const ExamSubmission = require('../../models/assessment/exams/ExamSubmission');

/**
 * Create Exam
 */
exports.createExam = async (req, res) => {
    try {
        const { title, description, course, examType, questions, duration, totalMarks, startTime, endTime, students } = req.body;
        const exam = new Exam({
            title,
            description,
            course,
            createdBy: req.user.id,
            examType,
            questions,
            duration,
            totalMarks,
            startTime,
            endTime,
            students
        });
        await exam.save();
        res.status(201).json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get Exams for Course
 */
exports.getExamsByCourse = async (req, res) => {
    try {
        const exams = await Exam.find({ course: req.params.courseId }).populate('createdBy', 'name email');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get Exam by ID
 */
exports.getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('course', 'title code');
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        res.json(exam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get Exams for Student
 */
exports.getStudentExams = async (req, res) => {
    try {
        const exams = await Exam.find({ students: req.user.id })
            .populate('createdBy', 'name email')
            .populate('course', 'title code');
        res.json(exams);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Submit Exam
 */
exports.submitExam = async (req, res) => {
    try {
        const { answers } = req.body;
        const examId = req.params.id;
        const userId = req.user.id;

        const exam = await Exam.findById(examId);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        const existing = await ExamSubmission.findOne({ exam: examId, student: userId });
        if (existing) return res.status(400).json({ message: 'Exam already submitted' });

        let score = 0;
        let totalMarks = exam.totalMarks || 0;

        if (exam.questions && exam.questions.length > 0) {
            if (!totalMarks) totalMarks = exam.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
            exam.questions.forEach(q => {
                if (q.type === 'mcq' && q.correctAnswer && answers && answers[q._id]) {
                    if (answers[q._id] === q.correctAnswer) score += q.marks || 1;
                }
            });
        }

        const submission = new ExamSubmission({
            exam: examId,
            student: userId,
            answers: answers || {},
            score,
            totalMarks
        });

        await submission.save();
        res.status(201).json({ message: 'Exam submitted successfully', score, totalMarks, submission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Auto-save Progress
 */
exports.saveExamProgress = async (req, res) => {
    try {
        const { answers, proctoringLog } = req.body;
        const examId = req.params.id;
        const userId = req.user.id;

        let submission = await ExamSubmission.findOne({ exam: examId, student: userId });
        if (!submission) {
            submission = new ExamSubmission({ exam: examId, student: userId, answers: answers || {} });
        } else {
            submission.answers = { ...submission.answers, ...answers };
            if (proctoringLog) {
                submission.proctoringLog = submission.proctoringLog || [];
                submission.proctoringLog.push({ ...proctoringLog, timestamp: new Date() });
            }
        }
        await submission.save();
        res.json({ success: true, message: 'Progress synchronized' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get My Submission
 */
exports.getMySubmission = async (req, res) => {
    try {
        const submission = await ExamSubmission.findOne({ exam: req.params.id, student: req.user.id });
        if (!submission) return res.status(404).json({ message: 'No submission found' });
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
