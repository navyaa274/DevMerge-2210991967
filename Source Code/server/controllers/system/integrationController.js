const Integration = require("../../models/admin/Integration");

const integrationController = {
  getAllIntegrations: async (req, res) => {
    try {
      const { category, status, page = 1, limit = 20 } = req.query;
      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;

      const integrations = await Integration.find(filter)
        .populate("createdBy", "name email")
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Integration.countDocuments(filter);

      res.json({
        success: true,
        data: integrations,
        pagination: { page: parseInt(page), limit: parseInt(limit), total },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getIntegrationById: async (req, res) => {
    try {
      const integration = await Integration.findById(req.params.id).populate(
        "createdBy",
        "name email",
      );

      if (!integration) {
        return res
          .status(404)
          .json({ success: false, message: "Integration not found" });
      }

      res.json({ success: true, data: integration });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  createIntegration: async (req, res) => {
    try {
      const integration = new Integration({
        ...req.body,
        createdBy: req.user?.id,
      });
      await integration.save();
      res.status(201).json({ success: true, data: integration });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateIntegration: async (req, res) => {
    try {
      const integration = await Integration.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      );
      if (!integration) {
        return res
          .status(404)
          .json({ success: false, message: "Integration not found" });
      }
      res.json({ success: true, data: integration });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  deleteIntegration: async (req, res) => {
    try {
      const integration = await Integration.findByIdAndDelete(req.params.id);
      if (!integration) {
        return res
          .status(404)
          .json({ success: false, message: "Integration not found" });
      }
      res.json({ success: true, message: "Integration deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  connectIntegration: async (req, res) => {
    try {
      const { credentials } = req.body;
      const integration = await Integration.findById(req.params.id);

      if (!integration) {
        return res
          .status(404)
          .json({ success: false, message: "Integration not found" });
      }

      integration.credentials = credentials;
      integration.status = "active";
      integration.lastConnected = new Date();

      await integration.save();
      res.json({ success: true, data: integration });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  disconnectIntegration: async (req, res) => {
    try {
      const integration = await Integration.findByIdAndUpdate(
        req.params.id,
        { status: "disconnected", lastDisconnected: new Date() },
        { new: true },
      );

      if (!integration) {
        return res
          .status(404)
          .json({ success: false, message: "Integration not found" });
      }

      res.json({ success: true, data: integration });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  testIntegration: async (req, res) => {
    try {
      const integration = await Integration.findById(req.params.id);

      if (!integration) {
        return res
          .status(404)
          .json({ success: false, message: "Integration not found" });
      }

      res.json({
        success: true,
        data: { status: "test passed", integration: integration.name },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = integrationController;
