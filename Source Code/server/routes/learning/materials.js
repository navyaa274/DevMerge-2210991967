const express = require('express');
const upload = require('../../utils/fileUpload');
const { authenticate, authorize } = require('../../middleware/auth');
const Course = require('../../models/academic/Course');

const router = express.Router();

// Upload course material
router.post('/:courseId/upload', authenticate, authorize(['faculty']), upload.single('file'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const material = {
      name: req.file.originalname,
      url: `/uploads/${req.user.id}/${req.file.filename}`,
      type: req.file.mimetype,
      uploadedAt: new Date()
    };

    course.modules[0].materials.push(material);
    await course.save();

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get course materials
router.get('/:courseId', authenticate, async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid course ID format',
        data: [] 
      });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found',
        data: [] 
      });
    }
    
    // Handle both string materials and object materials
    const materials = [];
    if (course.modules && Array.isArray(course.modules)) {
      course.modules.forEach((m, moduleIndex) => {
        if (m.materials && Array.isArray(m.materials)) {
          m.materials.forEach((material, index) => {
            if (typeof material === 'string') {
              materials.push({
                _id: `${course._id}-${moduleIndex}-${index}`,
                title: `Material ${index + 1}`,
                type: 'document',
                url: material
              });
            } else if (material && typeof material === 'object') {
              materials.push(material);
            }
          });
        }
      });
    }
    
    res.json({ 
      success: true,
      data: materials 
    });
  } catch (error) {
    console.error('Error fetching course materials:', error);
    // Handle CastError specifically
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid course ID format',
        data: [] 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message, 
      data: [] 
    });
  }
});

// Support /course/:courseId path as well
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    // Validate ObjectId format
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(req.params.courseId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid course ID format',
        data: [] 
      });
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: 'Course not found',
        data: [] 
      });
    }
    
    // Handle both string materials and object materials
    const materials = [];
    if (course.modules && Array.isArray(course.modules)) {
      course.modules.forEach((m, moduleIndex) => {
        if (m.materials && Array.isArray(m.materials)) {
          m.materials.forEach((material, index) => {
            if (typeof material === 'string') {
              materials.push({
                _id: `${course._id}-${moduleIndex}-${index}`,
                title: `Material ${index + 1}`,
                type: 'document',
                url: material
              });
            } else if (material && typeof material === 'object') {
              materials.push(material);
            }
          });
        }
      });
    }
    
    res.json({ 
      success: true,
      data: materials 
    });
  } catch (error) {
    console.error('Error fetching course materials:', error);
    // Handle CastError specifically
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid course ID format',
        data: [] 
      });
    }
    res.status(500).json({ 
      success: false,
      message: error.message, 
      data: [] 
    });
  }
});

module.exports = router;
