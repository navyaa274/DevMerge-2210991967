const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");

const userController = require("../../controllers/general/userController");
const feedbackController = require("../../controllers/general/feedbackController");
const searchController = require("../../controllers/general/searchController");

router.get("/profile", authenticate, userController.getProfile);
router.put("/profile", authenticate, userController.updateProfile);

router.get(
  "/users",
  authenticate,
  authorize(["admin", "super_admin", "hod"]),
  userController.getAllUsers,
);
router.get(
  "/users/:id",
  authenticate,
  authorize(["admin", "super_admin"]),
  userController.getUserById,
);
router.post(
  "/users",
  authenticate,
  authorize(["admin", "super_admin"]),
  userController.createUser,
);
router.put(
  "/users/:id",
  authenticate,
  authorize(["admin", "super_admin"]),
  userController.updateUser,
);
router.put(
  "/users/:id/status",
  authenticate,
  authorize(["admin", "super_admin"]),
  userController.updateUserStatus,
);
router.delete(
  "/users/:id",
  authenticate,
  authorize(["super_admin"]),
  userController.deleteUser,
);

router.post("/feedback", authenticate, feedbackController.createFeedback);
router.get(
  "/feedback",
  authenticate,
  authorize(["admin"]),
  feedbackController.getAllFeedback,
);
router.get(
  "/feedback/user/:userId",
  authenticate,
  feedbackController.getUserFeedback,
);
router.put(
  "/feedback/:id",
  authenticate,
  authorize(["admin"]),
  feedbackController.updateFeedback,
);
router.post(
  "/feedback/:id/respond",
  authenticate,
  authorize(["admin"]),
  feedbackController.respondToFeedback,
);

router.get("/search", authenticate, searchController.globalSearch);
router.post("/search/advanced", authenticate, searchController.advancedSearch);

module.exports = router;
