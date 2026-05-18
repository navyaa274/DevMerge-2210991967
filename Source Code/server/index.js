const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import startup guard (runs before anything else) - DISABLED FOR DEVELOPMENT
// const { createStartupGuard } = require("./startup/guard");

// Import centralized configuration (this validates on import)
const { SERVER, DATABASE, SECURITY, APP } = require("./config");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const morgan = require("morgan");
const http = require("http");
const socketIo = require("socket.io");
const winston = require("winston");
const { connectDB } = require("./config/database");
const connectRedis = require("./utils/redisInit");
const compressionMiddleware = require("./middleware/compression");
const requestBatcher = require("./middleware/requestBatcher");
const RealtimeDashboard = require("./services/system/realtimeDashboard");
const WebSocketOptimizer = require("./utils/websocketOptimizer");
const setupSwagger = require("./swagger");
const { wafMiddleware } = require("./middleware/advancedSecurity");
const { metricsMiddleware, getMetrics } = require("./utils/observability");
const CodeLabSocket = require("./sockets/codeLabSocket");

// Import route modules from organized folders
const authRoutes = require("./routes/auth/index");

const adminRoutes = require("./routes/admin/index");

const facultyRoutes = require("./routes/faculty/index");

const studentRoutes = require("./routes/student/index");

const academicRoutes = require("./routes/academic/index");

const app = express();
const server = http.createServer(app);
const socketAllowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];
const io = socketIo(server, {
  cors: {
    origin: socketAllowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingInterval: 25000,
  pingTimeout: 60000,
  maxHttpBufferSize: 1e6,
});

// Socket.IO middleware for JWT authentication
const jwtLib = require("jsonwebtoken");
const UserModel = require("./models/auth/User");

io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error("Authentication required: no token provided"));
  }
  try {
    const decoded = jwtLib.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    const user = await UserModel.findById(decoded.id).select(
      "_id role firstName lastName",
    );
    if (!user) {
      return next(new Error("Authentication failed: user not found"));
    }
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication failed: invalid token"));
  }
});

// Initialize Socket.IO handlers
const notificationService = require("./services/notification/notificationService");
notificationService.setIo(io);

const codeLabSocket = new CodeLabSocket(io);
codeLabSocket.initialize();

io.on("connection", (socket) => {
  // Join user-specific room for private notifications
  if (socket.user?._id) {
    socket.join(`user:${socket.user._id}`);
    // console.log(`User ${socket.user._id} joined private room`);
  }

  socket.on("disconnect", () => {
    // Rooms are automatically left on disconnect
  });
});

// Setup Realtime Dashboard
const realtimeDashboard = new RealtimeDashboard(io);
realtimeDashboard.start();
app.set("realtimeDashboard", realtimeDashboard);
app.set("io", io);

// Setup logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({ filename: "logs/server.log" }),
  ],
});

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// 1. Security Headers (helmet)
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "development"
        ? {
          directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            "connect-src": [
              "'self'",
              "http://localhost:5002",
              "ws://localhost:5002",
              "http://localhost:3000",
              "https://api.groq.com",
            ],
          },
        }
        : undefined,
    crossOriginEmbedderPolicy:
      process.env.NODE_ENV === "development" ? false : true,
  }),
);

// 2. Rate Limiting / DDoS protection
const LOCAL_IPS = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: process.env.NODE_ENV === "production" ? 100 : 10000,
  skip: (req) => {
    if (process.env.DISABLE_API_RATE_LIMIT === "1") return true;
    if (process.env.NODE_ENV !== "production") return true;
    return LOCAL_IPS.has(req.ip) || req.hostname === "localhost";
  },
  message: "Too many requests from this IP",
});
app.use("/api", limiter);

// 3. Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// 4. Prevent HTTP Parameter Pollution
app.use(hpp());

// 5. HTTP request audit logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  // Use combined format for production logging (audit logging)
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    }),
  );
}

setupSwagger(app);
app.use(compressionMiddleware); // Response compression
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(requestBatcher.middleware()); // Request batching
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 🧪 Observability Metrics Endpoint (Prometheus)
app.get("/metrics", getMetrics);

// Serve the primary index for non-API routes (CRA fallback)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 🛡️ Advanced Security WAF and Observability Tracking
if (process.env.NODE_ENV !== "test") {
  app.use(metricsMiddleware);
  app.use(wafMiddleware);
}

// Consolidated API Surface (Organized by Strategic Function)
app.get("/api/ping", (req, res) => res.json({ success: true, message: "MAIN SERVER PING OK", ts: Date.now() }));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", require("./routes/users/index")); // User Management (CRUD, profile, settings)
app.use("/api/faculty", facultyRoutes);
app.use("/api/hod", require("./routes/hod/index")); // HOD compatibility routes
app.use("/api/student", studentRoutes);
app.use("/api", require("./routes/academic/index"));
app.use("/api/institutional", require("./routes/academic/institutional"));
app.use("/api/analytics", require("./routes/analytics/index"));
app.use(
  "/api/predictive-analytics",
  require("./routes/analytics/predictive-analytics"),
);
app.use("/api", require("./routes/assessment/index")); // Problems, Submissions
app.use("/api", require("./routes/assessment/contests")); // Contests
app.use("/api", require("./routes/registrar/automation")); // Registrar Automation
app.use("/api/automation", require("./routes/automation/completeWorkflow")); // Complete Workflow
app.use("/api", require("./routes/communication/index")); // Notifications, Forums

// Gamification, Paths, and Quests
app.use("/api/learning", require("./routes/learning/index"));
app.use("/api/learning/mock-interviews", require("./routes/learning/mock-interviews"));

// General Routes (Leaderboard, Notifications, Analytics) - MUST be after learning routes
app.use("/api", require("./routes/general/index"));
app.use("/api/shared", require("./routes/shared/index"));
app.use("/api", require("./routes/learning/index")); // Back-compat for /api/paths
// Back-compat alias for labs suggested endpoint
app.use("/api/labs", require("./routes/assessment/code-lab"));

// Basic routes for testing
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "API is working!" });
});

// Remaining routes (will be organized in next phase)

// AI Routes
app.use("/api/ai", require("./routes/ai"));
app.use("/api/ai-tutor", require("./routes/ai/aiTutor"));
app.use("/api/facultyCopilot", require("./routes/ai/facultyCopilot"));
app.use("/api/faculty-copilot", require("./routes/ai/facultyCopilot")); // Add dash version for compatibility
app.use(
  "/api/ultimate-problem-generator",
  require("./routes/ai/ultimate-problem-generator"),
);
app.use(
  "/api/ultimate-lab-generator",
  require("./routes/ai/ultimate-lab-generator"),
);

// Research Portal Routes
app.use("/api/research", require("./routes/research/index"));

// Digital Library Routes
app.use("/api/library", require("./routes/library/index"));

// System and Admin Routes
app.use("/api/system/v2", require("./routes/system/index"));
app.use("/api/system", require("./routes/system/system"));
app.use("/api/performance", require("./routes/system/performance"));
app.use("/api/api-keys", require("./routes/system/api-keys"));
app.use("/api/preferences", require("./routes/system/preferences"));
app.use("/api/reports", require("./routes/reports/pdf-generation"));
app.use("/api/reports", require("./routes/reports/reports"));
app.use("/api/accreditation", require("./routes/reports/accreditation"));
app.use(
  "/api/data-visualization",
  require("./routes/reports/data-visualization"),
);
app.use(
  "/api/scheduled-reports",
  require("./routes/reports/scheduled-reports"),
);
app.use("/api/moderation", require("./routes/system/moderation"));
app.use("/api/integrations", require("./routes/system/integrations"));
app.use("/api/support", require("./routes/system/support"));

// Socket.IO setup
const wsOptimizer = new WebSocketOptimizer(io);

// Error handling middleware — use centralized error handler
const errorMiddleware = require("./errors/errorMiddleware");
app.use(errorMiddleware);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    code: "ROUTE_NOT_FOUND",
  });
});

// Start server
const PORT = process.env.SERVER_PORT || process.env.PORT || 5002;

async function startServer() {
  try {
    // Validate required environment variables
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      logger.error(
        "JWT_SECRET and JWT_REFRESH_SECRET environment variables are required.",
      );
      process.exit(1);
    }
    process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";
    process.env.JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "30d";
    process.env.NODE_ENV = process.env.NODE_ENV || "development";

    // Initialize database
    const dbConnected = await connectDB();
    if (dbConnected) {
      logger.info("✅ Database connected");
    } else {
      logger.warn("⚠️ Database not connected - running in development mode");
    }

    // Connect to Redis
    try {
      await connectRedis();
      logger.info("✅ Redis connected");
    } catch (error) {
      logger.warn("⚠️ Redis connection failed:", error.message);
    }

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Run startup guard before starting server - DISABLED FOR DEVELOPMENT
async function runStartupGuard() {
  console.log("� Startup guard disabled for development - Starting server...");
  return true;
}

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close(() => {
      logger.info("Process terminated");
      process.exit(0);
    });
  });
});

if (process.env.NODE_ENV !== "test") {
  runStartupGuard()
    .then(() => {
      startServer();
    })
    .catch((error) => {
      console.error("? Startup guard failed:", error);
      process.exit(1);
    });
} else {
  startServer();
}

module.exports = { app, server, io };
