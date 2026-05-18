const StudentWeakness = require('../../models/analytics/StudentWeakness');
const Syllabus = require('../../models/academic/Syllabus');
const CourseMaterial = require('../../models/academic/CourseMaterial');
const { classifyStudentLevel } = require('../../utils/studentLevelClassifier');
const { calculateTopicPriorities } = require('../../utils/studyPriorityAlgorithm');
const { allocateTime } = require('../../utils/studyTimeAllocator');

/**
 * Study Plan Engine
 * Generates a structured multi-week roadmap
 */
exports.generateStudyPlan = async (studentId, courseId, weeks = 1) => {
    // 1. Fetch Performance & Academic Context
    const level = await classifyStudentLevel(studentId, courseId);
    const weaknessProfile = await StudentWeakness.findOne({ student: studentId, course: courseId });
    const syllabus = await Syllabus.find({ course: courseId }).sort({ order: 1 });

    // 2. Fetch Environmental Data (Example: Exams)
    const upcomingExams = [];

    // 3. Rank Topics
    const priorities = calculateTopicPriorities(syllabus, weaknessProfile, upcomingExams);

    // 4. Generate Weekly Roadmap
    const plan = [];

    for (let w = 1; w <= weeks; w++) {
        // We select the top candidates for this week
        const weeklyTopics = priorities.slice((w - 1) * 3, w * 3);
        const { topics, totalBudget } = allocateTime(level, weeklyTopics);

        // Enhance with recommended materials
        const enhancedTopics = await Promise.all(topics.map(async (t) => {
            const materials = await CourseMaterial.find({
                courseId,
                title: { $regex: new RegExp(t.topic, 'i') }
            }).limit(2);

            return {
                ...t,
                materialLinks: materials.map(m => m.url)
            };
        }));

        plan.push({
            week: w,
            totalHours: totalBudget,
            focusTopics: enhancedTopics
        });
    }

    return {
        studentLevel: level,
        courseId,
        duration: `${weeks} Week(s)`,
        plan
    };
};
