const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate, authorize } = require('../../middleware/auth');
const ExecutionLog = require('../../models/analytics/ExecutionLog');
const User = require('../../models/auth/User');
const Problem = require('../../models/assessment/problems/Problem');

/**
 * @route   GET /api/analytics/telemetry/cognitive
 * @desc    Fetch real-time cognitive visualizer telemetry for active students
 * @access  Protected (Faculty/HOD)
 */
router.get('/cognitive', authenticate, authorize(['faculty', 'admin']), async (req, res) => {
    try {
        // In a real system, you might filter by course. Here we grab the last 24 hours of execution logs.
        const yesterday = new Date();
        yesterday.setHours(yesterday.getHours() - 24);

        const recentLogs = await ExecutionLog.aggregate([
            { $match: { createdAt: { $gte: yesterday } } },
            {
                $group: {
                    _id: "$userId",
                    totalCompilations: { $sum: 1 },
                    errors: {
                        $sum: {
                            $cond: [{ $in: ["$status", ["Compilation Error", "Runtime Error", "Wrong Answer"]] }, 1, 0]
                        }
                    },
                    lastError: {
                        $last: {
                            $cond: [{ $in: ["$status", ["Compilation Error", "Runtime Error", "Wrong Answer"]] }, "$status", null]
                        }
                    },
                    lastProblemWorkedOn: { $last: "$problemId" },
                    firstInteraction: { $min: "$createdAt" },
                    lastInteraction: { $max: "$createdAt" }
                }
            }
        ]);

        // If no data exists, we can inject some realistic simulated telemetry so the matrix isn't empty on a fresh install
        if (recentLogs.length === 0) {
            return res.json({
                success: true,
                liveData: false,
                data: [
                    { student: 'Alex Mercer', topic: 'Dynamic Programming', status: 'critical', errors: 42, lastError: 'Recursion Depth Exceeded', timeSpent: '4h 12m' },
                    { student: 'Sarah Connor', topic: 'Binary Trees', status: 'warning', errors: 15, lastError: 'NullReference Exception', timeSpent: '2h 45m' },
                    { student: 'John Smith', topic: 'Graph Traversal', status: 'stable', errors: 2, lastError: 'Syntax Error', timeSpent: '45m' },
                    { student: 'Emily Chen', topic: 'Sorting Algorithms', status: 'warning', errors: 28, lastError: 'Maximum Call Stack', timeSpent: '3h 10m' }
                ],
                aggregates: {
                    totalProcessingHrs: 842,
                    criticalStudents: 14,
                    conceptsMastered: 1240,
                    avgErrorsPerLab: 3.2
                }
            });
        }

        const populatedTelemetry = [];
        let totalTimeSpentMs = 0;
        let criticalCount = 0;
        let totalCompilationsAll = 0;

        for (const log of recentLogs) {
            if (!log._id) continue;

            const user = await User.findById(log._id).select('name');
            const problem = log.lastProblemWorkedOn ? await Problem.findById(log.lastProblemWorkedOn).select('topics title') : null;

            const timeDiffMs = log.lastInteraction - log.firstInteraction;
            totalTimeSpentMs += timeDiffMs;
            totalCompilationsAll += log.totalCompilations;

            const hours = Math.floor(timeDiffMs / (1000 * 60 * 60));
            const mins = Math.floor((timeDiffMs % (1000 * 60 * 60)) / (1000 * 60));

            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

            // Calculate cognitive friction status
            let status = 'stable';
            if (log.errors > 20) { status = 'critical'; criticalCount++; }
            else if (log.errors > 10) { status = 'warning'; }

            populatedTelemetry.push({
                studentId: log._id,
                student: user ? user.name : 'Unknown Node',
                topic: problem && problem.topics && problem.topics.length > 0 ? problem.topics[0] : (problem ? problem.title : 'General Syntax'),
                status,
                errors: log.errors,
                lastError: log.lastError || 'None Phase',
                timeSpent: timeStr || 'Just Started'
            });
        }

        res.json({
            success: true,
            liveData: true,
            data: populatedTelemetry,
            aggregates: {
                totalProcessingHrs: Math.floor(totalTimeSpentMs / (1000 * 60 * 60)),
                criticalStudents: criticalCount,
                conceptsMastered: Math.floor(totalCompilationsAll / 10), // arbitrary metric extrapolation
                avgErrorsPerLab: (totalCompilationsAll / populatedTelemetry.length || 0).toFixed(1)
            }
        });

    } catch (error) {
        console.error("Telemetry Extractor Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
