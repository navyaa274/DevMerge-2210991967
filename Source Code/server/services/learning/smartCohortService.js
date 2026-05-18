const StudentWeakness = require('../../models/analytics/StudentWeakness');
const User = require('../../models/auth/User');
const ultimateGenService = require('../ai/ultimateProblemGeneratorService');

/**
 * Smart Cohort & Student Synergy Service
 * Uses AI to optimize student groupings based on complementary skill matrices.
 */
class SmartCohortService {
    /**
     * Suggest optimal student groupings for a course project
     */
    async suggestSynergyGroups(courseId, groupSize = 4) {
        // 1. Fetch all students in the course (simplified: fetch all students in the same department/semester)
        // In a real system, use an Enrollment model.
        const students = await StudentWeakness.find({ course: courseId }).populate('student');

        if (students.length < groupSize) {
            throw new Error("Not enough students to form groups.");
        }

        // 2. Prepare Profiles for AI
        const studentProfiles = students.map(s => ({
            id: s.student?._id,
            name: s.student?.fullName,
            strengths: s.masteryScores.filter(m => m.score > 75).map(m => m.topic),
            weaknesses: s.weakTopics.map(w => w.topic)
        }));

        // 3. Ask AI to perform "Synergy Clustering"
        const prompt = `
            Task: Organize these students into teams of ${groupSize} based on "Complementary Strengths".
            Goal: Each team should have a balanced skill set (e.g., if one lacks SQL, add an SQL expert).

            Students:
            ${JSON.stringify(studentProfiles, null, 2)}

            Return JSON: {
                "groups": [
                    {
                        "teamName": "String",
                        "members": ["Student ID 1", "Student ID 2"],
                        "synergyScore": Number (0-100),
                        "description": "Why this team works well together"
                    }
                ],
                "leftovers": ["Student IDs"]
            }
        `;

        try {
            const clustering = await ultimateGenService._callAI(prompt, "Expert Team Architect & Organizational Psychologist.");
            return clustering;
        } catch (error) {
            console.error("[Smart Cohort] Synergy Error:", error.message);
            throw new Error("Smart grouping currently unavailable.");
        }
    }
}

module.exports = new SmartCohortService();
