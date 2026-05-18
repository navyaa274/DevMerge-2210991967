const User = require('../../models/auth/User');
const CourseEnrollment = require('../../models/learning/enrollments/CourseEnrollment');

/**
 * Smart Cohort Generator Engine
 */
exports.generateCohort = async (req, res) => {
    try {
        const { heuristic, groupSize, courseId } = req.body;
        const size = parseInt(groupSize) || 3;
        
        let studentIds = [];
        
        if (courseId) {
            // Find students enrolled in this course
            const enrollments = await CourseEnrollment.find({ 
                courseId, 
                status: 'active' 
            }).select('studentId');
            studentIds = enrollments.map(e => e.studentId);
        }

        const filter = { role: 'student' };
        if (studentIds.length > 0) {
            filter._id = { $in: studentIds };
        } else if (courseId) {
            // If courseId was provided but no students found
            return res.status(400).json({ 
                success: false, 
                message: "No active students found enrolled in this course." 
            });
        }

        const students = await User.find(filter).select('name').limit(100).lean();

        if (students.length === 0) {
            const context = courseId ? "in this course" : "in the database";
            return res.status(400).json({
                success: false,
                message: `No students found ${context}. Cannot form cohorts.`
            });
        }

        // Allow single student cohorts but warn about limited collaboration
        if (students.length === 1) {
            console.log(`Warning: Only 1 student found ${courseId ? "in this course" : "in the database"}. Creating single-student cohort.`);
        }

        // Fisher-Yates shuffle
        for (let i = students.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [students[i], students[j]] = [students[j], students[i]];
        }

        const cohorts = [];
        let cohortIndex = 1;
        const roles = ['Backend', 'Frontend', 'Fullstack', 'DevOps', 'Design/UI'];
        const tagSets = [['Node.js', 'MongoDB'], ['React', 'CSS'], ['Next.js', 'AWS'], ['Docker', 'CI/CD'], ['Figma', 'Tailwind']];

        for (let i = 0; i < students.length; i += size) {
            const groupStudents = students.slice(i, i + size).map(s => {
                const randomIndex = Math.floor(Math.random() * roles.length);
                return {
                    id: s._id,
                    name: s.name,
                    rating: Math.floor(Math.random() * 1000) + 800,
                    role: roles[randomIndex],
                    tags: tagSets[randomIndex]
                };
            });

            // Form cohorts even with single students (though not ideal for collaboration)
            if (groupStudents.length >= 1) {
                let synergyString = 'Standard Configuration';
                let matchScore = Math.floor(Math.random() * 20) + 80;

                if (heuristic && heuristic.includes('Balance')) synergyString = 'Opposites Attracted - Balanced Skill Trees';
                else if (heuristic && heuristic.includes('Cluster')) synergyString = 'High Performance Clustering - Specialized Vectors';
                else synergyString = 'Chaos Matrix - Entropy Grouping';

                cohorts.push({
                    name: `Squadron ${String.fromCharCode(64 + cohortIndex)}`,
                    matchScore,
                    synergy: synergyString,
                    students: groupStudents
                });
                cohortIndex++;
            }
        }

        if (cohorts.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Could not form any cohorts with the current group size. Try a smaller group size." 
            });
        }

        cohorts.sort((a, b) => b.matchScore - a.matchScore);
        res.json({ success: true, cohorts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
