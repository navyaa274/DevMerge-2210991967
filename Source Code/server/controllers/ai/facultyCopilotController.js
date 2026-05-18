const copilotService = require('../../services/ai/copilotService');
const Course = require('../../models/academic/Course');
const Assignment = require('../../models/assessment/assignments/Assignment');
const CourseEnrollment = require('../../models/learning/enrollments/CourseEnrollment');
const notificationService = require('../../services/notification/notificationService');
const asyncHandler = require('../../errors/asyncHandler');

/**
 * Faculty Copilot Hub Controller
 * Implements Phase 4 Item 34 (AI-driven content generation)
 */

// 1. Generate Lecture Notes
exports.generateLectureNotes = asyncHandler(async (req, res) => {
    const { courseId, topic, week } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const promptPayload = {
        system: `You are an expert university professor for ${course.name}. Create comprehensive, structured lecture notes for students.`,
        context: `Course Description: ${course.description}\nTopic: ${topic}\nSyllabus Info: Week ${week}`,
        instruction: `Generate a detailed markdown document for the lecture.
        Include:
        1. Theoretical Concepts
        2. Real-world Examples
        3. Simple coding examples (if applicable)
        4. Summary & Review questions.
        
        Return ONLY a JSON object: {"title": string, "content": string (markdown)}`
    };

    const notes = await copilotService.generateCopilotContent(req.user.id, courseId, promptPayload, 'lecture_notes_gen');
    res.json({ success: true, data: notes });
});

// 2. Generate Rubric (For grading oversight)
exports.generateRubric = asyncHandler(async (req, res) => {
    const { problemId, criteriaCount = 3 } = req.body;

    const promptPayload = {
        system: 'You are a pedagogical expert. Design a fair and clear grading rubric for a university-level coding problem.',
        context: `Problem Context: ${problemId}`,
        instruction: `Return a JSON array of ${criteriaCount} grading criteria objects: 
        {"criterion": string, "maxScore": number, "description": string}`
    };

    const rubric = await copilotService.generateCopilotContent(req.user.id, 'system', promptPayload, 'rubric_gen');
    res.json({ success: true, data: rubric });
});

// 3. Automated Insight Analysis (Course health)
exports.analyzeCourseInsights = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    // Aggregate course-wide metrics
    const [course, submissions] = await Promise.all([
        Course.findById(courseId).select('name description'),
        require('../../models/assessment/problems/Submission').find({ courseId }).limit(100).select('status language runtime')
    ]);

    const promptPayload = {
        system: 'You are a system analyst. Audit course performance and engagement trends.',
        context: `Course: ${course.name}\nSubmissions Breakdown: ${JSON.stringify(submissions.length)} total, ${submissions.filter(s => s.status === 'Accepted').length} pass count.`,
        instruction: `Return a JSON object: 
        {"engagementScore": number (0-100), "topStickingPoints": [string], "actionableAdvice": string}`
    };

    const insights = await copilotService.generateCopilotContent(req.user.id, courseId, promptPayload, 'insight_analysis');
    res.json({ success: true, data: insights });
});

// 4. Generate Theoretical Test Paper (Item 31)
exports.generateTestPaper = asyncHandler(async (req, res) => {
    const { courseId, title, totalMarks = 50, durationMinutes = 90, units = [1, 2] } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const promptPayload = {
        system: `You are an examination controller for ${course.name}. Design a professional theoretical examination paper.`,
        context: `Course: ${course.name}\nUnits Covered: ${units.join(', ')}\nTotal Marks: ${totalMarks}\nDuration: ${durationMinutes} mins`,
        instruction: `Generate a structured test paper with Sections (A, B, C).
        Section A: Short answers (2 marks each)
        Section B: Medium answers (5 marks each)
        Section C: Long descriptive (10 marks each)
        
        Ensure total marks equal ${totalMarks}.
        Return ONLY a JSON object: {
            "title": string,
            "sections": [
                { "name": "Section A", "questions": [{"q": string, "marks": number, "bloomLevel": string}] }
            ],
            "totalMarks": number,
            "pedagogicalWeightage": {"Remember": number, "Apply": number, "Analyze": number}
        }`
    };

    const paper = await copilotService.generateCopilotContent(req.user.id, courseId, promptPayload, 'exam_gen');
    res.json({ success: true, data: paper });
});

// 5. Approve & Publish AI Assignment
exports.publishAssignment = asyncHandler(async (req, res) => {
    const { courseId, title, description, questions, totalMarks, dueDate } = req.body;
    const facultyId = req.user.id;

    // 1. Create the assignment in the database
    const assignment = new Assignment({
        title,
        description,
        course: courseId,
        createdBy: facultyId,
        dueDate: new Date(dueDate),
        totalMarks,
        questions: questions.map(q => ({
            text: q.question,
            marks: q.marks,
            coMapping: q.coMapping,
            bloomLevel: q.bloomLevel
        }))
    });

    await assignment.save();

    // 2. Fetch all students enrolled in this course
    const enrollments = await CourseEnrollment.find({ courseId, status: 'active' }).select('studentId');
    const studentIds = enrollments.map(e => e.studentId);

    // 3. Send bulk notifications to students
    if (studentIds.length > 0) {
        await notificationService.sendBulkNotifications(
            studentIds,
            'assignment',
            'New Assignment Published',
            `A new assignment "${title}" has been published for your course. Due date: ${new Date(dueDate).toLocaleDateString()}.`,
            { assignmentId: assignment._id, courseId }
        );
    }

    res.status(201).json({
        success: true,
        message: 'Assignment published and students notified',
        data: assignment
    });
});
