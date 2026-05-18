const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const LabManual = require('../../models/assessment/labs/LabManual');

/**
 * @route   POST /api/ultimate-lab-generator/generate
 * @desc    Generate ultimate lab manual
 * @access  Protected (Faculty/Admin)
 */
const ultimateGenService = require('../../services/ai/ultimateProblemGeneratorService');

/**
 * @route   POST /api/ultimate-lab-generator/generate
 * @desc    Generate ultimate lab manual using AI
 * @access  Protected (Faculty/Admin)
 */
router.post('/generate', authenticate, async (req, res) => {
    try {
        const {
            programCode = 'BTCH-CSE',
            semester = 3,
            subject = 'Data Structures',
            topic = 'Linked Lists',
            difficulty = 'Medium',
            labNumber = 1,
            useAi = true
        } = req.body;

        let lab;
        if (useAi) {
            lab = await ultimateGenService.generateLabManual({
                programCode,
                semester,
                subjectName: subject,
                topic,
                difficulty,
                labNumber,
                userId: req.user.id
            });
        } else {
            // Fallback to template logic (moved to helper if needed, but we prefer AI)
            const LabManual = require('../../models/assessment/labs/LabManual');
            lab = new LabManual({
                title: `Lab ${labNumber}: ${topic}`,
                labNumber,
                aim: `Implement ${topic}`,
                theory: `Basic theory of ${topic}`,
                createdBy: req.user.id,
                status: 'Draft'
            });
            await lab.save();
        }

        res.json({
            success: true,
            message: useAi ? 'AI Lab manual generated successfully' : 'Template lab manual created',
            data: lab
        });

    } catch (error) {
        console.error('Ultimate Lab Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate lab manual',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/ultimate-lab-generator/series
 * @desc    Generate series of labs for multiple topics
 * @access  Protected (Faculty/Admin)
 */
router.post('/series', authenticate, async (req, res) => {
    try {
        const {
            course,
            semester,
            subject,
            topics = [],
            labType = 'Programming',
            difficulty = 'Medium'
        } = req.body;

        if (!Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Topics array is required'
            });
        }

        const savedLabs = [];

        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            const labNumber = i + 1;

            const labData = {
                title: `Lab ${labNumber}: ${topic}`,
                labNumber,
                aim: `To understand and implement ${topic} in ${subject}`,
                learningOutcomes: [
                    `Understand the concept of ${topic}`,
                    `Implement ${topic} in multiple programming languages`
                ],
                theory: `${topic} is a fundamental concept in ${subject}.`,
                algorithm: `1. Initialize\n2. Implement\n3. Test`,
                code: {
                    python: `# ${topic}\nprint("${topic} implementation")`,
                    javascript: `// ${topic}\nconsole.log("${topic} implementation");`
                },
                vivaQuestions: [
                    {
                        question: `What is ${topic}?`,
                        difficulty: 'Basic',
                        answer: `${topic} is a concept in ${subject}.`
                    }
                ],
                labType,
                difficulty
            };

            const lab = new LabManual({
                ...labData,
                createdBy: req.user.id,
                isAiGenerated: false,
                status: 'Draft'
            });

            await lab.save();
            savedLabs.push(lab);
        }

        res.json({
            success: true,
            message: `Generated ${savedLabs.length} lab manuals`,
            data: savedLabs
        });

    } catch (error) {
        console.error('Lab Series Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate lab series',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/ultimate-lab-generator/labs
 * @desc    Get lab manuals with filters
 * @access  Protected
 */
router.get('/labs', authenticate, async (req, res) => {
    try {
        const {
            course,
            semester,
            subject,
            labType,
            difficulty,
            page = 1,
            limit = 20
        } = req.query;

        const filter = {};

        // For students, only show published labs assigned to their enrolled courses
        if (req.user.role === 'student') {
            filter.status = 'Published';

            const CourseEnrollment = require('../../models/learning/enrollments/CourseEnrollment');
            const enrollments = await CourseEnrollment.find({ studentId: req.user.id });
            const enrolledCourseIds = enrollments.map(e => e.courseId);

            filter.$or = [
                { assignedTo: { $in: enrolledCourseIds } },
                { assignedTo: { $size: 0 } } // Also show unassigned labs
            ];
        }
        // Faculty see all labs (Draft and Published)

        if (course) filter.course = course;
        if (semester) filter.semester = parseInt(semester);
        if (subject) filter.subject = subject;
        if (labType) filter.labType = labType;
        if (difficulty) filter.difficulty = difficulty;

        const labs = await LabManual.find(filter)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'title code')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ labNumber: 1, createdAt: -1 });

        const total = await LabManual.countDocuments(filter);

        res.json({
            success: true,
            data: labs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Fetch Labs Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch labs',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/ultimate-lab-generator/labs/:id
 * @desc    Get single lab manual
 * @access  Protected
 */
router.get('/labs/:id', authenticate, async (req, res) => {
    try {
        const lab = await LabManual.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('course');

        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab manual not found'
            });
        }

        res.json({
            success: true,
            data: lab
        });

    } catch (error) {
        console.error('Fetch Lab Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch lab',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/ultimate-lab-generator/labs/:id/assign
 * @desc    Assign lab to courses
 * @access  Protected (Faculty/Admin)
 */
router.put('/labs/:id/assign', authenticate, async (req, res) => {
    try {
        const { courseIds, dueDate, status } = req.body;

        const lab = await LabManual.findById(req.params.id);
        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab manual not found'
            });
        }

        // Update lab
        lab.assignedTo = courseIds || [];
        if (dueDate) lab.dueDate = dueDate;
        if (status) lab.status = status;
        lab.updatedAt = Date.now();

        await lab.save();

        res.json({
            success: true,
            message: 'Lab assigned successfully',
            data: lab
        });

    } catch (error) {
        console.error('Assign Lab Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign lab',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/ultimate-lab-generator/labs/:id
 * @desc    Delete lab manual
 * @access  Protected (Faculty/Admin)
 */
router.delete('/labs/:id', authenticate, async (req, res) => {
    try {
        const lab = await LabManual.findById(req.params.id);

        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab manual not found'
            });
        }

        // Check if user is creator or admin
        if (lab.createdBy.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this lab'
            });
        }

        await LabManual.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Lab manual deleted successfully'
        });

    } catch (error) {
        console.error('Delete Lab Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete lab',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/ultimate-lab-generator/viva-quiz/:labId
 * @desc    Generate viva quiz from lab
 * @access  Protected
 */
router.post('/viva-quiz/:labId', authenticate, async (req, res) => {
    try {
        const { count = 5 } = req.body;

        const lab = await LabManual.findById(req.params.labId);
        if (!lab) {
            return res.status(404).json({
                success: false,
                message: 'Lab not found'
            });
        }

        const quiz = generateVivaQuiz(lab, count);

        res.json({
            success: true,
            data: {
                labTitle: lab.title,
                questions: quiz
            }
        });

    } catch (error) {
        console.error('Viva Quiz Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate viva quiz',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/ultimate-lab-generator/config-options
 * @desc    Get available configuration options
 * @access  Protected
 */
router.get('/config-options', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            courses: ['BTech_CSE', 'BCA', 'MCA', 'BTech_IT', 'Management', 'Law', 'Other'],
            semesters: [1, 2, 3, 4, 5, 6, 7, 8],
            labTypes: ['Simulation', 'Programming', 'Hardware', 'Research'],
            difficulties: ['Easy', 'Medium', 'Hard']
        }
    });
});

module.exports = router;
