const EditorSession = require("../../models/assessment/sessions/EditorSession");

const codeEditorController = {
  createSession: async (req, res) => {
    try {
      const { problemId, language = "javascript" } = req.body;

      const session = new EditorSession({
        user: req.user?.id,
        problem: problemId,
        language,
        code: "",
        cursorPosition: { line: 1, column: 1 },
        status: "active",
      });

      await session.save();
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getSession: async (req, res) => {
    try {
      const session = await EditorSession.findById(req.params.id)
        .populate("problem", "title description")
        .populate("user", "name email");

      if (!session) {
        return res
          .status(404)
          .json({ success: false, message: "Session not found" });
      }

      res.json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateCode: async (req, res) => {
    try {
      const { code, cursorPosition } = req.body;

      const session = await EditorSession.findByIdAndUpdate(
        req.params.id,
        {
          code,
          cursorPosition: cursorPosition || session?.cursorPosition,
          lastModified: new Date(),
        },
        { new: true },
      );

      if (!session) {
        return res
          .status(404)
          .json({ success: false, message: "Session not found" });
      }

      res.json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserSessions: async (req, res) => {
    try {
      const { userId } = req.params;
      const { status, limit = 10 } = req.query;

      const filter = { user: userId };
      if (status) filter.status = status;

      const sessions = await EditorSession.find(filter)
        .populate("problem", "title")
        .sort({ lastModified: -1 })
        .limit(parseInt(limit));

      res.json({ success: true, data: sessions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  closeSession: async (req, res) => {
    try {
      const session = await EditorSession.findByIdAndUpdate(
        req.params.id,
        { status: "closed", closedAt: new Date() },
        { new: true },
      );

      if (!session) {
        return res
          .status(404)
          .json({ success: false, message: "Session not found" });
      }

      res.json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  saveSnapshot: async (req, res) => {
    try {
      const { code, description } = req.body;

      const session = await EditorSession.findById(req.params.id);
      if (!session) {
        return res
          .status(404)
          .json({ success: false, message: "Session not found" });
      }

      session.snapshots.push({
        code,
        description,
        savedAt: new Date(),
      });

      await session.save();
      res.json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = codeEditorController;
