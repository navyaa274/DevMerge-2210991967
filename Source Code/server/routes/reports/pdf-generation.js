const express = require('express');
const router = express.Router();
const pdfGenerator = require('../../utils/pdfGenerator');
const Certificate = require('../../models/learning/pathway/Certificate');
const LabSubmission = require('../../models/assessment/labs/LabSubmission');
const User = require('../../models/auth/User');
const { authenticate } = require('../../middleware/auth');

/**
 * Generate Certificate PDF
 */
router.post('/certificate/:certificateId', authenticate, async (req, res) => {
    try {
        const { certificateId } = req.params;
        const userId = req.user.id;

        // Get certificate details
        const certificate = await Certificate.findOne({
            _id: certificateId,
            userId: userId
        }).populate('courseId').populate('userId');

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: 'Certificate not found'
            });
        }

        // Generate PDF
        const pdfDoc = await pdfGenerator.generateCertificate({
            studentName: certificate.userId.name,
            courseName: certificate.courseId?.title || certificate.title,
            completionDate: certificate.issuedDate,
            grade: certificate.grade || 'A+',
            instructorName: certificate.issuedBy || 'Course Instructor',
            certificateId: certificate.certificateId,
            signatureBase64: certificate.signatureBase64
        });

        // Return PDF as download
        const pdfBuffer = pdfGenerator.getPDFBuffer(pdfDoc);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificateId}.pdf"`);
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Certificate PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate certificate PDF'
        });
    }
});

/**
 * Generate Lab Report PDF
 */
router.post('/lab-report/:submissionId', authenticate, async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user.id;

        // Get lab submission details
        const submission = await LabSubmission.findOne({
            _id: submissionId,
            user: userId
        }).populate('lab').populate('user');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Lab submission not found'
            });
        }

        // Generate PDF
        const pdfDoc = await pdfGenerator.generateLabReport({
            studentName: submission.user.name,
            studentId: submission.user._id,
            labTitle: submission.lab.title,
            courseName: submission.lab.course?.title || 'N/A',
            labCode: submission.lab.code || 'LAB001',
            submissionDate: submission.createdAt,
            code: submission.submissionData?.code || '',
            output: submission.submissionData?.output || '',
            vivaAnswers: submission.submissionData?.vivaAnswers || {},
            labReport: submission.submissionData?.labReport || '',
            instructorFeedback: submission.feedback || '',
            grade: submission.grade || 'Not graded'
        });

        // Return PDF as download
        const pdfBuffer = pdfGenerator.getPDFBuffer(pdfDoc);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="lab-report-${submissionId}.pdf"`);
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Lab report PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate lab report PDF'
        });
    }
});

/**
 * Generate Transcript PDF (Admin/Faculty only)
 */
router.post('/transcript/:studentId', authenticate, async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUserRole = req.user.role;

        // Check permissions (student can only get their own, faculty/admin can get any)
        if (requestingUserRole === 'student' && req.user.id !== studentId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get student details with courses
        const student = await User.findById(studentId)
            .populate({
                path: 'courseEnrollments',
                populate: {
                    path: 'course',
                    select: 'title code credits'
                }
            });

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Calculate GPA and total credits
        let totalCredits = 0;
        let totalGradePoints = 0;
        const courses = [];

        student.courseEnrollments.forEach(enrollment => {
            if (enrollment.course && enrollment.grade) {
                const credits = enrollment.course.credits || 3;
                const gradePoints = getGradePoints(enrollment.grade);

                totalCredits += credits;
                totalGradePoints += gradePoints * credits;

                courses.push({
                    code: enrollment.course.code,
                    name: enrollment.course.title,
                    credits: credits,
                    grade: enrollment.grade,
                    semester: enrollment.semester || 'N/A'
                });
            }
        });

        const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';

        // Generate PDF
        const pdfDoc = await pdfGenerator.generateTranscript({
            studentName: student.name,
            studentId: student._id,
            program: student.program || 'Computer Science',
            courses: courses,
            gpa: gpa,
            totalCredits: totalCredits,
            graduationDate: student.graduationDate
        });

        // Return PDF as download
        const pdfBuffer = pdfGenerator.getPDFBuffer(pdfDoc);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="transcript-${studentId}.pdf"`);
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Transcript PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate transcript PDF'
        });
    }
});

/**
 * Bulk generate certificates for a course (Admin/Faculty only)
 */
router.post('/bulk-certificates/:courseId', authenticate, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userRole = req.user.role;

        if (!['admin', 'faculty'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Get all certificates for the course
        const certificates = await Certificate.find({ courseId: courseId })
            .populate('userId')
            .populate('courseId');

        if (certificates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No certificates found for this course'
            });
        }

        // Generate ZIP file with all certificates
        const JSZip = require('jszip');
        const zip = new JSZip();

        for (const certificate of certificates) {
            const pdfDoc = await pdfGenerator.generateCertificate({
                studentName: certificate.userId.name,
                courseName: certificate.courseId?.title || certificate.title,
                completionDate: certificate.issuedDate,
                grade: certificate.grade || 'A+',
                instructorName: certificate.issuedBy || 'Course Instructor',
                certificateId: certificate.certificateId,
                signatureBase64: certificate.signatureBase64
            });

            const pdfBuffer = pdfGenerator.getPDFBuffer(pdfDoc);
            zip.file(`certificate-${certificate.userId.name}-${certificate.certificateId}.pdf`, pdfBuffer);
        }

        // Generate ZIP and send
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="certificates-course-${courseId}.zip"`);
        res.send(zipBuffer);

    } catch (error) {
        console.error('Bulk certificate generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate bulk certificates'
        });
    }
});

/**
 * Helper function to convert grade to grade points
 */
/**
 * Generate Comprehensive Portfolio PDF
 */
router.post('/portfolio/:studentId', authenticate, async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Security: Students only for self, Faculty/Admin for all
        if (requestingUser.role === 'student' && requestingUser.id !== studentId) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        // 1. Fetch Aggregated Data
        const student = await User.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const [labs, certificates] = await Promise.all([
            LabSubmission.find({ user: studentId, grade: { $ne: null } }).populate('lab').sort({ grade: -1 }).limit(10),
            Certificate.find({ userId: studentId }).populate('courseId')
        ]);

        // 2. Prepare Data for PDF
        const portfolioData = {
            studentName: `${student.firstName} ${student.lastName}`,
            studentId: student.studentId || student._id,
            program: student.program || 'Computer Science Engineering',
            tagline: student.tagline || 'Student at DevMerge University',
            skills: student.skills?.length > 0 ? student.skills : ['JavaScript', 'Python', 'Logic', 'Engineering'],
            projects: labs.map(l => ({
                title: l.lab?.title || 'Coding Challenge',
                date: l.createdAt,
                score: l.grade,
                description: l.lab?.description?.substring(0, 150) + '...'
            })),
            certificates: certificates.map(c => ({
                courseName: c.courseId?.name || c.title,
                date: c.issueDate,
                id: c.certificateNumber
            })),
            stats: {
                totalLabs: labs.length,
                avgGrade: labs.length > 0 ? (labs.reduce((s, l) => s + (parseFloat(l.grade) || 0), 0) / labs.length).toFixed(1) : 'N/A'
            },
            socialLinks: student.socialLinks
        };

        // 3. Generate PDF
        const pdfDoc = await pdfGenerator.generatePortfolio(portfolioData);
        const pdfBuffer = pdfGenerator.getPDFBuffer(pdfDoc);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="portfolio-${studentId}.pdf"`);
        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error('Portfolio PDF generation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

function getGradePoints(grade) {
    const gradeScale = {
        'A+': 4.0,
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'C-': 1.7,
        'D+': 1.3,
        'D': 1.0,
        'F': 0.0
    };

    return gradeScale[grade.toUpperCase()] || 0.0;
}

module.exports = router;
