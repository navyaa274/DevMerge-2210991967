const jsPDF = require('jspdf');
const fs = require('fs');
const path = require('path');

/**
 * PDF Generator Utility
 * Generates PDFs for certificates, lab reports, and other documents
 */

class PDFGenerator {
    constructor() {
        this.defaultFont = 'helvetica';
        this.titleSize = 24;
        this.headingSize = 18;
        this.bodySize = 12;
        this.smallSize = 10;
    }

    /**
     * Generate Certificate PDF
     */
    async generateCertificate(data) {
        const {
            studentName,
            courseName,
            completionDate,
            grade,
            instructorName,
            certificateId,
            signatureBase64 = null
        } = data;

        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Background
        doc.setFillColor(245, 245, 250);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');

        // Border
        doc.setDrawColor(59, 130, 246);
        doc.setLineWidth(2);
        doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

        // Inner border
        doc.setDrawColor(147, 197, 253);
        doc.setLineWidth(1);
        doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

        // Title
        doc.setFont(this.defaultFont, 'bold');
        doc.setFontSize(this.titleSize);
        doc.setTextColor(31, 41, 55);
        doc.text('Certificate of Completion', pageWidth / 2, 40, { align: 'center' });

        // Subtitle
        doc.setFont(this.defaultFont, 'normal');
        doc.setFontSize(this.headingSize);
        doc.setTextColor(75, 85, 99);
        doc.text('This is to certify that', pageWidth / 2, 60, { align: 'center' });

        // Student Name
        doc.setFont(this.defaultFont, 'bold');
        doc.setFontSize(28);
        doc.setTextColor(31, 41, 55);
        doc.text(studentName, pageWidth / 2, 80, { align: 'center' });

        // Achievement text
        doc.setFont(this.defaultFont, 'normal');
        doc.setFontSize(this.bodySize);
        doc.setTextColor(75, 85, 99);
        doc.text('has successfully completed the course', pageWidth / 2, 100, { align: 'center' });

        // Course Name
        doc.setFont(this.defaultFont, 'bold');
        doc.setFontSize(this.headingSize);
        doc.setTextColor(31, 41, 55);
        doc.text(courseName, pageWidth / 2, 115, { align: 'center' });

        // Grade and Date
        doc.setFont(this.defaultFont, 'normal');
        doc.setFontSize(this.bodySize);
        doc.setTextColor(75, 85, 99);
        doc.text(`with a grade of ${grade}`, pageWidth / 2, 130, { align: 'center' });
        doc.text(`on ${new Date(completionDate).toLocaleDateString()}`, pageWidth / 2, 140, { align: 'center' });

        // Certificate ID
        doc.setFont(this.defaultFont, 'italic');
        doc.setFontSize(this.smallSize);
        doc.setTextColor(156, 163, 175);
        doc.text(`Certificate ID: ${certificateId}`, pageWidth - 20, pageHeight - 20, { align: 'right' });

        // Instructor signature area
        const signatureY = pageHeight - 50;
        doc.setDrawColor(156, 163, 175);
        doc.line(30, signatureY, 100, signatureY);

        doc.setFont(this.defaultFont, 'normal');
        doc.setFontSize(this.smallSize);
        doc.setTextColor(75, 85, 99);
        doc.text('Instructor Signature', 65, signatureY + 5, { align: 'center' });
        doc.text(instructorName, 65, signatureY + 10, { align: 'center' });

        // Date line
        doc.line(pageWidth - 100, signatureY, pageWidth - 30, signatureY);
        doc.text('Date', pageWidth - 65, signatureY + 5, { align: 'center' });
        doc.text(new Date().toLocaleDateString(), pageWidth - 65, signatureY + 10, { align: 'center' });

        // Add watermark/logo if available
        if (signatureBase64) {
            try {
                doc.addImage(signatureBase64, 'PNG', pageWidth - 40, 20, 30, 30);
            } catch (error) {
                console.log('Could not add signature image:', error.message);
            }
        }

        return doc;
    }

    /**
     * Generate Lab Report PDF
     */
    async generateLabReport(data) {
        const {
            studentName,
            studentId,
            labTitle,
            courseName,
            labCode,
            submissionDate,
            code,
            output,
            vivaAnswers = {},
            labReport = '',
            instructorFeedback = '',
            grade
        } = data;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;

        // Header
        doc.setFont(this.defaultFont, 'bold');
        doc.setFontSize(this.titleSize);
        doc.setTextColor(31, 41, 55);
        doc.text('Lab Report', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Student Info
        doc.setFont(this.defaultFont, 'normal');
        doc.setFontSize(this.bodySize);
        doc.setTextColor(75, 85, 99);

        const studentInfo = [
            `Name: ${studentName}`,
            `ID: ${studentId}`,
            `Course: ${courseName}`,
            `Lab: ${labTitle} (${labCode})`,
            `Submission Date: ${new Date(submissionDate).toLocaleDateString()}`
        ];

        studentInfo.forEach(info => {
            doc.text(info, 20, yPosition);
            yPosition += 8;
        });

        yPosition += 10;

        // Lab Report Section
        if (labReport) {
            doc.setFont(this.defaultFont, 'bold');
            doc.setFontSize(this.headingSize);
            doc.setTextColor(31, 41, 55);
            doc.text('Lab Report', 20, yPosition);
            yPosition += 10;

            doc.setFont(this.defaultFont, 'normal');
            doc.setFontSize(this.bodySize);
            doc.setTextColor(75, 85, 99);

            const reportLines = doc.splitTextToSize(labReport, pageWidth - 40);
            reportLines.forEach(line => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                doc.text(line, 20, yPosition);
                yPosition += 6;
            });
            yPosition += 10;
        }

        // Code Section
        if (code) {
            doc.setFont(this.defaultFont, 'bold');
            doc.setFontSize(this.headingSize);
            doc.setTextColor(31, 41, 55);
            doc.text('Source Code', 20, yPosition);
            yPosition += 10;

            doc.setFont('courier');
            doc.setFontSize(10);
            doc.setTextColor(31, 41, 55);

            const codeLines = code.split('\n');
            codeLines.forEach((line, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                const truncatedLine = line.length > 80 ? line.substring(0, 77) + '...' : line;
                doc.text(`${index + 1}. ${truncatedLine}`, 20, yPosition);
                yPosition += 5;
            });
            yPosition += 10;
        }

        // Output Section
        if (output) {
            doc.setFont(this.defaultFont, 'bold');
            doc.setFontSize(this.headingSize);
            doc.setTextColor(31, 41, 55);
            doc.text('Program Output', 20, yPosition);
            yPosition += 10;

            doc.setFont('courier');
            doc.setFontSize(10);
            doc.setTextColor(75, 85, 99);

            const outputLines = output.split('\n');
            outputLines.forEach(line => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                const truncatedLine = line.length > 80 ? line.substring(0, 77) + '...' : line;
                doc.text(truncatedLine, 20, yPosition);
                yPosition += 5;
            });
            yPosition += 10;
        }

        // Viva Questions Section
        if (Object.keys(vivaAnswers).length > 0) {
            doc.setFont(this.defaultFont, 'bold');
            doc.setFontSize(this.headingSize);
            doc.setTextColor(31, 41, 55);
            doc.text('Viva Questions', 20, yPosition);
            yPosition += 10;

            doc.setFont(this.defaultFont, 'normal');
            doc.setFontSize(this.bodySize);
            doc.setTextColor(75, 85, 99);

            Object.entries(vivaAnswers).forEach(([question, answer], index) => {
                if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFont(this.defaultFont, 'bold');
                doc.text(`Q${index + 1}: ${question}`, 20, yPosition);
                yPosition += 8;

                doc.setFont(this.defaultFont, 'normal');
                const answerLines = doc.splitTextToSize(answer, pageWidth - 40);
                answerLines.forEach(line => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, 25, yPosition);
                    yPosition += 6;
                });
                yPosition += 5;
            });
        }

        // Feedback and Grade (if available)
        if (instructorFeedback || grade) {
            if (yPosition > 200) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFont(this.defaultFont, 'bold');
            doc.setFontSize(this.headingSize);
            doc.setTextColor(31, 41, 55);
            doc.text('Instructor Evaluation', 20, yPosition);
            yPosition += 10;

            if (grade) {
                doc.setFont(this.defaultFont, 'normal');
                doc.setFontSize(this.bodySize);
                doc.setTextColor(75, 85, 99);
                doc.text(`Grade: ${grade}`, 20, yPosition);
                yPosition += 8;
            }

            if (instructorFeedback) {
                doc.text('Feedback:', 20, yPosition);
                yPosition += 8;

                const feedbackLines = doc.splitTextToSize(instructorFeedback, pageWidth - 40);
                feedbackLines.forEach(line => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }
                    doc.text(line, 20, yPosition);
                    yPosition += 6;
                });
            }
        }

        return doc;
    }

    /**
     * Generate Transcript PDF
     */
    async generateTranscript(data) {
        const {
            studentName,
            studentId,
            program,
            courses = [],
            gpa,
            totalCredits,
            graduationDate
        } = data;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;

        // Header
        doc.setFont(this.defaultFont, 'bold');
        doc.setFontSize(this.titleSize);
        doc.setTextColor(31, 41, 55);
        doc.text('Academic Transcript', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Student Info
        doc.setFont(this.defaultFont, 'normal');
        doc.setFontSize(this.bodySize);
        doc.setTextColor(75, 85, 99);

        const studentInfo = [
            `Name: ${studentName}`,
            `Student ID: ${studentId}`,
            `Program: ${program}`,
            `GPA: ${gpa}`,
            `Total Credits: ${totalCredits}`
        ];

        if (graduationDate) {
            studentInfo.push(`Graduation Date: ${new Date(graduationDate).toLocaleDateString()}`);
        }

        studentInfo.forEach(info => {
            doc.text(info, 20, yPosition);
            yPosition += 8;
        });

        yPosition += 15;

        // Courses Table Header
        doc.setFont(this.defaultFont, 'bold');
        doc.setFontSize(this.bodySize);
        doc.setTextColor(31, 41, 55);

        const tableHeaders = ['Course Code', 'Course Name', 'Credits', 'Grade', 'Semester'];
        const columnWidths = [30, 80, 20, 20, 40];
        let xPos = 20;

        tableHeaders.forEach((header, index) => {
            doc.text(header, xPos, yPosition);
            xPos += columnWidths[index];
        });
        yPosition += 10;

        // Table Line
        doc.setDrawColor(156, 163, 175);
        doc.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 5;

        // Courses Data
        doc.setFont(this.defaultFont, 'normal');
        courses.forEach(course => {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
                // Repeat headers on new page
                doc.setFont(this.defaultFont, 'bold');
                xPos = 20;
                tableHeaders.forEach((header, index) => {
                    doc.text(header, xPos, yPosition);
                    xPos += columnWidths[index];
                });
                yPosition += 10;
                doc.line(20, yPosition, pageWidth - 20, yPosition);
                yPosition += 5;
                doc.setFont(this.defaultFont, 'normal');
            }

            xPos = 20;
            const courseData = [
                course.code || '',
                course.name || '',
                course.credits?.toString() || '',
                course.grade || '',
                course.semester || ''
            ];

            courseData.forEach((data, index) => {
                const truncatedData = data.length > 15 ? data.substring(0, 12) + '...' : data;
                doc.text(truncatedData, xPos, yPosition);
                xPos += columnWidths[index];
            });
            yPosition += 8;
        });

        return doc;
    }

    /**
     * Generate Comprehensive Student Portfolio PDF
     */
    async generatePortfolio(data) {
        const {
            studentName,
            studentId,
            program,
            tagline = 'Aspiring Software Engineer',
            skills = [],
            projects = [],
            certificates = [],
            stats = { totalLabs: 0, avgGrade: 'N/A' }
        } = data;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 20;

        // Cover Page
        doc.setFillColor(30, 41, 59); // Dark blue header
        doc.rect(0, 0, pageWidth, 60, 'F');

        doc.setFontSize(28);
        doc.setTextColor(255, 255, 255);
        doc.setFont(this.defaultFont, 'bold');
        doc.text(studentName, 20, 35);

        doc.setFontSize(14);
        doc.setFont(this.defaultFont, 'normal');
        doc.text(tagline, 20, 45);

        y = 75;

        // Profile Section
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(18);
        doc.setFont(this.defaultFont, 'bold');
        doc.text('Profile Overview', 20, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont(this.defaultFont, 'normal');
        doc.text(`Student ID: ${studentId}`, 20, y);
        y += 7;
        doc.text(`Program: ${program}`, 20, y);
        y += 7;
        doc.text(`Academic Performance: ${stats.avgGrade} avg. grade`, 20, y);
        y += 15;

        // Skills Section
        if (skills.length > 0) {
            doc.setFontSize(18);
            doc.setFont(this.defaultFont, 'bold');
            doc.text('Technical Stack', 20, y);
            y += 10;

            doc.setFontSize(11);
            doc.setFont(this.defaultFont, 'normal');
            const skillsText = skills.join('  •  ');
            const skillsLines = doc.splitTextToSize(skillsText, pageWidth - 40);
            doc.text(skillsLines, 20, y);
            y += (skillsLines.length * 6) + 10;
        }

        // Projects/Labs Section
        if (projects.length > 0) {
            doc.setFontSize(18);
            doc.setFont(this.defaultFont, 'bold');
            doc.text('Featured Lab Projects', 20, y);
            y += 10;

            projects.slice(0, 5).forEach(project => {
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }
                doc.setFontSize(12);
                doc.setFont(this.defaultFont, 'bold');
                doc.text(project.title, 20, y);
                doc.setFont(this.defaultFont, 'normal');
                doc.setFontSize(10);
                doc.text(`${new Date(project.date).toLocaleDateString()} | Score: ${project.score}%`, pageWidth - 20, y, { align: 'right' });
                y += 6;

                const descLines = doc.splitTextToSize(project.description || 'Verified coding assessment on DevMerge Platform.', pageWidth - 40);
                doc.text(descLines, 20, y);
                y += (descLines.length * 5) + 8;
            });
        }

        // Certifications
        if (certificates.length > 0) {
            if (y > 220) {
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(18);
            doc.setFont(this.defaultFont, 'bold');
            doc.text('Professional Certifications', 20, y);
            y += 10;

            certificates.forEach(cert => {
                doc.setFontSize(12);
                doc.setFont(this.defaultFont, 'normal');
                doc.text(`• ${cert.courseName}`, 25, y);
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Issued: ${new Date(cert.date).toLocaleDateString()} (ID: ${cert.id})`, 30, y + 5);
                doc.setTextColor(30, 41, 59);
                y += 12;
            });
        }

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated by DevMerge AI Performance Portfolio', pageWidth / 2, pageHeight - 10, { align: 'center' });

        return doc;
    }

    /**
     * Save PDF to file
     */
    async savePDF(doc, filename, outputPath = null) {
        const defaultPath = outputPath || path.join(__dirname, '../uploads/pdfs');

        // Create directory if it doesn't exist
        if (!fs.existsSync(defaultPath)) {
            fs.mkdirSync(defaultPath, { recursive: true });
        }

        const filePath = path.join(defaultPath, filename);
        doc.save(filePath);
        return filePath;
    }

    /**
     * Get PDF as Buffer
     */
    getPDFBuffer(doc) {
        return doc.output('arraybuffer');
    }

    /**
     * Get PDF as Base64
     */
    getPDFBase64(doc) {
        return doc.output('datauristring');
    }
}

module.exports = new PDFGenerator();
