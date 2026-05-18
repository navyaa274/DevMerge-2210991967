const CodeSession = require("../models/assessment/sessions/CodeSession");

class CodeLabSocket {
  constructor(io) {
    this.io = io;
    this.labRooms = new Map(); // labId -> Set of socket IDs
    this.userInfo = new Map(); // socket ID -> user info
  }

  initialize() {
    this.io.on("connection", (socket) => {
      console.log("CodeLab: User connected:", socket.id);

      // Join lab room
      socket.on("join-lab", async (data) => {
        const { labId } = data;

        // Use authenticated user from Socket.IO middleware
        if (!socket.user) {
          return socket.emit("error", { message: "Authentication required" });
        }
        const userId = socket.user._id.toString();
        const userName =
          `${socket.user.firstName || ""} ${socket.user.lastName || ""}`.trim() ||
          "Unknown";

        socket.join(labId);

        // Store user info
        this.userInfo.set(socket.id, {
          userId,
          userName,
          labId,
          role: socket.user.role,
        });

        // Add to lab room tracking
        if (!this.labRooms.has(labId)) {
          this.labRooms.set(labId, new Set());
        }
        this.labRooms.get(labId).add(socket.id);

        // Get all collaborators in this lab
        const collaborators = this.getLabCollaborators(labId);

        // Notify all users in the lab
        this.io.to(labId).emit("collaborators-update", {
          collaborators,
        });

        console.log(`User ${userName} joined lab ${labId}`);
      });

      // Code change
      socket.on("code-change", (data) => {
        const { labId, code, language, userId } = data;

        socket.to(labId).emit("code-update", {
          code,
          language,
          userId,
        });
      });

      // Cursor movement
      socket.on("cursor-move", (data) => {
        const { labId, line, column } = data;
        const userInfo = this.userInfo.get(socket.id);

        socket.to(labId).emit("cursor-update", {
          userId: userInfo?.userId,
          userName: userInfo?.userName,
          line,
          column,
        });
      });

      // File updates
      socket.on("file-update", (data) => {
        const { labId, files } = data;

        socket.to(labId).emit("file-update", {
          files,
        });
      });

      // Output updates
      socket.on("output-change", (data) => {
        const { labId, output } = data;

        socket.to(labId).emit("output-update", {
          output,
        });
      });

      // Chat messages
      socket.on("chat-message", (data) => {
        const { labId, userId, userName, message, timestamp } = data;

        this.io.to(labId).emit("chat-message", {
          userId,
          userName,
          message,
          timestamp,
        });
      });

      // Mentorship Focus: Faculty/Mentor takes full control (requires faculty+ role)
      socket.on("take-control", (data) => {
        const { labId } = data;

        // Only faculty, hod, admin, super_admin can take control
        if (
          !socket.user ||
          !["faculty", "hod", "admin", "super_admin"].includes(socket.user.role)
        ) {
          return socket.emit("error", {
            message: "Unauthorized: only faculty or above can take control",
          });
        }

        const mentorName =
          `${socket.user.firstName || ""} ${socket.user.lastName || ""}`.trim();
        this.io.to(labId).emit("mentor-leading", {
          mentorId: socket.user._id.toString(),
          mentorName,
          message: `${mentorName} has taken full control of the editor for mentorship.`,
        });
      });

      // Mentorship Release: Give control back to student
      socket.on("release-control", (data) => {
        const { labId } = data;
        if (
          !socket.user ||
          !["faculty", "hod", "admin", "super_admin"].includes(socket.user.role)
        ) {
          return socket.emit("error", { message: "Unauthorized" });
        }
        this.io.to(labId).emit("control-released");
      });

      // Mentorship Sync: Force student to follow mentor's cursor/file
      socket.on("mentorship-sync", (data) => {
        const { labId, fileId, line, column } = data;
        socket.to(labId).emit("mentor-focus-sync", {
          fileId,
          line,
          column,
        });
      });

      // Leave lab
      socket.on("leave-lab", (labId) => {
        this.handleUserLeave(socket, labId);
      });

      // Disconnect
      socket.on("disconnect", () => {
        const userInfo = this.userInfo.get(socket.id);
        if (userInfo) {
          this.handleUserLeave(socket, userInfo.labId);
        }
        console.log("CodeLab: User disconnected:", socket.id);
      });
    });
  }

  handleUserLeave(socket, labId) {
    socket.leave(labId);

    // Remove from tracking
    if (this.labRooms.has(labId)) {
      this.labRooms.get(labId).delete(socket.id);

      if (this.labRooms.get(labId).size === 0) {
        this.labRooms.delete(labId);
      }
    }

    this.userInfo.delete(socket.id);

    // Update collaborators list
    const collaborators = this.getLabCollaborators(labId);
    this.io.to(labId).emit("collaborators-update", {
      collaborators,
    });
  }

  getLabCollaborators(labId) {
    const socketIds = this.labRooms.get(labId) || new Set();
    const collaborators = [];

    socketIds.forEach((socketId) => {
      const info = this.userInfo.get(socketId);
      if (info) {
        collaborators.push({
          userId: info.userId,
          userName: info.userName,
          socketId,
        });
      }
    });

    return collaborators;
  }
}

module.exports = CodeLabSocket;
