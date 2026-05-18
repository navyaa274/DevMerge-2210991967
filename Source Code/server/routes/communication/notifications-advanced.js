const express = require("express");
const router = express.Router();
const asyncHandler = require("../../errors/asyncHandler");
const Notification = require("../../models/communication/Notification");

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const notification = await Notification.findById(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: "Notification not found",
        });
      }

      // Check if notification belongs to the authenticated user
      if (notification.userId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Access denied",
        });
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }),
);

router.post(
  "/send-bulk",
  asyncHandler(async (req, res) => {
    const { userIds, title, message, type } = req.body;
    res.json({ message: "Bulk notifications queued", count: userIds?.length });
  }),
);

router.post(
  "/schedule",
  asyncHandler(async (req, res) => {
    const { userId, title, message, scheduledTime } = req.body;
    res.status(201).json({ message: "Notification scheduled", scheduledTime });
  }),
);

router.get(
  "/preferences/:userId",
  asyncHandler(async (req, res) => {
    res.json({
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
    });
  }),
);

router.put(
  "/preferences/:userId",
  asyncHandler(async (req, res) => {
    const { emailNotifications, pushNotifications, smsNotifications } =
      req.body;
    res.json({ message: "Preferences updated" });
  }),
);

module.exports = router;
