const Course = require('../models/academic/Course');
const Syllabus = require('../models/academic/Syllabus');
const CourseOutcome = require('../models/academic/CourseOutcome');

/**
 * Faculty Copilot Context Builder
 * Assembles academic constraints for AI generation
 */
exports.buildCopilotContext = async (facultyId, courseId, unitId = null, bypassAuth = false) => {
    // 1. Fetch Core Metadata
    const course = await Course.findById(courseId);
    if (!course) throw new Error('Course not found');

    // 2. Role/Security Check - Robust ID comparison
    const isAssigned = course.facultyIds.some(f => f.toString() === facultyId.toString());
    const isDirectFaculty = course.faculty?.toString() === facultyId.toString();

    if (!isAssigned && !isDirectFaculty && !bypassAuth && facultyId !== 'ADMIN') {
        throw new Error('Unauthorized: Faculty not assigned to this course node');
    }

    // 3. Fetch Syllabus Data
    let unitContext = "General Course Level";
    if (unitId && unitId !== 'null' && unitId !== 'undefined') {
        // Only try to fetch unit if unitId is a valid ObjectId
        const mongoose = require('mongoose');
        if (mongoose.Types.ObjectId.isValid(unitId)) {
            const unit = await Syllabus.findById(unitId);
            if (unit) unitContext = `Unit: ${unit.title}\nContent: ${unit.description}`;
        }
    }

    // 4. Fetch Course Outcomes (COs)
    const outcomes = await CourseOutcome.find({ course: courseId });
    const coList = outcomes.map(co => `${co.code}: ${co.description} (Bloom: ${co.bloomsLevel})`).join('\n');

    // 5. Construct Scaffolding
    return {
        system: `You are the Expert Faculty AI Assistant for the course "${course.title}". 
You must strictly follow the provided Course Outcomes (COs) and Syllabus structure.
All output must be pedagogical, accurate, and aligned with Bloom's Taxonomy.`,

        context: `COURSE: ${course.title} (${course.code})
${unitContext}

ALLOWED COURSE OUTCOMES:
${coList || 'No specifically mapped COs found.'}

INSTITUTIONAL RULES:
- Never hallucinate CO codes.
- Ensure Bloom's level alignment for every question/task.
- Output MUST be valid JSON.`,

        courseId,
        metadata: {
            department: course.department,
            credits: course.credits
        }
    };
};
