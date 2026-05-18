const express = require('express');
const router = express.Router();
const courseController = require('../../controllers/academic/courseController');
const { authenticate, authorize } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const departmentGuard = require('../../middleware/departmentGuard');
const validateObjectId = require('../../middleware/validateObjectId');
const validateRequest = require('../../middleware/validateRequest');
const { createDepartmentSchema } = require('../../validators/departmentValidator');
const Program = require('../../models/academic/Program');
const departmentController = require('../../controllers/academic/departmentController');
const academicYearController = require('../../controllers/academic/academicYearController');
const hodController = require('../../controllers/hod/hodController');
const facultyController = require('../../controllers/faculty/facultyController');
const academicAnalyticsController = null;
const Department = require('../../models/academic/Department');
const logger = require('../../utils/logger');

// Departments Routes
/**
 * @route   POST /api/departments
 * @access  Private (Admin, SuperAdmin)
 */
router.post(
  '/departments',
  authenticate,
  authorizeRoles('admin', 'super_admin'),
  validateRequest(createDepartmentSchema),
  departmentController.createDepartment
);

/**
 * @route   GET /api/departments
 * @access  Private (Admin, SuperAdmin)
 */
router.get(
  '/departments',
  authenticate,
  authorizeRoles('admin', 'super_admin', 'hod'),
  departmentController.getAllDepartments
);

/**
 * @route   GET /api/departments/:id
 * @access  Private (Admin, SuperAdmin, HOD)
 */
router.get(
  '/departments/:id',
  authenticate,
  validateObjectId('id'),
  authorizeRoles('admin', 'super_admin', 'hod'),
  departmentGuard((req) => req.params.id),
  departmentController.getDepartment
);

/**
 * @route   PUT /api/departments/:id
 * @access  Private (Admin, SuperAdmin)
 */
router.put(
  '/departments/:id',
  authenticate,
  validateObjectId('id'),
  authorizeRoles('admin', 'super_admin'),
  departmentController.updateDepartment
);

/**
 * @route   DELETE /api/departments/:id
 * @access  Private (Admin, SuperAdmin)
 */
router.delete(
  '/departments/:id',
  authenticate,
  validateObjectId('id'),
  authorizeRoles('admin', 'super_admin'),
  departmentController.deleteDepartment
);

// Programs Routes
router.use('/programs', require('./program'));

// Calendar Routes
// Get all calendar events
router.get('/calendar', authenticate, async (req, res) => {
  try {
    resn({ success: true, data: [] });
  } catch (error) {
    logger.error('Failed to fetch calendar events', error);
    res.status(500).json({ message: error.message });
  }
});

// Get upcoming calendar events
router.get('/calendar/upcoming', authenticate, async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (error) {
    logger.error('Failed to fetch upcoming calendar events', error);
    res.status(500).json({ message: error.message });
  }
});

// Create calendar event
router.post('/calendar', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    res.status(501).json({ success: false, message: 'Calendar create not implemented' });
  } catch (error) {
    logger.error('Failed to create calendar event', error);
    res.status(500).json({ message: error.message });
  }
});

// Update calendar event
router.put('/calendar/:id', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    res.status(501).json({ success: false, message: 'Calendar update not implemented' });
  } catch (error) {
    logger.error('Failed to update calendar event', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete calendar event
router.delete('/calendar/:id', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    res.status(501).json({ success: false, message: 'Calendar delete not implemented' });
  } catch (error) {
    logger.error('Failed to delete calendar event', error);
    res.status(500).json({ message: error.message });
  }
});

// Academic Analytics Routes (Backward Compatible - Original API Paths)
router.get(
  '/department/:departmentId',
  authenticate,
  validateObjectId('departmentId'),
  authorizeRoles('hod', 'admin', 'super_admin'),
  hodController.getDepartmentStats
);

router.get(
  '/faculty-load/:departmentId',
  authenticate,
  validateObjectId('departmentId'),
  authorizeRoles('hod', 'admin', 'super_admin'),
  hodController.getFacultyLoad
);

router.get(
  '/faculty/:facultyId',
  authenticate,
  validateObjectId('facultyId'),
  authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
  facultyController.getFacultyAnalytics
);

// Academic Analytics Routes (Organized - New API Paths)
router.get(
  '/analytics/department/:departmentId',
  authenticate,
  validateObjectId('departmentId'),
  authorizeRoles('hod', 'admin', 'super_admin'),
  hodController.getDepartmentStats
);

router.get(
  '/analytics/faculty-load/:departmentId',
  authenticate,
  validateObjectId('departmentId'),
  authorizeRoles('hod', 'admin', 'super_admin'),
  hodController.getFacultyLoad
);

router.get(
  '/analytics/faculty/:facultyId',
  authenticate,
  validateObjectId('facultyId'),
  authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
  facultyController.getFacultyAnalytics
);

// Academic Years Routes
router.get(
  '/academic-years',
  authenticate,
  authorizeRoles('admin', 'super_admin', 'faculty', 'hod'),
  academicYearController.getAllAcademicYears
);

router.get(
  '/academic-years/active',
  authenticate,
  authorizeRoles('admin', 'super_admin', 'faculty', 'hod', 'student'),
  academicYearController.getActiveYear
);

router.post(
  '/academic-years',
  authenticate,
  authorizeRoles('admin', 'super_admin'),
  academicYearController.createAcademicYear
);

router.put(
  '/academic-years/:id/activate',
  authenticate,
  validateObjectId('id'),
  authorizeRoles('admin', 'super_admin'),
  academicYearController.activateYear
);

// Courses CRUD Routes
router.post(
  '/courses',
  authenticate,
  authorizeRoles('admin', 'super_admin', 'hod'),
  courseController.createCourse
);

router.get(
  '/courses',
  authenticate,
  authorizeRoles('admin', 'super_admin', 'hod', 'faculty', 'student'),
  courseController.getAllCourses
);

router.get(
  '/courses/my-courses',
  authenticate,
  authorizeRoles('faculty', 'hod', 'admin', 'super_admin'),
  async (req, res) => {
    try {
      const facultyId = req.user.id;
      const Course = require('../../models/academic/Course');
      const courses = await Course.find({
        $or: [
          { facultyIds: facultyId },
          { faculty: facultyId }
        ]
      });

      return res.status(200).json({ success: true, data: courses });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.get(
  '/courses/:id',
  authenticate,
  validateObjectId('id'),
  courseController.getCourseById
);

router.put(
  '/courses/:id',
  authenticate,
  validateObjectId('id'),
  authorizeRoles('admin', 'super_admin', 'hod'),
  courseController.updateCourse
);

router.delete(
  '/courses/:id',
  authenticate,
  validateObjectId('id'),
  authorizeRoles('admin', 'super_admin', 'hod'),
  courseController.deleteCourse
);

// Specialized Student Routes (Profilers, Artifact Tracking)
// router.use('/student', require('../student'));

// Sections Routes
router.use('/sections', require('./section'));

// Semester Routes
router.use('/semesters', require('./semester'));

// Program Outcomes Routes
router.use('/program-outcomes', require('./program-outcomes'));

// University Routes
router.use('/university', require('./university'));

module.exports = router;
