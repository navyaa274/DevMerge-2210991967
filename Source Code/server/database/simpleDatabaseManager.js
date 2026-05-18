/**
 * Simple Database Manager - Suitable for 10k Students
 * Basic connection pooling, health monitoring, and query optimization
 */

const mongoose = require('mongoose');
const { APP, DATABASE } = require('../config');

class SimpleDatabaseManager {
  constructor(options = {}) {
    this.connection = null;
    this.isConnected = false;
    this.connectionOptions = {
      // Basic connection pooling for 10k users
      minPoolSize: options.minPoolSize || 5,
      maxPoolSize: options.maxPoolSize || 20,
      maxIdleTimeMS: options.maxIdleTime || 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,

      // Basic configuration
      retryWrites: true,
      retryReads: true,
      maxTimeMS: 30000,
    };

    this.healthCheckInterval = options.healthCheckInterval || 30000;
    this.healthCheckTimer = null;

    this.metrics = {
      connections: 0,
      activeConnections: 0,
      queriesExecuted: 0,
      connectionErrors: 0,
      lastHealthCheck: null,
      uptime: 0,
    };
  }

  /**
   * Initialize database connection for 10k students
   */
  async initialize() {
    console.log('🗄️ Initializing Simple Database Manager for 10k students...');

    try {
      // Configure Mongoose
      this.configureMongoose();

      // Establish connection
      await this.connect();

      // Set up health monitoring
      this.startHealthMonitoring();

      // Initialize indexes for performance
      await this.initializeIndexes();

      console.log('✅ Database manager initialized');
      console.log(`📊 Connection pool: ${this.connectionOptions.minPoolSize}-${this.connectionOptions.maxPoolSize}`);

    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Configure Mongoose for simple operations
   */
  configureMongoose() {
    // Basic configuration
    mongoose.set('strictQuery', true);

    // Development logging
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, method, query) => {
        console.log(`🔍 ${collectionName}.${method}`, JSON.stringify(query).substring(0, 100));
      });
    }
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      this.connection = await mongoose.connect(process.env.MONGODB_URI, this.connectionOptions);

      // Connection event handlers
      this.connection.connection.on('connected', () => {
        console.log('📱 Database connected successfully');
        this.isConnected = true;
        this.metrics.connections++;
      });

      this.connection.connection.on('error', (error) => {
        console.error('❌ Database connection error:', error);
        this.isConnected = false;
        this.metrics.connectionErrors++;
      });

      this.connection.connection.on('disconnected', () => {
        console.warn('⚠️ Database disconnected');
        this.isConnected = false;
      });

      this.connection.connection.on('reconnected', () => {
        console.log('🔄 Database reconnected');
        this.isConnected = true;
      });

    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Initialize essential indexes for 10k users
   */
  async initializeIndexes() {
    try {
      const db = mongoose.connection.db;

      // User indexes
      await db.collection('users').createIndexes([
        { key: { email: 1 }, options: { unique: true } },
        { key: { role: 1, status: 1 } },
        { key: { createdAt: -1 } },
      ]);

      // Course indexes
      await db.collection('courses').createIndexes([
        { key: { department: 1, semester: 1 } },
        { key: { instructor: 1 } },
        { key: { status: 1 } },
      ]);

      // Assignment indexes
      await db.collection('assignments').createIndexes([
        { key: { course: 1, dueDate: 1 } },
        { key: { student: 1, status: 1 } },
      ]);

      // Submission indexes
      await db.collection('submissions').createIndexes([
        { key: { assignment: 1, student: 1 }, options: { unique: true } },
        { key: { status: 1, submittedAt: -1 } },
      ]);

      console.log('✅ Database indexes initialized');

    } catch (error) {
      console.warn('⚠️ Index creation partially failed:', error.message);
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
    }, this.healthCheckInterval);

    console.log(`🔍 Health monitoring started (${this.healthCheckInterval}ms intervals)`);
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      if (!this.connection) {
        throw new Error('No connection established');
      }

      // Simple ping
      await this.connection.connection.db.admin().ping();

      // Get connection stats
      const stats = await this.connection.connection.db.stats();
      this.metrics.activeConnections = stats.connections?.current || 0;

      this.metrics.lastHealthCheck = new Date();
      this.metrics.uptime = process.uptime();

    } catch (error) {
      console.error('❌ Database health check failed:', error.message);
      this.isConnected = false;
      this.metrics.connectionErrors++;
    }
  }

  /**
   * Execute query with basic error handling
   */
  async executeQuery(operation, options = {}) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }

    const startTime = Date.now();

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      this.metrics.queriesExecuted++;

      // Log slow queries (>1 second)
      if (duration > 1000) {
        console.warn(`🐌 Slow query: ${duration}ms`);
      }

      return result;

    } catch (error) {
      console.error('❌ Query execution failed:', error);
      throw error;
    }
  }

  /**
   * Get database metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      isConnected: this.isConnected,
      poolSize: this.connectionOptions.maxPoolSize,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get database health status
   */
  getHealthStatus() {
    const metrics = this.getMetrics();
    const issues = [];

    if (!metrics.isConnected) {
      issues.push('Database not connected');
    }

    if (metrics.connectionErrors > 0) {
      issues.push(`${metrics.connectionErrors} connection errors`);
    }

    if (metrics.activeConnections > metrics.poolSize * 0.8) {
      issues.push('Connection pool near capacity');
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'degraded',
      issues,
      metrics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Shutting down database manager...');

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    if (this.connection) {
      try {
        await this.connection.disconnect();
        console.log('✅ Database connection closed');
      } catch (error) {
        console.error('❌ Error closing database connection:', error);
      }
    }

    console.log('✅ Database manager shutdown complete');
  }
}

// Export singleton instance
const simpleDatabaseManager = new SimpleDatabaseManager();
simpleDatabaseManager.initialize();

module.exports = simpleDatabaseManager;
module.exports.SimpleDatabaseManager = SimpleDatabaseManager;
