const User = require('../../models/auth/User');
const Certificate = require('../../models/learning/pathway/Certificate');
const LabSubmission = require('../../models/assessment/labs/LabSubmission');

/**
 * Enterprise Portfolio API Controller
 * Provides specialized, read-only data for verification by 
 * third-party recruiters and institutional partners.
 */
class EnterpriseController {

    /**
     * Verify Student Identity and Academic Integrity
     * Used for quick-check verification via QR code on certificates.
     */
    async verifyStudent(req, res) {
        try {
            const { studentId } = req.params;

            const student = await User.findById(studentId)
                .select('firstName lastName studentId programId department profilePicture academicInfo preferences');

            if (!student) {
                return res.status(404).json({
                    success: false,
                    verified: false,
                    message: 'Credential not found in institutional records.'
                });
            }

            // Check privacy settings
            if (student.preferences?.privacy?.profileVisibility === 'private') {
                return res.status(403).json({
                    success: false,
                    verified: true,
                    message: 'Profile is private. Contact student for direct access.'
                });
            }

            const [certificates, topLabs] = await Promise.all([
                Certificate.find({ student: studentId }).populate('course', 'name code'),
                LabSubmission.find({ student: studentId, grade: { $gt: 80 } })
                    .populate('lab', 'title description')
                    .sort({ grade: -1 })
                    .limit(5)
            ]);

            res.status(200).json({
                success: true,
                verified: true,
                data: {
                    identity: {
                        fullName: `${student.firstName} ${student.lastName}`,
                        id: student.studentId,
                        program: student.programId?.name,
                        institution: 'DevMerge University (SOET)'
                    },
                    academicPerformance: {
                        standing: student.academicInfo?.standing || 'Average',
                        gpa: student.academicInfo?.gpa || 'N/A',
                        certificationsCount: certificates.length,
                        eliteLabsCount: topLabs.length
                    },
                    credentials: certificates.map(c => ({
                        title: c.course?.name,
                        issuedOn: c.issuedDate,
                        credentialId: c.certificateId
                    })),
                    showcase: topLabs.map(l => ({
                        title: l.lab?.title,
                        grade: l.grade,
                        attainedOn: l.createdAt
                    }))
                }
            });
        } catch (error) {
            console.error('Enterprise Verification Error:', error);
            res.status(500).json({ success: false, message: 'Internal verification systems offline.' });
        }
    }

    /**
     * Bulk Search (Requires Institutional Token)
     */
    async searchTalent(req, res) {
        try {
            const { skill, minGpa } = req.query;

            const query = {
                role: 'student',
                'academicInfo.gpa': { $gte: parseFloat(minGpa) || 0 },
                'preferences.privacy.profileVisibility': 'public'
            };

            if (skill) {
                query.skills = { $in: [new RegExp(skill, 'i')] };
            }

            const students = await User.find(query)
                .select('firstName lastName academicInfo skills studentId')
                .limit(20);

            res.json({
                success: true,
                results: students.length,
                data: students
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Talent search unavailable.' });
        }
    }
}

module.exports = new EnterpriseController();
