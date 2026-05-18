const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const Problem = require("../../models/assessment/problems/Problem");
const CodeSession = require("../../models/assessment/sessions/CodeSession");
const systemExecutor = require("../../utils/systemExecutor");
const mongoose = require("mongoose");

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all labs
router.get("/", authenticate, async (req, res) => {
  try {
    const { topic, difficulty, isAiGenerated } = req.query;
    let query = {
      $or: [
        { status: "Approved" },
        { isApproved: true },
        { status: "Published" }
      ],
      category: "lab"
    };

    if (topic && topic !== "All") query.topics = topic;
    if (difficulty && difficulty !== "All") query.difficulty = difficulty;
    if (isAiGenerated) query.isAiGenerated = isAiGenerated === "true";

    const labs = await Problem.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: labs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get suggested labs for current user
router.get("/suggested", authenticate, async (req, res) => {
  try {
    const { limit = 10, difficulty = "all" } = req.query;

    const queryState = {
      $or: [
        { status: "Approved" },
        { isApproved: true },
        { status: "Published" }
      ],
      category: "lab"
    };

    // Get accepted problem IDs to filter out already completed labs
    const LabSubmission = require("../../models/assessment/labs/LabSubmission");
    const completedLabs = await LabSubmission.find({
      student: req.user.id,
      status: "Accepted"
    }).distinct("problem");

    // Find labs that haven't been completed yet
    const suggestedLabs = await Problem.find({
      ...queryState,
      difficulty: difficulty === "all" ? { $exists: true } : difficulty,
      _id: { $nin: completedLabs },
    })
      .sort({ difficulty: 1, createdAt: -1 })
      .limit(parseInt(limit) || 10)
      .lean();

    res.json({
      success: true,
      data: suggestedLabs,
      count: suggestedLabs.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get lab details
router.get("/:labId", authenticate, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.labId)) {
      return res.status(400).json({ success: false, error: "Invalid lab ID" });
    }

    const lab = await Problem.findById(req.params.labId);
    if (!lab) {
      return res.status(404).json({ success: false, error: "Lab not found" });
    }

    // Convert starterCode Map to object for easier frontend handling
    const labData = lab.toObject();
    if (labData.starterCode instanceof Map) {
      labData.starterCode = Object.fromEntries(labData.starterCode);
    }

    res.json({ success: true, data: labData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const { generateLab } = require("../../utils/aiService");

// Generate a lab using AI
router.post("/generate", authenticate, async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const generatedProblem = await generateLab(topic, difficulty);

    if (!generatedProblem) {
      return res.status(500).json({ success: false, error: "Failed to generate lab" });
    }

    // Save to DB immediately for the student
    const problem = new Problem({
      ...generatedProblem,
      createdBy: req.user.id,
      isAiGenerated: true,
      isApproved: true,
      status: 'Approved',
      category: 'lab'
    });

    await problem.save();

    res.json({ success: true, data: problem });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post("/execute", authenticate, async (req, res) => {
  try {
    const { code, language, labId, input } = req.body;

    if (!code || !language) {
      return res
        .status(400)
        .json({ success: false, error: "Code and language are required" });
    }

    // Get file extension
    const fileName = `main.${systemExecutor.getFileExtension(language)}`;

    // Execute with system compilers (input is passed to executor for proper wrapping)
    const result = await systemExecutor.execute(
      code,
      language,
      fileName,
      input || "",
    );

    // Ensure output is a string
    const output = String(result.output || "");

    // Save execution to session (only if labId is a valid ObjectId)
    if (labId && isValidObjectId(labId)) {
      try {
        await CodeSession.findOneAndUpdate(
          { labId: new mongoose.Types.ObjectId(labId), userId: req.user.id },
          {
            $push: {
              executions: {
                code,
                language,
                output,
                timestamp: new Date(),
              },
            },
          },
          { upsert: true },
        );
      } catch (sessionError) {
        console.warn("Failed to save code session:", sessionError.message);
      }
    }

    res.json({ success: true, output });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save file
router.post("/:labId/save", authenticate, async (req, res) => {
  try {
    const { code, language, fileName } = req.body;
    const { labId } = req.params;

    // Only save to CodeSession if labId is a valid ObjectId
    if (isValidObjectId(labId)) {
      try {
        await CodeSession.findOneAndUpdate(
          { labId: new mongoose.Types.ObjectId(labId), userId: req.user.id },
          {
            $set: {
              currentCode: code,
              currentLanguage: language,
              currentFileName: fileName,
              lastSaved: new Date(),
            },
          },
          { upsert: true },
        );
      } catch (sessionError) {
        console.warn("Failed to save code session:", sessionError.message);
      }
    }

    res.json({ success: true, message: "File saved successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Invite collaborator
router.post("/:labId/invite", authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    const { labId } = req.params;

    if (!isValidObjectId(labId)) {
      return res.status(400).json({ success: false, error: "Invalid lab ID" });
    }

    const lab = await Problem.findById(labId);
    if (!lab) {
      return res.status(404).json({ success: false, error: "Lab not found" });
    }

    // Add collaborator (in real app, send email invitation)
    if (!lab.collaborators) {
      lab.collaborators = [];
    }

    if (!lab.collaborators.includes(email)) {
      lab.collaborators.push(email);
      await lab.save();
    }

    res.json({ success: true, message: "Invitation sent" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get session history
router.get("/:labId/history", authenticate, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.labId)) {
      return res.status(400).json({ success: false, error: "Invalid lab ID" });
    }

    const session = await CodeSession.findOne({
      labId: new mongoose.Types.ObjectId(req.params.labId),
      userId: req.user.id,
    });

    res.json({ success: true, data: session || {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
