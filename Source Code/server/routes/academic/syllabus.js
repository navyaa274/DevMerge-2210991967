const express = require('express');
const router = express.Router();
const Syllabus = require('../../models/academic/Syllabus');
const SyllabusUnit = require('../../models/academic/SyllabusUnit');
const { authenticate } = require('../../middleware/auth');

/**
 * @route   POST /api/syllabus/create
 * @desc    Create a new syllabus
 * @access  Private (Faculty/Admin)
 */
router.post('/create', authenticate, async (req, res) => {
  try {
    const syllabusData = req.body;
    
    syllabusData.createdBy = req.user.id;
    
    const syllabus = new Syllabus(syllabusData);
    await syllabus.save();
    
    res.json({
      success: true,
      message: 'Syllabus created successfully',
      syllabus
    });
  } catch (error) {
    console.error('Error creating syllabus:', error);
    res.status(500).json({ 
      error: 'Failed to create syllabus',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/syllabus/:id
 * @desc    Get syllabus by ID
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const syllabus = await Syllabus.findById(id)
      .populate('course')
      .populate('units')
      .populate('faculty', 'name email')
      .populate('createdBy', 'name email');
    
    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }
    
    res.json({
      success: true,
      syllabus
    });
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    res.status(500).json({ 
      error: 'Failed to fetch syllabus',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/syllabus/course/:courseId
 * @desc    Get active syllabus for a course
 * @access  Private
 */
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const syllabus = await Syllabus.getSyllabusByCourse(courseId);
    
    if (!syllabus) {
      return res.status(404).json({ error: 'No active syllabus found for this course' });
    }
    
    res.json({
      success: true,
      syllabus
    });
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    res.status(500).json({ 
      error: 'Failed to fetch syllabus',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/syllabus/program/:program/semester/:semester
 * @desc    Get syllabi for program and semester
 * @access  Private
 */
router.get('/program/:program/semester/:semester', authenticate, async (req, res) => {
  try {
    const { program, semester } = req.params;
    const { academicYear } = req.query;
    
    if (!academicYear) {
      return res.status(400).json({ error: 'Academic year is required' });
    }
    
    const syllabi = await Syllabus.getActiveSyllabus(program, parseInt(semester), academicYear);
    
    res.json({
      success: true,
      count: syllabi.length,
      syllabi
    });
  } catch (error) {
    console.error('Error fetching syllabi:', error);
    res.status(500).json({ 
      error: 'Failed to fetch syllabi',
      details: error.message 
    });
  }
});

/**
 * @route   PUT /api/syllabus/:id
 * @desc    Update syllabus
 * @access  Private (Faculty/Admin)
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const syllabus = await Syllabus.findById(id);
    
    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== '_id') {
        syllabus[key] = updates[key];
      }
    });
    
    await syllabus.save();
    
    res.json({
      success: true,
      message: 'Syllabus updated successfully',
      syllabus
    });
  } catch (error) {
    console.error('Error updating syllabus:', error);
    res.status(500).json({ 
      error: 'Failed to update syllabus',
      details: error.message 
    });
  }
});

/**
 * @route   PUT /api/syllabus/:id/status
 * @desc    Update syllabus status
 * @access  Private (Admin)
 */
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const syllabus = await Syllabus.findById(id);
    
    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }
    
    syllabus.status = status;
    
    if (status === 'Approved') {
      syllabus.approvedBy = req.user.id;
      syllabus.approvalDate = new Date();
    }
    
    await syllabus.save();
    
    res.json({
      success: true,
      message: 'Status updated successfully',
      syllabus
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ 
      error: 'Failed to update status',
      details: error.message 
    });
  }
});

/**
 * @route   POST /api/syllabus/:id/units
 * @desc    Add unit to syllabus
 * @access  Private (Faculty/Admin)
 */
router.post('/:id/units', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const unitData = req.body;
    
    const syllabus = await Syllabus.findById(id);
    
    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }
    
    unitData.syllabus = id;
    unitData.createdBy = req.user.id;
    
    const unit = new SyllabusUnit(unitData);
    await unit.save();
    
    syllabus.units.push(unit._id);
    await syllabus.save();
    
    res.json({
      success: true,
      message: 'Unit added successfully',
      unit
    });
  } catch (error) {
    console.error('Error adding unit:', error);
    res.status(500).json({ 
      error: 'Failed to add unit',
      details: error.message 
    });
  }
});

/**
 * @route   GET /api/syllabus/:id/units
 * @desc    Get all units for a syllabus
 * @access  Private
 */
router.get('/:id/units', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const units = await SyllabusUnit.getUnitsBySyllabus(id);
    
    res.json({
      success: true,
      count: units.length,
      units
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ 
      error: 'Failed to fetch units',
      details: error.message 
    });
  }
});

/**
 * @route   DELETE /api/syllabus/:id
 * @desc    Delete syllabus
 * @access  Private (Admin)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete syllabus' });
    }
    
    const syllabus = await Syllabus.findById(id);
    
    if (!syllabus) {
      return res.status(404).json({ error: 'Syllabus not found' });
    }
    
    syllabus.isActive = false;
    await syllabus.save();
    
    res.json({
      success: true,
      message: 'Syllabus deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting syllabus:', error);
    res.status(500).json({ 
      error: 'Failed to delete syllabus',
      details: error.message 
    });
  }
});

module.exports = router;

