const Assignment = require('../../models/assessment/assignments/Assignment');
const LabManual = require('../../models/assessment/labs/LabManual');
const Problem = require('../../models/assessment/problems/Problem');
const Section = require('../../models/academic/Section');

/**
 * Assignment Service
 * Manages the distribution of academic tasks (Labs/Problems) to students and sections.
 */
class AssignmentService {
    /**
     * Assign a Lab or Problem to a specific Section
     */
    async assignToSection(options) {
        const { title, taskId, taskType, sectionId, dueDate, totalMarks, facultyId } = options;

        const section = await Section.findById(sectionId).populate('students');
        if (!section) throw new Error("Section not found");

        const assignment = new Assignment({
            title: title || `Assignment: ${taskType}`,
            course: section.semesterId, // Assuming link to current semester's curriculum
            createdBy: facultyId,
            dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
            totalMarks: totalMarks || 100
        });

        if (taskType === 'lab') {
            const lab = await LabManual.findById(taskId);
            if (!lab) throw new Error("Lab Manual not found");
            // Add reference or copy logic if needed. 
            // In our system, LabManual itself can be assigned.
            lab.assignedTo.push(section.semesterId);
            await lab.save();
        } else {
            const problem = await Problem.findById(taskId);
            if (!problem) throw new Error("Problem not found");
            assignment.problems.push(problem._id);
        }

        // Add students from section
        assignment.submissions = section.students.map(sId => ({
            student: sId,
            status: 'pending'
        }));

        await assignment.save();
        return assignment;
    }
}

module.exports = new AssignmentService();
