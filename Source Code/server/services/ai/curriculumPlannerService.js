const Syllabus = require('../../models/academic/Syllabus');
const Course = require('../../models/academic/Course');
const ultimateGenService = require('./ultimateProblemGeneratorService');
const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

/**
 * Curriculum Planner Service
 * Handles batch generation of Syllabuses and Lab Manuals for entire semesters
 */
class CurriculumPlannerService {
    /**
     * Generate a weekly Syllabus for a course if it doesn't exist
     */
    async generateSyllabusForCourse(courseId, userId) {
        const course = await Course.findById(courseId).populate('program');
        if (!course) throw new Error("Course not found");

        console.log(`[CurriculumPlanner] Planning syllabus for ${course.name}`);

        const prompt = `
            Task: Create a 15-week academic syllabus schedule.
            Course: ${course.name}
            Program: ${course.program?.name}
            Semester: ${course.semester}
            
            Return JSON: {
                "weeks": [
                    {
                        "weekNumber": 1..15,
                        "topic": "String",
                        "learningObjectives": ["String"],
                        "suggestedLabType": "Programming|Simulation|Hardware",
                        "difficulty": "Easy|Medium|Hard"
                    }
                ]
            }
        `;

        const syllabusData = await ultimateGenService._callAI(prompt, "Academic Dean. Expert in curriculum design.");

        let syllabus = await Syllabus.findOne({ course: courseId });
        if (syllabus) {
            syllabus.weeks = syllabusData.weeks;
            syllabus.isAiGenerated = true;
            syllabus.lastGeneratedAt = new Date();
        } else {
            syllabus = new Syllabus({
                course: courseId,
                program: course.program?._id,
                semester: course.semester,
                weeks: syllabusData.weeks,
                isAiGenerated: true,
                lastGeneratedAt: new Date()
            });
        }

        await syllabus.save();
        return syllabus;
    }

    /**
     * Batch generate all labs for a syllabus
     */
    async batchGenerateLabs(syllabusId, userId) {
        const syllabus = await Syllabus.findById(syllabusId).populate('course');
        if (!syllabus) throw new Error("Syllabus not found");

        console.log(`[CurriculumPlanner] Batch generating labs for ${syllabus.course.name}`);

        const results = [];
        for (const week of syllabus.weeks) {
            try {
                const lab = await ultimateGenService.generateLabManual({
                    programCode: syllabus.course.code.split('-')[0], // Approximation
                    semester: syllabus.semester,
                    subjectName: syllabus.course.name,
                    topic: week.topic,
                    difficulty: week.difficulty,
                    labNumber: week.weekNumber,
                    userId
                });
                results.push({ week: week.weekNumber, status: 'Success', labId: lab._id });
            } catch (err) {
                console.error(`[CurriculumPlanner] Week ${week.weekNumber} failed:`, err.message);
                results.push({ week: week.weekNumber, status: 'Failed', error: err.message });
            }
        }

        syllabus.lastGeneratedAt = new Date();
        await syllabus.save();

        return results;
    }
}

module.exports = new CurriculumPlannerService();
