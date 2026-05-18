const express = require('express');
const router = express.Router();
const Contest = require('../../../models/assessment/logic/Contest');
const { authenticate, authorize } = require('../../../middleware/auth');

// Contests Routes
// Create contest (faculty)
router.post('/contests', authenticate, authorize(['faculty']), async (req, res) => {
  try {
    console.log('Creating contest with data:', JSON.stringify(req.body, null, 2));
    const { title, description, problems, startTime, endTime, duration, isPublic, settings, scoringType, xpMultiplier } = req.body;
    
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Title, start time, and end time are required' });
    }

    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start time or end time format' });
    }

    const calculatedDuration = duration || Math.max(0, Math.round((parsedEndTime - parsedStartTime) / (1000 * 60)));

    const contest = new Contest({
      title,
      description,
      createdBy: req.user.id,
      problems: Array.isArray(problems) ? problems.map(p => {
        if (typeof p === 'string') return { problemId: p };
        if (p && p.problemId) return p;
        return null;
      }).filter(Boolean) : [],
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      duration: calculatedDuration,
      isPublic: !!isPublic,
      settings: settings || {
        isProctored: false,
        allowTabSwitching: true,
        maxTabSwitches: 3,
        requireCamera: false,
        ipLocking: false
      },
      scoringType: scoringType || 'ACM',
      xpMultiplier: xpMultiplier || 1.0,
      status: 'scheduled'
    });
    
    console.log('Contest object prepared:', JSON.stringify(contest, null, 2));
    await contest.save();
    console.log('Contest saved successfully');
    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    console.error('Contest creation error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A contest with this title already exists. Please choose a different title.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all contests
router.get('/contests', authenticate, async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('createdBy', 'name email')
      .populate('problems.problemId', 'title difficulty');
    res.json({ success: true, data: contests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Join contest
router.post('/contests/:id/join', authenticate, authorize(['student']), async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { participants: { userId: req.user.id } } },
      { new: true }
    );
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, data: contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get contest by ID
router.get('/contests/:id', authenticate, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('problems.problemId')
      .populate('participants.userId', 'name email');
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, data: contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update contest
router.put('/contests/:id', authenticate, authorize(['faculty']), async (req, res) => {
  try {
    const { title, description, problems, startTime, endTime, duration, isPublic, settings, scoringType, xpMultiplier, status } = req.body;
    
    const updateData = {
      title,
      description,
      problems: Array.isArray(problems) ? problems.map(p => {
        if (typeof p === 'string') return { problemId: p };
        if (p && p.problemId) return p;
        return null;
      }).filter(Boolean) : undefined,
      isPublic: typeof isPublic === 'boolean' ? isPublic : undefined,
      settings,
      scoringType,
      xpMultiplier,
      status,
      updatedAt: new Date()
    };

    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    if (startTime || endTime) {
      const s = updateData.startTime || (await Contest.findById(req.params.id)).startTime;
      const e = updateData.endTime || (await Contest.findById(req.params.id)).endTime;
      updateData.duration = duration || Math.max(0, Math.round((new Date(e) - new Date(s)) / (1000 * 60)));
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const contest = await Contest.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('createdBy', 'name email')
      .populate('problems.problemId', 'title difficulty');
      
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, data: contest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete contest
router.delete('/contests/:id', authenticate, authorize(['faculty']), async (req, res) => {
  try {
    const result = await Contest.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, message: 'Contest deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get contest leaderboard
router.get('/contests/:id/leaderboard', authenticate, async (req, res) => {
  try {
    // Get contest with submissions
    const contest = await Contest.findById(req.params.id).populate('problems.problemId');
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    // Placeholder for actual leaderboard calculation
    res.json({ success: true, data: { message: 'Contest leaderboard endpoint' } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
