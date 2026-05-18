const User = require('../models/auth/User');
const Submission = require('../models/assessment/problems/Submission');

/**
 * Ensures critical high-volume database collections have proper indexes
 * for 10,000+ concurrent student environments.
 */
const optimizeIndexes = async () => {
    try {
        // Identity Layer Optimizations
        await User.collection.createIndex({ email: 1 });
        await User.collection.createIndex({ role: 1, department: 1 });
        await User.collection.createIndex({ lastLoginCountry: 1 });

        // Assessment Layer Optimizations (High Frequency)
        await Submission.collection.createIndex({ userId: 1, createdAt: -1 });
        await Submission.collection.createIndex({ problemId: 1, status: 1 });
        await Submission.collection.createIndex({ language: 1 });

        console.log('✅ Performance Optimization: High-traffic database indexes configured.');
    } catch (error) {
        console.error('❌ Index optimization error:', error.message);
    }
};

module.exports = { optimizeIndexes };
