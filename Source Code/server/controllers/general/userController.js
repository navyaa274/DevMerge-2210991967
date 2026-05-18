const User = require("../../models/auth/User");

const userController = {
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password").lean();
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { name, bio, phone, profilePicture } = req.body;
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name, bio, phone, profilePicture, updatedAt: new Date() },
        { new: true },
      ).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const { role, department, isActive, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (role) filter.role = role;
      if (department) filter.department = department;
      if (isActive !== undefined) filter.isActive = isActive === "true";

      const skip = (page - 1) * limit;
      const users = await User.find(filter)
        .select("-password")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        data: users,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  createUser: async (req, res) => {
    try {
      const { name, email, password, role, department } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
      const user = new User({
        name,
        email,
        password,
        role: role || "student",
        department,
      });
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .select("-password")
        .lean();
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { name, email, role, department, password } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (department) user.department = department;
      if (password) user.password = password;
      user.updatedAt = new Date();
      await user.save();

      const updatedUser = user.toObject();
      delete updatedUser.password;
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { isActive } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive, updatedAt: new Date() },
        { new: true },
      ).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = userController;
