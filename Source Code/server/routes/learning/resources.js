const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");
const resourceController = require("../../controllers/learning/resourceController");

router.get("/", authenticate, resourceController.getAllResources);
router.get("/:id", authenticate, resourceController.getResourceById);
router.post(
  "/",
  authenticate,
  authorize(["admin", "faculty"]),
  resourceController.createResource,
);
router.put(
  "/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  resourceController.updateResource,
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "faculty"]),
  resourceController.deleteResource,
);
router.get("/search", authenticate, resourceController.searchResources);

module.exports = router;
