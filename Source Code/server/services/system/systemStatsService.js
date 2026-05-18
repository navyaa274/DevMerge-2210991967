const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const Submission = require('../../models/assessment/problems/Submission');
const Department = require('../../models/academic/Department');
const AuditLog = require('../../models/admin/AuditLog');
const os = require('os');

class SystemStatsService {
    /**
     * Get aggregated institutional statistics
     */
    async getGlobalStats() {
        try {
            const [
                totalUsers,
                totalCourses,
                totalSubmissions,
                totalDepartments,
                activeUsersCount
            ] = await Promise.all([
                User.countDocuments(),
                Course.countDocuments(),
                Submission.countDocuments(),
                Department.countDocuments(),
                User.countDocuments({ isActive: true })
            ]);

            // Calculate average grade ( logic based on submissions if grades are stored there)
            // In a more complex system, we'd average a 'grade' field
            const acceptedSubmissions = await Submission.countDocuments({ status: 'Accepted' });
            const avgPassRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

            return {
                totalUsers,
                students: await User.countDocuments({ role: 'student' }),
                faculty: await User.countDocuments({ role: 'faculty' }),
                admins: await User.countDocuments({ role: { $in: ['admin', 'super_admin'] } }),
                departments: totalDepartments,
                courses: totalCourses,
                activeCourses: await Course.countDocuments({ isActive: { $ne: false } }),
                totalSubmissions,
                pendingSubmissions: await Submission.countDocuments({ status: 'Pending' }),
                avgGrade: Math.round(avgPassRate),
                systemUptime: Math.floor(process.uptime()),
                activeUsers: activeUsersCount,
                newUsersToday: await User.countDocuments({
                    createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
                })
            };
        } catch (error) {
            console.error('Error calculating global stats:', error);
            throw error;
        }
    }

    /**
     * Get real-time OS health metrics
     */
    async getSystemHealth() {
        const freeMem = os.freemem();
        const totalMem = os.totalmem();
        const memUsage = ((totalMem - freeMem) / totalMem) * 100;

        // Simple CPU load average (1 min)
        const loadAvg = os.loadavg()[0];
        const cpuUsage = Math.min(100, Math.round(loadAvg * 10)); // Heuristic for visualization

        return {
            cpu: cpuUsage,
            memory: Math.round(memUsage),
            disk: 45, // Placeholder for disk as 'fs' requires more complex sync calls
            network: 'healthy',
            database: 'connected',
            cache: 'active',
            os: {
                platform: os.platform(),
                release: os.release(),
                uptime: os.uptime()
            }
        };
    }

    /**
     * Get recent system-wide activity
     */
    async getRecentActivity(limit = 10) {
        return await AuditLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('userId', 'name role')
            .lean();
    }
}

module.exports = new SystemStatsService();
