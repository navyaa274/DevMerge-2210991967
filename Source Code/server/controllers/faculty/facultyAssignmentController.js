const assignmentService = require('../../services/learning/assignmentService');

const facultyAssignmentController = {
    /**
     * Assign an AI-generated task (Lab or Problem) to a section
     */
    assignTask: async (req, res) => {
        try {
            const { title, taskId, taskType, sectionId, dueDate, totalMarks } = req.body;

            const assignment = await assignmentService.assignToSection({
                title,
                taskId,
                taskType,
                sectionId,
                dueDate,
                totalMarks,
                facultyId: req.user.id
            });

            res.status(201).json({
                success: true,
                message: 'Task assigned to section successfully',
                data: assignment
            });
        } catch (error) {
            console.error('[Faculty Assignment] Error:', error);
            res.status(500).json({ success: false, message: error.message });
        }
    }
};

module.exports = facultyAssignmentController;
