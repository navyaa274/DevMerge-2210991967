const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const registrarAutomationService = require('../../services/registrar/registrarAutomationService');
const AutomationLog = require('../../models/registrar/AutomationLog');
const EnrollmentBatch = require('../../models/registrar/EnrollmentBatch');
const Timetable = require('../../models/registrar/Timetable');
const asyncHandler = require('../../errors/asyncHandler');

/**
 * ✅ 1. Automated Enrollment Routes
 */

// Start automated enrollment batch
router.post('/enrollment/batch', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { program, semester, academicYear, studentFilters } = req.body;

    const batchId = `ENR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const batch = new EnrollmentBatch({
      batchId,
      program,
      semester,
      academicYear,
      status: 'processing',
      startedAt: new Date(),
      processedBy: req.user.id
    });

    await batch.save();

    // Start async processing
    registrarAutomationService.automateEnrollment({ program, semester }, semester)
      .then(result => {
        batch.processedStudents = result.enrolled;
        batch.successfulEnrollments = result.enrolled;
        batch.status = 'completed';
        batch.completedAt = new Date();
        batch.processingTime = (batch.completedAt - batch.startedAt) / 1000;
        batch.save();
      })
      .catch(error => {
        batch.status = 'failed';
        batch.errors.push({ type: 'processing_error', message: error.message });
        batch.completedAt = new Date();
        batch.save();
      });

    res.status(202).json({
      success: true,
      message: 'Enrollment batch started',
      batchId,
      status: 'Processing'
    });
  })
);

// Get enrollment batch status
router.get('/enrollment/batch/:batchId', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const batch = await EnrollmentBatch.findOne({ batchId: req.params.batchId })
      .populate('interventions.student', 'name email')
      .populate('processedBy', 'name');

    if (!batch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Batch not found' 
      });
    }

    res.json({
      success: true,
      data: batch
    });
  })
);

// Process interventions
router.post('/interventions/:batchId', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { interventions } = req.body;
    const batch = await EnrollmentBatch.findOne({ batchId: req.params.batchId });

    if (!batch) {
      return res.status(404).json({ 
        success: false, 
        message: 'Batch not found' 
      });
    }

    interventions.forEach(intervention => {
      const batchIntervention = batch.interventions.id(intervention._id);
      if (batchIntervention) {
        batchIntervention.status = intervention.status;
        batchIntervention.resolvedAt = new Date();
        batchIntervention.resolvedBy = req.user.id;
      }
    });

    await batch.save();

    res.json({
      success: true,
      message: 'Interventions processed successfully'
    });
  })
);

/**
 * ✅ 2. Timetable Generation Routes
 */

// Generate AI-optimized timetable
router.post('/timetable/generate', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { semester, academicYear, program, constraints } = req.body;

    const timetable = await registrarAutomationService.generateTimetable(semester, constraints);
    
    const savedTimetable = new Timetable({
      semester,
      academicYear,
      program,
      ...timetable,
      generatedBy: req.user.id,
      status: 'draft'
    });

    await savedTimetable.save();

    res.status(201).json({
      success: true,
      message: 'Timetable generated successfully',
      data: savedTimetable
    });
  })
);

// Get timetables
router.get('/timetable', 
  authenticate, 
  authorize(['registrar', 'admin', 'faculty']), 
  asyncHandler(async (req, res) => {
    const { semester, academicYear, program, status } = req.query;
    const filter = {};
    
    if (semester) filter.semester = parseInt(semester);
    if (academicYear) filter.academicYear = academicYear;
    if (program) filter.program = program;
    if (status) filter.status = status;

    const timetables = await Timetable.find(filter)
      .populate('schedule.course', 'code name')
      .populate('schedule.faculty', 'name email')
      .populate('facultyAssignments.faculty', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: timetables
    });
  })
);

// Approve and publish timetable
router.put('/timetable/:id/publish', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'published',
        approvedBy: req.user.id,
        publishedAt: new Date()
      },
      { new: true }
    );

    if (!timetable) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable not found' 
      });
    }

    res.json({
      success: true,
      message: 'Timetable published successfully',
      data: timetable
    });
  })
);

/**
 * ✅ 3. Grading Automation Routes
 */

// Start automated grading
router.post('/grading/automate', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { semester, assessmentType } = req.body;

    const result = await registrarAutomationService.automateGrading(semester, assessmentType);

    res.json({
      success: true,
      message: 'Grading automation completed',
      data: result
    });
  })
);

// Get grade reports
router.get('/grading/reports', 
  authenticate, 
  authorize(['registrar', 'admin', 'faculty']), 
  asyncHandler(async (req, res) => {
    const { semester, student, program } = req.query;
    
    // This would integrate with existing grade reports
    // For now, return placeholder response
    res.json({
      success: true,
      message: 'Grade reports retrieved',
      data: []
    });
  })
);

/**
 * ✅ 4. Compliance & Audit Routes
 */

// Generate compliance report
router.post('/compliance/report', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { timeframe } = req.body;

    const report = await registrarAutomationService.generateComplianceReport(timeframe);

    res.json({
      success: true,
      message: 'Compliance report generated',
      data: report
    });
  })
);

// Get automation logs
router.get('/logs', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { type, limit = 50, startDate, endDate } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (startDate) filter.timestamp = { $gte: new Date(startDate) };
    if (endDate) filter.timestamp = { ...filter.timestamp, $lte: new Date(endDate) };

    const logs = await AutomationLog.find(filter)
      .populate('affectedUsers', 'name email')
      .populate('affectedCourses', 'code name')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: logs
    });
  })
);

/**
 * ✅ 5. Dashboard Data Routes
 */

// Get dashboard data for different roles
router.get('/dashboard/:role', 
  authenticate, 
  asyncHandler(async (req, res) => {
    const { role } = req.params;
    const { timeframe = 'month' } = req.query;

    // Check authorization
    const allowedRoles = ['registrar', 'admin', 'faculty'];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized role' 
      });
    }

    const dashboardData = await registrarAutomationService.getDashboardData(
      role, 
      req.user.id, 
      timeframe
    );

    res.json({
      success: true,
      data: dashboardData
    });
  })
);

// Get system metrics
router.get('/metrics', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { timeframe = 'week' } = req.query;
    
    // Get comprehensive system metrics
    const metrics = {
      automation: {
        totalRuns: await AutomationLog.countDocuments(),
        successfulRuns: await AutomationLog.countDocuments({ status: 'completed' }),
        failedRuns: await AutomationLog.countDocuments({ status: 'failed' }),
        avgProcessingTime: 0 // Calculate from logs
      },
      enrollment: {
        totalBatches: await EnrollmentBatch.countDocuments(),
        activeBatches: await EnrollmentBatch.countDocuments({ status: 'processing' }),
        avgInterventions: 0 // Calculate from batches
      },
      grading: {
        automatedReports: 0, // Integrate with grading system
        pendingGrades: 0,
        anomalyRate: 0
      },
      compliance: {
        lastReportDate: null,
        overallScore: 0,
        criticalIssues: 0
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  })
);

// Bulk operations for admin efficiency
router.post('/bulk/actions', 
  authenticate, 
  authorize(['registrar', 'admin']), 
  asyncHandler(async (req, res) => {
    const { action, items, options } = req.body;

    let result = { success: false, message: 'Invalid action' };

    switch (action) {
      case 'approve_enrollments':
        // Bulk approve pending enrollments
        result = await this.bulkApproveEnrollments(items);
        break;
      case 'publish_timetables':
        // Bulk publish timetables
        result = await this.bulkPublishTimetables(items);
        break;
      case 'process_interventions':
        // Bulk process interventions
        result = await this.bulkProcessInterventions(items, options);
        break;
      case 'send_notifications':
        // Bulk send notifications
        result = await this.bulkSendNotifications(items, options);
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid bulk action' 
        });
    }

    res.json(result);
  })
);

// Health check for automation service
router.get('/health', 
  authenticate, 
  asyncHandler(async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      services: {
        enrollment: 'operational',
        timetable: 'operational',
        grading: 'operational',
        compliance: 'operational'
      },
      lastAutomation: await AutomationLog.findOne().sort({ timestamp: -1 }),
      queueStatus: {
        pending: 0,
        processing: 0,
        failed: 0
      }
    };

    res.json({
      success: true,
      data: health
    });
  })
);

module.exports = router;
