const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const completeWorkflowService = require('../../services/automation/completeWorkflowService');
const asyncHandler = require('../../errors/asyncHandler');

/**
 * 🚀 Complete Workflow Automation Routes
 */

// Run complete student journey automation
router.post('/student-journey/:studentId', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { program } = req.body;

    const journey = await completeWorkflowService.automateStudentJourney(studentId, program);

    res.json({
      success: true,
      message: 'Student journey automation started',
      data: journey
    });
  })
);

// Run complete course lifecycle automation
router.post('/course-lifecycle/:courseId', 
  authenticate, 
  authorize(['faculty', 'admin']), 
  asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    const lifecycle = await completeWorkflowService.automateCourseLifecycle(courseId);

    res.json({
      success: true,
      message: 'Course lifecycle automation completed',
      data: lifecycle
    });
  })
);

// Run institutional operations automation
router.post('/institutional-operations', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const operations = await completeWorkflowService.automateInstitutionalOperations();

    res.json({
      success: true,
      message: 'Institutional operations automation completed',
      data: operations
    });
  })
);

// Run content generation workflow
router.post('/content-generation', 
  authenticate, 
  authorize(['faculty', 'admin']), 
  asyncHandler(async (req, res) => {
    const { subject, level } = req.body;

    const content = await completeWorkflowService.automateContentGenerationWorkflow(subject, level);

    res.json({
      success: true,
      message: 'Content generation workflow completed',
      data: content
    });
  })
);

// Generate comprehensive system analytics
router.get('/system-analytics', 
  authenticate, 
  authorize(['admin', 'registrar']), 
  asyncHandler(async (req, res) => {
    const analytics = await completeWorkflowService.generateSystemAnalytics();

    res.json({
      success: true,
      data: analytics
    });
  })
);

// Run continuous improvement cycle
router.post('/continuous-improvement', 
  authenticate, 
  authorize(['admin']), 
  asyncHandler(async (req, res) => {
    const cycle = await completeWorkflowService.continuousImprovementCycle();

    res.json({
      success: true,
      message: 'Continuous improvement cycle completed',
      data: cycle
    });
  })
);

// Get active workflow processes
router.get('/active-processes', 
  authenticate, 
  authorize(['admin', 'registrar']), 
  asyncHandler(async (req, res) => {
    const activeProcesses = completeWorkflowService.activeProcesses;

    res.json({
      success: true,
      data: Object.fromEntries(activeProcesses)
    });
  })
);

// Get system health
router.get('/system-health', 
  authenticate, 
  asyncHandler(async (req, res) => {
    const health = await completeWorkflowService.getSystemHealth();

    res.json({
      success: true,
      data: health
    });
  })
);

// Run custom workflow
router.post('/custom-workflow', 
  authenticate, 
  authorize(['admin']), 
  asyncHandler(async (req, res) => {
    const { workflowType, config } = req.body;

    const result = await completeWorkflowService.runCompleteWorkflow(workflowType, config);

    res.json({
      success: true,
      message: `Custom workflow ${workflowType} completed`,
      data: result
    });
  })
);

module.exports = router;
