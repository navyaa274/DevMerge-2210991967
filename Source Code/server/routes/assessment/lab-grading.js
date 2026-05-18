const express = require('express');
const router = express.Router();
const LabGrading = require('../../models/assessment/labs/LabGrading');
const LabSubmission = require('../../models/assessment/labs/LabSubmission');
const { authenticate } = require('../../middleware/auth');

/**
 * @route   POST /api/lab-grading/grade
 * @desc    Grade a lab submission
 * @access  Private (Faculty)
 */
router.post('/grade', authenticate, async (req, res) => {
  try {
    const {
      submissionId,
      rubricScores,
      componentScores,
      codeReview,
      testResults,
      vivaEvaluation,
      strengths,
      weaknesses,
      improvements,
      detailedFeedback,
      coAttainment,
      poContribution
    } = req.body;

    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' });
    }

    // Check if submission exists
    const submission = await LabSubmission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Check if already graded
    const existingGrading = await LabGrading.findOne({
      submission: submissionId,
      isActive: true
    });

    if (existingGrading) {
      return res.status(400).json({
        error: 'Submission already graded. Use update endpoint to modify.'
      });
    }

    // Create grading
    const grading = new LabGrading({
      submission: submissionId,
      evaluator: req.user.id,
      rubricScores,
      componentScores,
      codeReview,
      testResults,
      vivaEvaluation,
      strengths,
      weaknesses,
      improvements,
      detailedFeedback,
      coAttainment,
      poContribution,
      evaluationStartTime: new Date(),
      evaluationEndTime: new Date(),
      status: 'Completed'
    });

    // Calculate total score
    grading.calculateTotalScore();

    // Calculate max score
    grading.maxScore =
      (componentScores.implementation?.maxScore || 0) +
      (componentScores.understanding?.maxScore || 0) +
      (componentScores.viva?.maxScore || 0) +
      (componentScores.recordWork?.maxScore || 0) +
      (componentScores.innovation?.maxScore || 0);

    await grading.save();

    // Update submission
    submission.marks = {
      implementation: componentScores.implementation?.score || 0,
      understanding: componentScores.understanding?.score || 0,
      viva: componentScores.viva?.score || 0,
      recordWork: componentScores.recordWork?.score || 0,
      innovation: componentScores.innovation?.score || 0,
      total: grading.totalScore,
      maxMarks: grading.maxScore
    };
    submission.grade = grading.grade;
    submission.status = 'Evaluated';
    submission.evaluatedBy = req.user.id;
    submission.evaluationDate = new Date();
    submission.feedback = {
      strengths,
      improvements,
      comments: detailedFeedback
    };

    await submission.save();

    res.json({
      success: true,
      message: 'Lab graded successfully',
      grading,
      submission
    });
  } catch (error) {
    console.error('Error grading lab:', error);
    res.status(500).json({
      error: 'Failed to grade lab',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/lab-grading/submission/:submissionId
 * @desc    Get grading for a submission
 * @access  Private
 */
router.get('/submission/:submissionId', authenticate, async (req, res) => {
  try {
    const { submissionId } = req.params;

    const grading = await LabGrading.findOne({
      submission: submissionId,
      isActive: true
    })
      .populate('evaluator', 'name email')
      .populate('moderatedBy', 'name email');

    if (!grading) {
      return res.status(404).json({ error: 'Grading not found' });
    }

    res.json({
      success: true,
      grading
    });
  } catch (error) {
    console.error('Error fetching grading:', error);
    res.status(500).json({
      error: 'Failed to fetch grading',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/lab-grading/evaluator/:evaluatorId/statistics
 * @desc    Get evaluator statistics
 * @access  Private (Faculty/Admin)
 */
router.get('/evaluator/:evaluatorId/statistics', authenticate, async (req, res) => {
  try {
    const { evaluatorId } = req.params;

    const statistics = await LabGrading.getEvaluatorStatistics(evaluatorId);

    res.json({
      success: true,
      statistics
    });
  } catch (error) {
    console.error('Error fetching evaluator statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch evaluator statistics',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/lab-grading/course/:courseId/co-attainment
 * @desc    Get CO attainment report for a course
 * @access  Private (Faculty/Admin)
 */
router.get('/course/:courseId/co-attainment', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;

    const report = await LabGrading.getCOAttainmentReport(courseId);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating CO attainment report:', error);
    res.status(500).json({
      error: 'Failed to generate CO attainment report',
      details: error.message
    });
  }
});

/**
 * @route   PUT /api/lab-grading/:id
 * @desc    Update grading
 * @access  Private (Faculty)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const grading = await LabGrading.findById(id);

    if (!grading) {
      return res.status(404).json({ error: 'Grading not found' });
    }

    // Check if user is the evaluator
    if (grading.evaluator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        grading[key] = updates[key];
      }
    });

    // Recalculate scores
    grading.calculateTotalScore();
    grading.evaluationEndTime = new Date();

    await grading.save();

    // Update submission
    const submission = await LabSubmission.findById(grading.submission);
    if (submission) {
      submission.marks.total = grading.totalScore;
      submission.grade = grading.grade;
      await submission.save();
    }

    res.json({
      success: true,
      message: 'Grading updated successfully',
      grading
    });
  } catch (error) {
    console.error('Error updating grading:', error);
    res.status(500).json({
      error: 'Failed to update grading',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/lab-grading/:id/moderate
 * @desc    Moderate a grading
 * @access  Private (Faculty/Admin)
 */
router.post('/:id/moderate', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { moderationComments, adjustedScores } = req.body;

    const grading = await LabGrading.findById(id);

    if (!grading) {
      return res.status(404).json({ error: 'Grading not found' });
    }

    grading.moderatedBy = req.user.id;
    grading.moderationComments = moderationComments;
    grading.moderationDate = new Date();
    grading.isModerated = true;

    // Apply adjusted scores if provided
    if (adjustedScores) {
      if (adjustedScores.componentScores) {
        grading.componentScores = adjustedScores.componentScores;
      }
      grading.calculateTotalScore();
    }

    await grading.save();

    // Update submission
    const submission = await LabSubmission.findById(grading.submission);
    if (submission) {
      submission.marks.total = grading.totalScore;
      submission.grade = grading.grade;
      await submission.save();
    }

    res.json({
      success: true,
      message: 'Grading moderated successfully',
      grading
    });
  } catch (error) {
    console.error('Error moderating grading:', error);
    res.status(500).json({
      error: 'Failed to moderate grading',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/lab-grading/:id/assign-peer-reviewer
 * @desc    Assign a peer reviewer (HOD only)
 */
router.post('/:id/assign-peer-reviewer', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'hod' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only HOD or Admin can assign peer reviewers' });
    }

    const { reviewerId } = req.body;
    const grading = await LabGrading.findById(req.params.id);

    if (!grading) return res.status(404).json({ error: 'Grading not found' });

    grading.moderator = reviewerId;
    grading.status = 'Draft'; // Reset to draft for new review if needed, or keep same
    await grading.save();

    res.json({ success: true, message: 'Peer reviewer assigned' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/lab-grading/peer-review-queue
 * @desc    Get submissions assigned to current user for peer review
 */
router.get('/peer-review-queue', authenticate, async (req, res) => {
  try {
    const queue = await LabGrading.find({
      moderator: req.user.id,
      isModerated: false
    }).populate({
      path: 'submission',
      populate: { path: 'student', select: 'name studentId' }
    });

    res.json({ success: true, queue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route   GET /api/lab-grading/:id/feedback-summary
 * @desc    Get feedback summary
 * @access  Private
 */
router.get('/:id/feedback-summary', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const grading = await LabGrading.findById(id);

    if (!grading) {
      return res.status(404).json({ error: 'Grading not found' });
    }

    const summary = grading.generateFeedbackSummary();

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error generating feedback summary:', error);
    res.status(500).json({
      error: 'Failed to generate feedback summary',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/lab-grading/:id
 * @desc    Delete grading
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete gradings' });
    }

    const grading = await LabGrading.findById(id);

    if (!grading) {
      return res.status(404).json({ error: 'Grading not found' });
    }

    grading.isActive = false;
    await grading.save();

    res.json({
      success: true,
      message: 'Grading deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grading:', error);
    res.status(500).json({
      error: 'Failed to delete grading',
      details: error.message
    });
  }
});

module.exports = router;
