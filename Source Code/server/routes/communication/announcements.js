const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const mongoose = require('mongoose');

// Announcement schema (inline for simplicity)
const announcementSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

// Create announcement
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { title, content } = req.body;
    const announcement = new Announcement({
      title,
      content,
      createdBy: req.user.id
    });
    await announcement.save();
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all announcements
router.get('/', authenticate, async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete announcement
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
