const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");

const webhookController = require("../../controllers/system/webhookController");
const searchController = require("../../controllers/system/searchController");
const moderationController = require("../../controllers/system/moderationController");
const preferencesController = require("../../controllers/system/preferencesController");
const integrationController = require("../../controllers/system/integrationController");
const mobileController = require("../../controllers/system/mobileController");

router.get(
  "/webhooks",
  authenticate,
  authorize(["admin", "hod"]),
  webhookController.getMyWebhooks,
);
router.post(
  "/webhooks",
  authenticate,
  authorize(["admin", "hod"]),
  webhookController.createWebhook,
);
router.delete(
  "/webhooks/:id",
  authenticate,
  authorize(["admin", "hod"]),
  webhookController.deleteWebhook,
);

router.get("/search", authenticate, searchController.globalSearch);
router.post("/search/advanced", authenticate, searchController.advancedSearch);
router.get(
  "/search/suggestions",
  authenticate,
  searchController.getSearchSuggestions,
);

router.get(
  "/moderation",
  authenticate,
  authorize(["admin", "moderator"]),
  moderationController.getAllFlags,
);
router.post("/moderation", authenticate, moderationController.createFlag);
router.get("/moderation/:id", authenticate, moderationController.getFlagById);
router.put(
  "/moderation/:id/resolve",
  authenticate,
  authorize(["admin", "moderator"]),
  moderationController.resolveFlag,
);
router.get(
  "/moderation/stats",
  authenticate,
  authorize(["admin"]),
  moderationController.getFlagStats,
);

router.get(
  "/preferences/:userId",
  authenticate,
  preferencesController.getUserPreferences,
);
router.put(
  "/preferences/:userId",
  authenticate,
  preferencesController.updatePreferences,
);
router.put(
  "/preferences/:userId/notifications",
  authenticate,
  preferencesController.updateNotificationSettings,
);
router.put(
  "/preferences/:userId/theme",
  authenticate,
  preferencesController.updateTheme,
);
router.post(
  "/preferences/:userId/reset",
  authenticate,
  preferencesController.resetPreferences,
);

router.get(
  "/integrations",
  authenticate,
  authorize(["admin"]),
  integrationController.getAllIntegrations,
);
router.get(
  "/integrations/:id",
  authenticate,
  integrationController.getIntegrationById,
);
router.post(
  "/integrations",
  authenticate,
  authorize(["admin"]),
  integrationController.createIntegration,
);
router.put(
  "/integrations/:id",
  authenticate,
  authorize(["admin"]),
  integrationController.updateIntegration,
);
router.delete(
  "/integrations/:id",
  authenticate,
  authorize(["admin"]),
  integrationController.deleteIntegration,
);
router.post(
  "/integrations/:id/connect",
  authenticate,
  authorize(["admin"]),
  integrationController.connectIntegration,
);
router.post(
  "/integrations/:id/disconnect",
  authenticate,
  authorize(["admin"]),
  integrationController.disconnectIntegration,
);
router.post(
  "/integrations/:id/test",
  authenticate,
  authorize(["admin"]),
  integrationController.testIntegration,
);

router.post("/mobile/register", authenticate, mobileController.registerDevice);
router.get(
  "/mobile/devices/:userId",
  authenticate,
  mobileController.getUserDevices,
);
router.delete(
  "/mobile/devices/:deviceId",
  authenticate,
  mobileController.unregisterDevice,
);
router.put(
  "/mobile/devices/:deviceId/status",
  authenticate,
  mobileController.updateDeviceStatus,
);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "Operational",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

module.exports = router;
