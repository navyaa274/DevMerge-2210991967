const Mentorship = require("../../models/learning/mentorship/Mentorship");
const User = require("../../models/auth/User");

const mentorshipController = {
  getAllMentorships: async (req, res) => {
    try {
      const { status, mentorId, menteeId, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (status) filter.status = status;
      if (mentorId) filter.mentor = mentorId;
      if (menteeId) filter.mentee = menteeId;

      const mentorships = await Mentorship.find(filter)
        .populate("mentor", "name email avatar")
        .populate("mentee", "name email avatar")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Mentorship.countDocuments(filter);

      res.json({
        success: true,
        data: mentorships,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getMentorshipById: async (req, res) => {
    try {
      const mentorship = await Mentorship.findById(req.params.id)
        .populate("mentor", "name email avatar")
        .populate("mentee", "name email avatar");

      if (!mentorship) {
        return res
          .status(404)
          .json({ success: false, message: "Mentorship not found" });
      }

      res.json({ success: true, data: mentorship });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createMentorship: async (req, res) => {
    try {
      const { mentorId, menteeId, goals, startDate, endDate } = req.body;

      const existing = await Mentorship.findOne({
        mentor: mentorId,
        mentee: menteeId,
        status: { $in: ["active", "pending"] },
      });

      if (existing) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Active mentorship already exists",
          });
      }

      const mentorship = new Mentorship({
        mentor: mentorId,
        mentee: menteeId,
        goals,
        startDate,
        endDate,
        status: "pending",
      });

      await mentorship.save();
      res.status(201).json({ success: true, data: mentorship });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateMentorship: async (req, res) => {
    try {
      const mentorship = await Mentorship.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!mentorship) {
        return res
          .status(404)
          .json({ success: false, message: "Mentorship not found" });
      }
      res.json({ success: true, data: mentorship });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  acceptMentorship: async (req, res) => {
    try {
      const mentorship = await Mentorship.findByIdAndUpdate(
        req.params.id,
        { status: "active", acceptedAt: new Date() },
        { new: true },
      );

      if (!mentorship) {
        return res
          .status(404)
          .json({ success: false, message: "Mentorship not found" });
      }

      res.json({ success: true, data: mentorship });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  completeMentorship: async (req, res) => {
    try {
      const { feedback, rating } = req.body;
      const mentorship = await Mentorship.findByIdAndUpdate(
        req.params.id,
        {
          status: "completed",
          completedAt: new Date(),
          feedback,
          rating,
        },
        { new: true },
      );

      if (!mentorship) {
        return res
          .status(404)
          .json({ success: false, message: "Mentorship not found" });
      }

      res.json({ success: true, data: mentorship });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAvailableMentors: async (req, res) => {
    try {
      const mentors = await User.find({
        role: "faculty",
        isAvailableForMentoring: true,
      }).select("name email avatar department");

      res.json({ success: true, data: mentors });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = mentorshipController;
