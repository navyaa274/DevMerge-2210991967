const Problem = require("../../models/assessment/problems/Problem");
const Submission = require("../../models/assessment/problems/Submission");
const { generateLab } = require("../../utils/aiService");

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

/**
 * Get Labs
 */
exports.getLabs = async (req, res) => {
  try {
    const labs = await Problem.find({ isApproved: true })
      .select("title slug difficulty topics description")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, count: labs.length, data: labs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get Personalized Lab Suggestions
 */
exports.getSuggestedLabs = async (req, res) => {
  try {
    const userId = req.user.id;
    const acceptedSubmissions = await Submission.find({
      student: userId,
      status: "Accepted",
    }).populate("problem");
    const completedTopicCounts = {};

    acceptedSubmissions.forEach((sub) => {
      if (sub.problem && sub.problem.topics) {
        sub.problem.topics.forEach((t) => {
          completedTopicCounts[t] = (completedTopicCounts[t] || 0) + 1;
        });
      }
    });

    const allPossibleTopics = [
      "Data Structures",
      "Algorithms",
      "Graph",
      "Dynamic Programming",
      "Database",
      "Logic",
    ];
    const weakTopics = allPossibleTopics.sort(
      (a, b) => (completedTopicCounts[a] || 0) - (completedTopicCounts[b] || 0),
    );
    const solvedProblemIds = acceptedSubmissions
      .map((s) => s.problem?._id)
      .filter((id) => id);

    const suggestedLabs = await Problem.find({
      isApproved: true,
      topics: { $in: weakTopics.slice(0, 3) },
      _id: { $nin: solvedProblemIds },
    })
      .limit(5)
      .select("title slug difficulty topics description")
      .lean();

    if (suggestedLabs.length === 0) {
      const generalLabs = await Problem.find({
        isApproved: true,
        _id: { $nin: solvedProblemIds },
      })
        .limit(3)
        .select("title slug difficulty topics description")
        .lean();
      return res.json({ success: true, data: generalLabs });
    }

    res.json({ success: true, data: suggestedLabs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get Lab Details
 */
exports.getLabDetails = async (req, res) => {
  try {
    const lab = await Problem.findOne({ slug: req.params.slug }).lean();
    if (!lab)
      return res.status(404).json({ success: false, message: "Lab not found" });
    res.json({ success: true, data: lab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Generate AI Lab
 */
exports.generateAILab = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const userId = req.user.id;
    const labData = await generateLab(
      topic || "General Algorithms",
      difficulty || "Medium",
    );

    if (!labData)
      return res
        .status(500)
        .json({ success: false, message: "AI failed to generate lab." });

    const validDifficulties = ["Easy", "Medium", "Hard"];
    let sanitizedDifficulty = difficulty || "Medium";

    const sanitizedData = {
      title: labData.title || `${topic} Challenge`,
      description: labData.description || `Solve this ${topic} problem.`,
      difficulty: sanitizedDifficulty,
      topics: Array.isArray(labData.topics) ? labData.topics : [topic],
      constraints:
        typeof labData.constraints === "string" ? labData.constraints : "",
      examples: Array.isArray(labData.examples)
        ? labData.examples.map((e) => ({
            input: String(e.input || ""),
            output: String(e.output || ""),
            explanation: String(e.explanation || ""),
          }))
        : [],
      testCases: Array.isArray(labData.testCases)
        ? labData.testCases.map((t) => ({
            input: String(t.input || ""),
            output: String(t.output || ""),
            isHidden: Boolean(t.isHidden),
          }))
        : [],
      starterCode: labData.starterCode || {},
      slug: `${slugify(labData.title || topic)}-${Date.now()}`,
      createdBy: userId,
      isApproved: true,
      isAiGenerated: true,
    };

    const newLab = new Problem(sanitizedData);
    await newLab.save();
    res.json({ success: true, message: "AI Lab generated", data: newLab });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
