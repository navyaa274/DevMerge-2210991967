const express = require('express');
const router = express.Router();
const ProgramOutcome = require('../../models/academic/ProgramOutcome');
const { authenticate } = require('../../middleware/auth');

/**
 * @route   POST /api/program-outcomes/create
 * @desc    Create a new program outcome
 * @access  Private (Admin)
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const poData = req.body;

    poData.createdBy = req.user.id;

    const po = new ProgramOutcome(poData);
    await po.save();

    res.json({
      success: true,
      message: 'Program outcome created successfully',
      po
    });
  } catch (error) {
    console.error('Error creating program outcome:', error);
    res.status(500).json({
      error: 'Failed to create program outcome',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/program-outcomes/:id
 * @desc    Get program outcome by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const po = await ProgramOutcome.findById(id)
      .populate('mappedCourses.courseId', 'name code')
      .populate('createdBy', 'name email');

    if (!po) {
      return res.status(404).json({ error: 'Program outcome not found' });
    }

    res.json({
      success: true,
      po
    });
  } catch (error) {
    console.error('Error fetching program outcome:', error);
    res.status(500).json({
      error: 'Failed to fetch program outcome',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/program-outcomes/program/:program/pos
 * @desc    Get all POs for a program
 * @access  Private
 */
router.get('/program/:program/pos', authenticate, async (req, res) => {
  try {
    const { program } = req.params;

    const pos = await ProgramOutcome.getProgramPOs(program);

    res.json({
      success: true,
      count: pos.length,
      pos
    });
  } catch (error) {
    console.error('Error fetching POs:', error);
    res.status(500).json({
      error: 'Failed to fetch POs',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/program-outcomes/program/:program/psos
 * @desc    Get all PSOs for a program
 * @access  Private
 */
router.get('/program/:program/psos', authenticate, async (req, res) => {
  try {
    const { program } = req.params;

    const psos = await ProgramOutcome.getProgramPSOs(program);

    res.json({
      success: true,
      count: psos.length,
      psos
    });
  } catch (error) {
    console.error('Error fetching PSOs:', error);
    res.status(500).json({
      error: 'Failed to fetch PSOs',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/program-outcomes/program/:program/all
 * @desc    Get all POs and PSOs for a program
 * @access  Private
 */
router.get('/program/:program/all', authenticate, async (req, res) => {
  try {
    const { program } = req.params;

    const pos = await ProgramOutcome.getProgramPOs(program);
    const psos = await ProgramOutcome.getProgramPSOs(program);

    res.json({
      success: true,
      pos,
      psos,
      total: pos.length + psos.length
    });
  } catch (error) {
    console.error('Error fetching outcomes:', error);
    res.status(500).json({
      error: 'Failed to fetch outcomes',
      details: error.message
    });
  }
});

/**
 * @route   GET /api/program-outcomes/program/:program/attainment
 * @desc    Get attainment report for a program
 * @access  Private (Faculty/Admin)
 */
router.get('/program/:program/attainment', authenticate, async (req, res) => {
  try {
    const { program } = req.params;
    const { academicYear } = req.query;

    if (!academicYear) {
      return res.status(400).json({ error: 'Academic year is required' });
    }

    const report = await ProgramOutcome.getAttainmentReport(program, academicYear);

    res.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating attainment report:', error);
    res.status(500).json({
      error: 'Failed to generate attainment report',
      details: error.message
    });
  }
});

/**
 * @route   PUT /api/program-outcomes/:id
 * @desc    Update program outcome
 * @access  Private (Admin)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const po = await ProgramOutcome.findById(id);

    if (!po) {
      return res.status(404).json({ error: 'Program outcome not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== '_id') {
        po[key] = updates[key];
      }
    });

    po.lastUpdated = new Date();
    await po.save();

    res.json({
      success: true,
      message: 'Program outcome updated successfully',
      po
    });
  } catch (error) {
    console.error('Error updating program outcome:', error);
    res.status(500).json({
      error: 'Failed to update program outcome',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/program-outcomes/:id/calculate-attainment
 * @desc    Calculate attainment for a PO
 * @access  Private (Faculty/Admin)
 */
router.post('/:id/calculate-attainment', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { courseResults } = req.body;

    const po = await ProgramOutcome.findById(id);

    if (!po) {
      return res.status(404).json({ error: 'Program outcome not found' });
    }

    const attainment = await po.calculateAttainment(courseResults);

    res.json({
      success: true,
      message: 'Attainment calculated successfully',
      attainment,
      isAttained: po.isAttained()
    });
  } catch (error) {
    console.error('Error calculating attainment:', error);
    res.status(500).json({
      error: 'Failed to calculate attainment',
      details: error.message
    });
  }
});

/**
 * @route   POST /api/program-outcomes/:id/map-course
 * @desc    Map a course to a PO
 * @access  Private (Faculty/Admin)
 */
router.post('/:id/map-course', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { courseId, courseName, mappingLevel } = req.body;

    const po = await ProgramOutcome.findById(id);

    if (!po) {
      return res.status(404).json({ error: 'Program outcome not found' });
    }

    // Check if course already mapped
    const existingMapping = po.mappedCourses.find(
      c => c.courseId.toString() === courseId
    );

    if (existingMapping) {
      existingMapping.mappingLevel = mappingLevel;
    } else {
      po.mappedCourses.push({
        courseId,
        courseName,
        mappingLevel
      });
    }

    await po.save();

    res.json({
      success: true,
      message: 'Course mapped successfully',
      po
    });
  } catch (error) {
    console.error('Error mapping course:', error);
    res.status(500).json({
      error: 'Failed to map course',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/program-outcomes/:id/unmap-course/:courseId
 * @desc    Unmap a course from a PO
 * @access  Private (Faculty/Admin)
 */
router.delete('/:id/unmap-course/:courseId', authenticate, async (req, res) => {
  try {
    const { id, courseId } = req.params;

    const po = await ProgramOutcome.findById(id);

    if (!po) {
      return res.status(404).json({ error: 'Program outcome not found' });
    }

    po.mappedCourses = po.mappedCourses.filter(
      c => c.courseId.toString() !== courseId
    );

    await po.save();

    res.json({
      success: true,
      message: 'Course unmapped successfully',
      po
    });
  } catch (error) {
    console.error('Error unmapping course:', error);
    res.status(500).json({
      error: 'Failed to unmap course',
      details: error.message
    });
  }
});

/**
 * @route   DELETE /api/program-outcomes/:id
 * @desc    Delete program outcome
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete program outcomes' });
    }

    const po = await ProgramOutcome.findById(id);

    if (!po) {
      return res.status(404).json({ error: 'Program outcome not found' });
    }

    po.isActive = false;
    await po.save();

    res.json({
      success: true,
      message: 'Program outcome deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting program outcome:', error);
    res.status(500).json({
      error: 'Failed to delete program outcome',
      details: error.message
    });
  }
});

module.exports = router;
