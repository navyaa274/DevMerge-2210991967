const Submission = require('../../models/assessment/problems/Submission');
const PlagiarismReport = require('../../models/assessment/logic/PlagiarismReport');
const Embedding = require('../../models/admin/Embedding');
const { generateEmbedding } = require('../../utils/embeddingService');
const ultimateGenService = require('./ultimateProblemGeneratorService');

/**
 * Plagiarism Detection Service
 * Detects code similarity using vector embeddings and AI-driven semantic analysis.
 */
class PlagiarismService {
    /**
     * Check a new submission against previous submissions for the same problem
     */
    async checkPlagiarism(submissionId) {
        const submission = await Submission.findById(submissionId).populate('problem');
        if (!submission) throw new Error("Submission not found");

        console.log(`[Plagiarism] Checking submission ${submissionId} for problem ${submission.problem.title}`);

        // 1. Generate Embedding for the code
        const codeEmbedding = await generateEmbedding(submission.code);

        // 2. Vector Search for similar code within the same problem
        // We limit search to the same problem to avoid false positives across different tasks
        // Note: Using aggregate with $vectorSearch for MongoDB Atlas
        let similarMatches = [];
        try {
            similarMatches = await Embedding.aggregate([
                {
                    $vectorSearch: {
                        index: "vector_index",
                        path: "embedding",
                        queryVector: codeEmbedding,
                        numCandidates: 20,
                        limit: 5,
                        filter: {
                            sourceType: 'Submission',
                            'metadata.problemId': submission.problem._id.toString(),
                            'metadata.studentId': { $ne: submission.student.toString() } // Don't match self
                        }
                    }
                }
            ]);
        } catch (e) {
            console.warn("[Plagiarism] Vector search failed (Check if index exists):", e.message);
        }

        // 3. Deep Analysis for high similarity matches (Scoring > 0.85)
        const highSimilarityMatches = similarMatches.filter(m => m.score > 0.85);

        if (highSimilarityMatches.length > 0) {
            const match = highSimilarityMatches[0];
            const originalSubmission = await Submission.findById(match.sourceId);

            if (originalSubmission) {
                // AI Forensic Analysis
                const prompt = `
                    Analyze these two code snippets for plagiarism.
                    Snippet 1 (Student A):
                    ${submission.code}
                    
                    Snippet 2 (Student B):
                    ${originalSubmission.code}
                    
                    Task: Determine if Student A copied from Student B or if they are both using a common template.
                    Return JSON: { "isSnippetCopied": boolean, "similarityScore": 0-100, "explanation": "String", "severity": "Low|Medium|High|Critical" }
                `;

                const analysis = await ultimateGenService._callAI(prompt, "Expert Code Forensic Analyst.");

                if (analysis.isSnippetCopied || analysis.similarityScore > 70) {
                    const report = new PlagiarismReport({
                        submission1: submission._id,
                        submission2: originalSubmission._id,
                        problem: submission.problem._id,
                        similarityScore: analysis.similarityScore,
                        severity: analysis.severity,
                        metadata: {
                            aiAnalysis: analysis.explanation,
                            structuralConfidence: analysis.similarityScore / 100
                        }
                    });

                    await report.save();

                    // Update submission status
                    submission.plagiarismFlag = true;
                    submission.similarityScore = analysis.similarityScore;
                    await submission.save();

                    console.log(`[Plagiarism] 🚩 Potential plagiarism detected. Score: ${analysis.similarityScore}`);
                    return report;
                }
            }
        }

        // 4. Index current submission for future checks
        await Embedding.create({
            content: submission.code,
            embedding: codeEmbedding,
            sourceId: submission._id,
            sourceType: 'Submission',
            courseId: submission.problem.course,
            departmentId: await getDepartmentId(submission.problem.course),
            metadata: {
                problemId: submission.problem._id.toString(),
                studentId: submission.student.toString(),
                language: submission.language
            }
        });

        return null;
    }
}

/**
 * Helper to get department ID from course
 */
async function getDepartmentId(courseId) {
    const Course = require('../../models/academic/Course');
    const course = await Course.findById(courseId).select('department');
    return course ? course.department : null;
}

module.exports = new PlagiarismService();
