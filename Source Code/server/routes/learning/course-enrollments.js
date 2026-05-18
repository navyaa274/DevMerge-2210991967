const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const CourseEnrollment = require('../../models/learning/enrollments/CourseEnrollment');
const Course = require('../../models/academic/Course');
const asyncHandler = require('../../errors/asyncHandler');

/**
 * Get user's course enrollments
 * @route GET /api/course-enrollments/student/:userId
 * @access Private
 */
router.get('/student/:userId', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const enrollments = await CourseEnrollment.find({ studentId: userId })
    .populate('courseId', 'name code description credits')
    .populate('semesterId', 'name startDate endDate')
    .sort({ enrolledAt: -1 });

  res.json({
    success: true,
    data: enrollments || []
  });
}));

/**
 * Get user's course enrollments (alternative path)
 * @route GET /api/course-enrollments/user/:userId
 * @access Private
 */
router.get('/user/:userId', authenticate, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const enrollments = await CourseEnrollment.find({ studentId: userId })
    .populate('courseId', 'name code description credits')
    .populate('semesterId', 'name startDate endDate')
    .sort({ enrolledAt: -1 });

  res.json({
    success: true,
    data: enrollments || []
  });
}));

/**
 * Get all enrollments for a course
 * @route GET /api/course-enrollments/course/:courseId
 * @access Private
 */
router.get('/course/:courseId', authenticate, asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const enrollments = await CourseEnrollment.find({ courseId })
    .populate('studentId', 'firstName lastName email')
    .populate('semesterId', 'name');

  res.json({
    success: true,
    data: enrollments || []
  });
}));

/**
 * Enroll student in a course
 * @route POST /api/course-enrollments
 * @access Private
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { studentId, courseId, semesterId } = req.body;

  if (!studentId || !courseId || !semesterId) {
    return res.status(400).json({
      success: false,
      message: 'studentId, courseId, and semesterId are required'
    });
  }

  // Check if already enrolled
  const existing = await CourseEnrollment.findOne({ studentId, courseId });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Student is already enrolled in this course'
    });
  }

  const enrollment = new CourseEnrollment({
    studentId,
    courseId,
    semesterId,
    status: 'active'
  });

  await enrollment.save();

  res.status(201).json({
    success: true,
    data: enrollment
  });
}));

/**
 * Update enrollment status
 * @route PUT /api/course-enrollments/:enrollmentId
 * @access Private
 */
router.put('/:enrollmentId', authenticate, asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;
  const { status } = req.body;

  if (!['active', 'completed', 'dropped'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be active, completed, or dropped'
    });
  }

  const enrollment = await CourseEnrollment.findByIdAndUpdate(
    enrollmentId,
    { status, updatedAt: new Date() },
    { new: true }
  );

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  res.json({
    success: true,
    data: enrollment
  });
}));

/**
 * Delete enrollment
 * @route DELETE /api/course-enrollments/:enrollmentId
 * @access Private
 */
router.delete('/:enrollmentId', authenticate, asyncHandler(async (req, res) => {
  const { enrollmentId } = req.params;

  const enrollment = await CourseEnrollment.findByIdAndDelete(enrollmentId);

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  res.json({
    success: true,
    message: 'Enrollment deleted successfully'
  });
}));

module.exports = router;
