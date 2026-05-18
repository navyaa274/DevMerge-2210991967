const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const collaborationController = require('../../controllers/communication/collaborationController');

// 1. Peer Learning: Share Solution (Item 26)
router.post('/share', authenticate, collaborationController.shareSubmission);

// 2. Peer Learning: Solution Library (Item 26)
router.get('/library', authenticate, collaborationController.getPublicLibrary);

// 3. Study Groups: Create Study Circle (Item 28)
router.post('/groups', authenticate, collaborationController.createStudyGroup);

// 4. Study Groups: Join & Participate (Item 28)
router.post('/groups/:groupId/join', authenticate, collaborationController.joinGroup);


// --- Legacy Real-Time Room Support ---
const Collaboration = require('../../models/assessment/Collaboration');
const { v4: uuidv4 } = require('uuid');

// Create collaboration room
router.post('/', authenticate, async (req, res) => {
  try {
    const { problem } = req.body;
    const roomId = uuidv4();
    const collaboration = new Collaboration({
      problem,
      participants: [req.user.id],
      roomId
    });
    await collaboration.save();
    res.status(201).json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join collaboration room
router.post('/:roomId/join', authenticate, async (req, res) => {
  try {
    const collaboration = await Collaboration.findOneAndUpdate(
      { roomId: req.params.roomId },
      { $addToSet: { participants: req.user.id } },
      { new: true }
    );
    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get collaboration room
router.get('/:roomId', authenticate, async (req, res) => {
  try {
    const collaboration = await Collaboration.findOne({ roomId: req.params.roomId })
      .populate('participants', 'name email');
    res.json(collaboration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
