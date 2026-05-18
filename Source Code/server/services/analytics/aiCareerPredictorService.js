const StudentWeakness = require('../../models/analytics/StudentWeakness');
const UserPoints = require('../../models/learning/gamification/UserPoints');
const ultimateGenService = require('../ai/ultimateProblemGeneratorService');

/**
 * AI Career Path Predictor Service
 * Predicts the ideal career trajectory for a student based on their multi-semester skill matrix.
 */
class AiCareerPredictorService {
    /**
     * Generate a Career Projection for a student
     */
    async predictCareerPath(studentId) {
        // 1. Gather all analytical data for the student
        const weaknesses = await StudentWeakness.find({ student: studentId }).populate('course');
        const points = await UserPoints.findOne({ user: studentId });

        if (!weaknesses || weaknesses.length === 0) {
            return {
                message: "Insufficient data to predict career path. Complete more labs!",
                recommendation: "Focus on completing Core CS labs."
            };
        }

        // 2. Build Skill Profile
        const skillProfile = {
            strongTopics: [],
            weakTopics: [],
            level: points?.level || 1,
            totalXP: points?.experiencePoints || 0
        };

        weaknesses.forEach(record => {
            // Strong topics (Success rate > 80%)
            // We'll approximate from masteryScores if available, or compute from non-weak topics
            record.masteryScores.forEach(m => {
                if (m.score > 80) skillProfile.strongTopics.push(m.topic);
            });

            record.weakTopics.forEach(w => {
                skillProfile.weakTopics.push(w.topic);
            });
        });

        // Unique values
        skillProfile.strongTopics = [...new Set(skillProfile.strongTopics)];
        skillProfile.weakTopics = [...new Set(skillProfile.weakTopics)];

        // 3. Call AI for Career Projection
        const prompt = `
            Act as a Strategic Career Advisor for a University Student.
            
            Student Profile:
            - Strong Skills: ${skillProfile.strongTopics.join(', ')}
            - Weaknesses: ${skillProfile.weakTopics.join(', ')}
            - Gamification Level: ${skillProfile.level}

            Task:
            1. Predict 3 ideal career roles (e.g., Cloud Architect, React Developer, Data Scientist).
            2. For each role, provide a "Match %" based on their skills.
            3. Highlight the #1 "Skill Gap" they need to fix.
            4. Provide a 12-month Roadmap summary.

            Return JSON: {
                "projections": [
                    { "role": "String", "matchPercentage": Number, "reason": "String" }
                ],
                "skillGap": "String",
                "salaryProjection": "String (Estimated range in USD/INR)",
                "roadmap": "String"
            }
        `;

        try {
            const projection = await ultimateGenService._callAI(prompt, "Expert Technical Recruiter & Career Coach.");
            return projection;
        } catch (error) {
            console.error("[Career Predictor] AI Error:", error.message);
            throw new Error("Career prediction currently unavailable.");
        }
    }
}

module.exports = new AiCareerPredictorService();
