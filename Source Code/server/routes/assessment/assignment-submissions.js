const express = require('express');
const router = express.Router();
const AssignmentSubmission = require('../../models/assessment/assignments/AssignmentSubmission');
const Assignment = require('../../models/assessment/assignments/Assignment');
const { authenticate } = require('../../middleware/auth');

/**
 * @route   POST /api/assignment-submissions
 * @desc    Submit an assignment
 * @access  Private (Student)
 */
router.post('/', authenticate, async (req, res) => {
    try {
        const { assignmentId, content, submissionType = 'text' } = req.body;

        // Check if duplicate submission
        const existing = await AssignmentSubmission.findOne({
            assignment: assignmentId,
            student: req.user.id
        });

        if (existing) {
            return res.status(400).json({ error: 'You have already submitted this assignment.' });
        }

        const assignment = await Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json({ error: 'Assignment not found' });
        }

        const submission = new AssignmentSubmission({
            assignment: assignmentId,
            student: req.user.id,
            course: assignment.course,
            content,
            submissionType,
            status: 'submitted'
        });

        await submission.save();

        res.json({
            success: true,
            message: 'Assignment submitted successfully',
            submission
        });
    } catch (error) {
        console.error('Error submitting assignment:', error);
        res.status(500).json({ error: 'Failed to submit assignment', details: error.message });
    }
});

/**
 * @route   GET /api/assignment-submissions/my
 * @desc    Get current student's submissions
 * @access  Private (Student)
 */
router.get('/my', authenticate, async (req, res) => {
    try {
        const submissions = await AssignmentSubmission.find({ student: req.user.id })
            .populate('assignment', 'title description dueDate')
            .sort({ submittedAt: -1 });

        res.json({
            success: true,
            submissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

/**
 * @route   GET /api/assignment-submissions/assignment/all
 * @desc    Get all submissions for a specific course (Faculty)
 * @access  Private (Faculty/Admin)
 */
router.get('/assignment/all', authenticate, async (req, res) => {
    try {
        const { course } = req.query;
        if (!course) return res.status(400).json({ error: 'Course ID required' });

        const submissions = await AssignmentSubmission.find({ course })
            .populate('student', 'name email')
            .populate('assignment', 'title')
            .sort({ submittedAt: -1 });

        res.json({
            success: true,
            submissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

/**
 * @route   GET /api/assignment-submissions/assignment/:assignmentId
 * @desc    Get submissions for a specific assignment (Faculty)
 * @access  Private (Faculty/Admin)
 */
router.get('/assignment/:assignmentId', authenticate, async (req, res) => {
    try {
        const submissions = await AssignmentSubmission.find({ assignment: req.params.assignmentId })
            .populate('student', 'name email');

        res.json({
            success: true,
            submissions
        });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

/**
 * @route   PUT /api/assignment-submissions/:id/grade
 * @desc    Grade an assignment submission
 * @access  Private (Faculty/Admin)
 */
router.put('/:id/grade', authenticate, async (req, res) => {
    try {
        const { grade, feedback } = req.body;

        const submission = await AssignmentSubmission.findById(req.params.id);
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        submission.grade = grade;
        submission.status = 'graded';
        submission.feedback = feedback;
        submission.gradedBy = req.user.id;
        submission.gradedAt = new Date();

        await submission.save();

        res.json({
            success: true,
            message: 'Grade recorded successfully',
            submission
        });
    } catch (error) {
        console.error('Error grading assignment:', error);
        res.status(500).json({ error: 'Failed to grade assignment' });
    }
});

module.exports = router;
