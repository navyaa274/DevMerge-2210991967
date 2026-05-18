const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const Submission = require('../../models/assessment/problems/Submission');
const ultimateGenService = require('../ai/ultimateProblemGeneratorService');

/**
 * Admin Institutional Intelligence (AII) Service
 * Higher-level AI reasoning for University management.
 */
class AdminAiService {
    /**
     * Predictive Attrition Analysis
     * Identifies students at risk of dropping out or failing globally.
     */
    async predictRetentionRisks(departmentId = null) {
        // 1. Fetch failing signals (Low scores + inactivity)
        const query = departmentId ? { department: departmentId, role: 'student' } : { role: 'student' };
        const students = await User.find(query).limit(100); // Sample for AI analysis

        // 2. Fetch recent global performance matrix
        // (Simplified for demo - in production use high-performance aggregations)
        const riskProfiles = students.map(s => ({
            id: s._id,
            name: s.fullName,
            credits: s.creditsEarned || 0,
            lastActive: s.lastActive,
            // Logic: High GPA + High Inactivity = Burnout Risk
            // Low GPA + High Activity = Help Needed
        }));

        const prompt = `
            Analyze these student profiles for "Retention Risk".
            Risk Levels: High (Action Required), Medium (Watchlist), Low (Stable).
            
            Profiles:
            ${JSON.stringify(riskProfiles, null, 2)}
            
            Return JSON: {
                "risks": [
                    { "studentId": "String", "riskLevel": "String", "reason": "AI Insight", "intervention": "Suggested Action" }
                ],
                "globalHealthScore": Number (0-100)
            }
        `;

        try {
            return await ultimateGenService._callAI(prompt, "Institutional Retention Strategist & Data Scientist.");
        } catch (error) {
            console.error("[Admin AI] Retention Error:", error.message);
            throw new Error("Retention analysis currently unavailable.");
        }
    }

    /**
     * Resource Optimization Engine
     * Suggests classroom/faculty allocation based on "Pedagogical Intensity".
     */
    async suggestResourceOptimization(courseId) {
        const course = await Course.findById(courseId).populate('faculty students');
        if (!course) throw new Error("Course not found");

        const prompt = `
            Analyze Resource Allocation for: ${course.name}
            Students Enrolled: ${course.students?.length || 0}
            Credits: ${course.credits}
            
            Suggest:
            1. Optimal Room Type (Lab, Seminar, Lecture Hall)
            2. Teaching Assistant (TA) Requirement (Based on 1:20 ratio)
            3. Specialized Hardware needs (if course is STEM)
            
            Return JSON: {
                "optimization": { "roomType": "String", "taCount": Number, "hardware": ["String"], "justification": "String" }
            }
        `;

        try {
            return await ultimateGenService._callAI(prompt, "University Resource Planner.");
        } catch (error) {
            console.error("[Admin AI] Resource Error:", error.message);
            throw new Error("Resource optimization currently unavailable.");
        }
    }

    /**
     * Grant & Scholarship Auditor
     * Scans for high-potential research/scholarship candidates.
     */
    async auditScholarshipCandidates(departmentId) {
        // Fetch top performers
        const candidates = await User.find({ department: departmentId, role: 'student' })
            .sort({ academicRecord: -1 }) // Assuming an academicRecord score exists
            .limit(10);

        const prompt = `
            Identify top scholarship candidates from this pool.
            Focus on specialty skills (e.g. AI, Cyber, Physics).
            
            Candidates:
            ${JSON.stringify(candidates, null, 2)}
            
            Return JSON: {
                "scholarships": [
                    { "name": "Scholarship Name", "studentId": "ID", "matchScore": Number, "reason": "Why they qualify" }
                ]
            }
        `;

        try {
            return await ultimateGenService._callAI(prompt, "Financial Aid Intelligence Auditor.");
        } catch (error) {
            console.error("[Admin AI] Scholarship Error:", error.message);
            throw new Error("Scholarship audit currently unavailable.");
        }
    }
}

module.exports = new AdminAiService();
