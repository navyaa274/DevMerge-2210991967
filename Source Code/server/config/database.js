const mongoose = require('mongoose');
const winston = require('winston');

/**
 * Database Configuration and Connection Management
 * Handles MongoDB connection with retry logic and proper error handling
 */

class DatabaseConnection {
  constructor() {
    this.connectionString = process.env.MONGODB_URI || 'mongodb+srv://navuaggarwal:navyaa274@cluster0.7noqj.mongodb.net/project?retryWrites=true&w=majority';
    this.options = {
      maxPoolSize: 30, // Optimized for production per Action Plan
      minPoolSize: 10,
      autoIndex: false, // Disabling autoIndex to handle indexing centrally
      maxIdleTimeMS: 45000,
      serverSelectionTimeoutMS: 30000, // Increased to 30 seconds for Atlas
      socketTimeoutMS: 45000,
      retryWrites: true,
      writeConcern: { w: 'majority' },
      family: 4,
      // Add DNS resolution options for better connectivity
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
          stderrLevels: ['error'] // Only errors should go to stderr to avoid causing NativeCommandErrors in PowerShell
        }),
        new winston.transports.File({ filename: 'logs/database.log' })
      ]
    });
  }

  /**
   * Connect to MongoDB database
   */
  async connect() {
    try {
      this.logger.info('Attempting to connect to MongoDB...');

      // Increase buffer timeout instead of disabling buffering
      mongoose.set('bufferTimeoutMS', 30000);

      // Try to connect with retry logic
      let retries = 3;
      let connected = false;
      let lastError = null;

      while (retries > 0 && !connected) {
        try {
          await mongoose.connect(this.connectionString, this.options);
          connected = true;
        } catch (err) {
          lastError = err;
          retries--;
          if (retries > 0) {
            this.logger.warn(`⚠️ Connection attempt failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          }
        }
      }

      if (!connected) {
        throw lastError;
      }

      this.logger.info('✅ MongoDB connected successfully');
      this.logger.info(`📊 Database: ${mongoose.connection.name}`);
      this.logger.info(`🌐 Host: ${mongoose.connection.host}`);
      this.logger.info(`🔌 Port: ${mongoose.connection.port}`);

      // Set up connection event listeners
      this.setupEventListeners();

      // Create indexes for all models
      await this.createIndexes();

      return true;
    } catch (error) {
      this.logger.error('❌ MongoDB connection failed:', error);
      this.logger.error(`Connection string (masked): mongodb+srv://***:***@${this.connectionString.split('@')[1]}`);
      
      // In development, don't throw error - allow server to start without DB
      if (process.env.NODE_ENV === 'production') {
        throw error;
      } else {
        this.logger.warn('⚠️ Continuing without MongoDB in development mode');
        this.logger.warn('⚠️ Please check:');
        this.logger.warn('   1. MongoDB Atlas cluster is running');
        this.logger.warn('   2. Your IP address is whitelisted in Atlas Network Access');
        this.logger.warn('   3. Database credentials are correct');
        this.logger.warn('   4. Internet connection is stable');
        return false;
      }
    }
  }

  /**
   * Setup MongoDB event listeners
   */
  setupEventListeners() {
    mongoose.connection.on('connected', () => {
      this.logger.info('📡 MongoDB connection established');
    });

    mongoose.connection.on('error', (error) => {
      this.logger.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      this.logger.warn('⚠️ MongoDB connection disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      this.logger.info('🔄 MongoDB connection reconnected');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await this.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await this.disconnect();
      process.exit(0);
    });
  }

  /**
   * Create database indexes for better performance
   */
  async createIndexes() {
    try {
      this.logger.info('Creating database indexes...');

      // Helper to create indexes for a collection with error handling
      const createCollectionIndexes = async (collectionName, specs) => {
        try {
          await mongoose.connection.db.collection(collectionName).createIndexes(specs);
          this.logger.info(`✅ Indexes created for collection: ${collectionName}`);
        } catch (error) {
          if (error.code === 85 || error.codeName === 'IndexOptionsConflict' || error.message.includes('already exists')) {
            // Index already exists, which is fine, we just log it as an info optimization
            this.logger.info(`ℹ️ Index optimization: ${collectionName} indexes are already up to date.`);
          } else {
            this.logger.error(`❌ Error creating indexes for ${collectionName}:`, error);
          }
        }
      };

      // User indexes
      await createCollectionIndexes('users', [
        { key: { email: 1 }, unique: true, background: true },
        { key: { role: 1 }, background: true },
        { key: { role: 1, department: 1 }, background: true }, // High-traffic optimization
        { key: { department: 1 }, background: true },
        { key: { programId: 1 }, background: true },
        { key: { isActive: 1 }, background: true },
        { key: { isEmailVerified: 1 }, background: true },
        { key: { createdAt: -1 }, background: true },
        { key: { lastLoginCountry: 1 }, background: true }, // High-traffic optimization
        { key: { studentId: 1 }, unique: true, sparse: true, background: true },
        { key: { employeeId: 1 }, unique: true, sparse: true, background: true }
      ]);

      // Department indexes
      await createCollectionIndexes('departments', [
        { key: { code: 1 }, unique: true, background: true },
        { key: { name: 1 }, background: true },
        { key: { isActive: 1 }, background: true }
      ]);

      // Program indexes
      await createCollectionIndexes('programs', [
        { key: { code: 1 }, unique: true, background: true },
        { key: { name: 1 }, background: true },
        { key: { department: 1 }, background: true },
        { key: { isActive: 1 }, background: true }
      ]);

      // Course indexes
      await createCollectionIndexes('courses', [
        { key: { code: 1 }, unique: true, background: true },
        { key: { name: 1 }, background: true },
        { key: { department: 1 }, background: true },
        { key: { program: 1 }, background: true },
        { key: { faculty: 1 }, background: true },
        { key: { semester: 1 }, background: true },
        { key: { isActive: 1 }, background: true }
      ]);

      // Assignment indexes
      await createCollectionIndexes('assignments', [
        { key: { course: 1 }, background: true },
        { key: { faculty: 1 }, background: true },
        { key: { dueDate: 1 }, background: true },
        { key: { isActive: 1 }, background: true },
        { key: { createdAt: -1 }, background: true }
      ]);

      // Submission indexes
      await createCollectionIndexes('submissions', [
        { key: { assignment: 1 }, background: true },
        { key: { student: 1 }, background: true },
        { key: { userId: 1, createdAt: -1 }, background: true }, // High-traffic optimization
        { key: { problemId: 1, status: 1 }, background: true }, // High-traffic optimization
        { key: { language: 1 }, background: true }, // High-traffic optimization
        { key: { submittedAt: -1 }, background: true },
        { key: { status: 1 }, background: true }
      ]);

      this.logger.info('🎉 Database index optimization process completed');
    } catch (error) {
      this.logger.error('❌ Critical error in global index creation process:', error);
      // We don't throw here to allow the server to still start even if indexing has issues
    }
  }

  /**
   * Disconnect from MongoDB database
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      this.logger.info('✅ MongoDB disconnected successfully');
      return true;
    } catch (error) {
      this.logger.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      state: states[mongoose.connection.readyState],
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      readyState: mongoose.connection.readyState
    };
  }
}

// Create singleton instance
const database = new DatabaseConnection();

// Legacy compatibility function
const connectDB = database.connect.bind(database);

// Export connection methods
module.exports = {
  connect: database.connect.bind(database),
  disconnect: database.disconnect.bind(database),
  getConnectionStatus: database.getConnectionStatus.bind(database),
  connectDB // Legacy compatibility
};
