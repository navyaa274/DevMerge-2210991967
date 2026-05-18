const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../../middleware/auth");
const teamController = require("../../controllers/communication/teamController");

router.get("/", authenticate, teamController.getAllTeams);
router.get("/:id", authenticate, teamController.getTeamById);
router.post("/", authenticate, teamController.createTeam);
router.put("/:id", authenticate, teamController.updateTeam);
router.delete("/:id", authenticate, teamController.deleteTeam);
router.post("/:id/members", authenticate, teamController.addMember);
router.delete(
  "/:id/members/:userId",
  authenticate,
  teamController.removeMember,
);

module.exports = router;
