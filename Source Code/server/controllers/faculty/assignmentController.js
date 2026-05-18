const Assignment = require('../../models/assessment/assignments/Assignment');

/**
 * Create Assignment
 */
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, course, dueDate, problems } = req.body;
        const assignment = new Assignment({
            title,
            description,
            course,
            createdBy: req.user.id,
            dueDate,
            problems
        });
        await assignment.save();
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get Assignments for Course
 */
exports.getAssignmentsByCourse = async (req, res) => {
    try {
        const assignments = await Assignment.find({ course: req.params.courseId })
            .populate('createdBy', 'name')
            .populate('problems', 'title difficulty');
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Submit Assignment
 */
exports.submitAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        const submission = {
            student: req.user.id,
            submittedAt: new Date()
        };
        assignment.submissions.push(submission);
        await assignment.save();
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get Assignment Details
 */
exports.getAssignmentDetails = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('problems')
            .populate('submissions.student', 'name');
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Update Assignment
 */
exports.updateAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete Assignment
 */
exports.deleteAssignment = async (req, res) => {
    try {
        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
