const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const Problem = require('../../models/assessment/problems/Problem');
const ProblemMetadata = require('../../models/assessment/problems/ProblemMetadata');
const { generateUltimateProblem, generateProblemBatch } = require('../../utils/ultimateProblemGenerator');

/**
 * @route   POST /api/ultimate-problem-generator/generate
 * @desc    Generate ultimate problem with full metadata
 * @access  Protected (Faculty/Admin)
 */
router.post('/generate', authenticate, async (req, res) => {
    try {
        const {
            course = 'BTech_CSE',
            semester = 3,
            subject = 'Data Structures',
            topic = 'Arrays',
            bloomsLevel = 'Apply',
            questionType = 'Coding',
            problemMode = 'Practice',
            difficulty = 'Medium',
            realWorldContext = true
        } = req.body;

        // Generate problem using AI
        const problemData = await generateUltimateProblem({
            course,
            semester,
            subject,
            topic,
            bloomsLevel,
            questionType,
            problemMode,
            difficulty,
            realWorldContext
        });

        // Create Problem
        const problem = new Problem({
            title: problemData.title,
            description: problemData.description,
            difficulty: problemData.difficulty,
            topics: problemData.topics,
            constraints: problemData.constraints,
            examples: problemData.examples,
            testCases: problemData.testCases,
            starterCode: problemData.starterCode,
            createdBy: req.user.id,
            isApproved: true,
            isAiGenerated: true
        });

        await problem.save();

        // Create Problem Metadata
        const metadata = new ProblemMetadata({
            problem: problem._id,
            bloomsLevel,
            questionType,
            course,
            semester,
            subject,
            unit: topic,
            expectedTimeComplexity: problemData.expectedTimeComplexity,
            expectedSpaceComplexity: problemData.expectedSpaceComplexity,
            actualDifficulty: difficulty,
            realWorldContext: problemData.realWorldApplication,
            industryApplication: problemData.realWorldApplication,
            problemMode,
            learningOutcomes: problemData.learningOutcomes,
            evaluationCriteria: problemData.evaluationCriteria
        });

        await metadata.save();

        res.json({
            success: true,
            message: 'Ultimate problem generated successfully',
            data: {
                problem,
                metadata,
                hints: problemData.hints,
                commonMistakes: problemData.commonMistakes
            }
        });

    } catch (error) {
        console.error('Ultimate Problem Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate problem',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/ultimate-problem-generator/generate-test
 * @desc    Generate problem without authentication (for testing)
 * @access  Public
 */
router.post('/generate-test', async (req, res) => {
    try {
        const {
            course = 'Data Structures and Algorithms',
            semester = 1,
            subject = 'Data Structures',
            topic = 'Arrays',
            bloomsLevel = 'Apply',
            questionType = 'Coding',
            problemMode = 'Practice',
            difficulty = 'Medium',
            realWorldContext = true,
            leetcodeStyle = true,
            includeTestCases = true,
            includeConstraints = true,
            includeTimeComplexity = true,
            includeSpaceComplexity = true
        } = req.body;

        console.log('Test generation request received:', { subject, topic, difficulty, leetcodeStyle });

        // Generate problem using AI
        const problemData = await generateUltimateProblem({
            course,
            semester,
            subject,
            topic,
            bloomsLevel,
            questionType,
            problemMode,
            difficulty,
            realWorldContext,
            leetcodeStyle,
            includeTestCases,
            includeConstraints,
            includeTimeComplexity,
            includeSpaceComplexity
        });

        console.log('Problem generated successfully:', problemData.title);

        res.status(201).json({
            success: true,
            message: 'Test problem generated successfully',
            data: problemData
        });

    } catch (error) {
        console.error('Test problem generation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

/**
 * @route   POST /api/ultimate-problem-generator/batch
 * @desc    Generate multiple problems in batch
 * @access  Protected (Faculty/Admin)
 */
router.post('/batch', authenticate, async (req, res) => {
    try {
        const { configs } = req.body;

        if (!Array.isArray(configs) || configs.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Configs array is required'
            });
        }

        const problems = await generateProblemBatch(configs);

        // Save all problems
        const savedProblems = [];
        for (const problemData of problems) {
            if (problemData.error) {
                savedProblems.push({ error: problemData.error });
                continue;
            }

            const problem = new Problem({
                title: problemData.title,
                description: problemData.description,
                difficulty: problemData.difficulty,
                topics: problemData.topics,
                constraints: problemData.constraints,
                examples: problemData.examples,
                testCases: problemData.testCases,
                starterCode: problemData.starterCode,
                createdBy: req.user.id,
                isApproved: true,
                isAiGenerated: true
            });

            await problem.save();

            const metadata = new ProblemMetadata({
                problem: problem._id,
                ...problemData.metadata
            });

            await metadata.save();

            savedProblems.push({ problem, metadata });
        }

        res.json({
            success: true,
            message: `Generated ${savedProblems.length} problems`,
            data: savedProblems
        });

    } catch (error) {
        console.error('Batch Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate batch',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/ultimate-problem-generator/problems
 * @desc    Get problems with metadata filters
 * @access  Protected
 */
router.get('/problems', authenticate, async (req, res) => {
    try {
        const {
            course,
            semester,
            bloomsLevel,
            questionType,
            difficulty,
            subject,
            page = 1,
            limit = 20
        } = req.query;

        // Build metadata filter
        const metadataFilter = {};
        if (course) metadataFilter.course = course;
        if (semester) metadataFilter.semester = parseInt(semester);
        if (bloomsLevel) metadataFilter.bloomsLevel = bloomsLevel;
        if (questionType) metadataFilter.questionType = questionType;
        if (subject) metadataFilter.subject = subject;

        // Find matching metadata
        const metadataResults = await ProblemMetadata.find(metadataFilter)
            .populate('problem')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await ProblemMetadata.countDocuments(metadataFilter);

        res.json({
            success: true,
            data: metadataResults,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Fetch Problems Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch problems',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/ultimate-problem-generator/metadata/:problemId
 * @desc    Get problem metadata
 * @access  Protected
 */
router.get('/metadata/:problemId', authenticate, async (req, res) => {
    try {
        const metadata = await ProblemMetadata.findOne({
            problem: req.params.problemId
        }).populate('problem');

        if (!metadata) {
            return res.status(404).json({
                success: false,
                message: 'Metadata not found'
            });
        }

        res.json({
            success: true,
            data: metadata
        });

    } catch (error) {
        console.error('Fetch Metadata Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch metadata',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/ultimate-problem-generator/config-options
 * @desc    Get available configuration options
 * @access  Protected
 */
router.get('/config-options', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            courses: ['BTech_CSE', 'BCA', 'MCA', 'BTech_IT', 'Management', 'Law', 'Other'],
            semesters: [1, 2, 3, 4, 5, 6, 7, 8],
            bloomsLevels: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
            questionTypes: ['Coding', 'MCQ', 'Theory', 'CaseStudy', 'Debugging', 'Optimization', 'SystemDesign'],
            problemModes: ['Assignment', 'Exam', 'Practice', 'Competitive'],
            difficulties: ['Easy', 'Medium', 'Hard', 'Expert']
        }
    });
});

module.exports = router;
