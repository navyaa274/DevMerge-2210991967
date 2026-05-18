const mongoose = require('mongoose');

class StartupGuard {
  constructor() {
    this.recommendations = [];
    this.errors = [];
  }

  async runChecks() {
    console.log('🛡️ Running Startup Guard checks...');

    // 1. Required Environment Variables
    const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        this.errors.push(`Required environment variable ${varName} is missing`);
        this.recommendations.push(`Set ${varName} in your .env file`);
      }
    }

    // 2. Database Connectivity Check
    if (process.env.MONGODB_URI) {
      try {
        const conn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
        await conn.close();
        console.log('✅ MongoDB connectivity check passed');
      } catch (error) {
        console.warn(`⚠️ MongoDB connectivity check failed: ${error.message}`);
        this.recommendations.push('Ensure MongoDB is running and MONGODB_URI is correct, or use in-memory mode for development');
        // Don't treat as critical error in development
        if (process.env.NODE_ENV === 'production') {
          this.errors.push(`MongoDB connectivity required in production: ${error.message}`);
        }
      }
    } else {
      console.log('ℹ️ MongoDB not configured');
    }

    // 3. Redis Connectivity Check (non-critical)
    if (process.env.REDIS_URL) {
      try {
        const redis = require('redis');
        const client = redis.createClient({ url: process.env.REDIS_URL });
        await client.connect();
        await client.ping();
        await client.quit();
        console.log('✅ Redis connectivity check passed');
      } catch (error) {
        console.warn(`⚠️ Redis connectivity check failed: ${error.message} (non-critical)`);
        this.recommendations.push('Ensure Redis is running if caching is needed');
      }
    } else {
      console.log('ℹ️ Redis not configured (optional)');
    }

    // 4. Directory Existence Checks
    const fs = require('fs');
    const path = require('path');
    const uploadPath = process.env.UPLOAD_PATH || './uploads';

    if (!fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log(`✅ Created upload directory: ${uploadPath}`);
      } catch (err) {
        this.errors.push(`Upload directory missing and could not be created: ${uploadPath}`);
        this.recommendations.push(`Manually create the upload directory: ${path.resolve(uploadPath)}`);
      }
    }

    return this.errors.length === 0;
  }

  getRecommendations() {
    return this.recommendations;
  }
}

const createStartupGuard = () => {
  return new StartupGuard();
};

module.exports = { createStartupGuard };
