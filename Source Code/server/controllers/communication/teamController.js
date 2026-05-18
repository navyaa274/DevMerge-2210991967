const Team = require("../../models/communication/Team");

const teamController = {
  getAllTeams: async (req, res) => {
    try {
      const { userId, page = 1, limit = 20 } = req.query;
      const filter = userId ? { members: userId } : {};

      const teams = await Team.find(filter)
        .populate("members", "name email avatar")
        .populate("owner", "name email")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Team.countDocuments(filter);

      res.json({
        success: true,
        data: teams,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getTeamById: async (req, res) => {
    try {
      const team = await Team.findById(req.params.id)
        .populate("members", "name email avatar role")
        .populate("owner", "name email");

      if (!team) {
        return res
          .status(404)
          .json({ success: false, message: "Team not found" });
      }

      res.json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createTeam: async (req, res) => {
    try {
      const team = new Team({
        ...req.body,
        owner: req.user?.id,
      });
      await team.save();
      res.status(201).json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateTeam: async (req, res) => {
    try {
      const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!team) {
        return res
          .status(404)
          .json({ success: false, message: "Team not found" });
      }
      res.json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteTeam: async (req, res) => {
    try {
      const team = await Team.findByIdAndDelete(req.params.id);
      if (!team) {
        return res
          .status(404)
          .json({ success: false, message: "Team not found" });
      }
      res.json({ success: true, message: "Team deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  addMember: async (req, res) => {
    try {
      const { userId, role = "member" } = req.body;
      const team = await Team.findById(req.params.id);

      if (!team) {
        return res
          .status(404)
          .json({ success: false, message: "Team not found" });
      }

      if (team.members.includes(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "User is already a member" });
      }

      team.members.push(userId);
      await team.save();
      res.json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  removeMember: async (req, res) => {
    try {
      const { userId } = req.params;
      const team = await Team.findById(req.params.id);

      if (!team) {
        return res
          .status(404)
          .json({ success: false, message: "Team not found" });
      }

      team.members = team.members.filter((m) => m.toString() !== userId);
      await team.save();
      res.json({ success: true, data: team });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = teamController;
