const User = require('../../models/auth/User');
const UserPoints = require('../../models/learning/gamification/UserPoints');
const asyncHandler = require('../../errors/asyncHandler');

/**
 * Leaderboard & Ranking System Controller
 * Implements Phase 5 Item 17 (Global & Section-wise Leaderboards)
 */

// 1. Get Global Leaderboard
exports.getGlobalLeaderboard = asyncHandler(async (req, res) => {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const leaderboard = await UserPoints.find()
        .populate('userId', 'firstName lastName profilePicture department section studentId')
        .sort({ experiencePoints: -1, totalPoints: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean();

    const total = await UserPoints.countDocuments();

    res.json({
        success: true,
        page,
        total,
        data: leaderboard.map((lp, index) => ({
            rank: skip + index + 1,
            user: {
                name: `${lp.userId?.firstName} ${lp.userId?.lastName}`,
                profilePicture: lp.userId?.profilePicture,
                id: lp.userId?._id,
                studentId: lp.userId?.studentId
            },
            stats: {
                level: lp.level,
                xp: lp.experiencePoints,
                tier: lp.tier,
                problemsSolved: lp.pointsBreakdown?.problemsSolved || 0
            }
        }))
    });
});

// 2. Get Section-wise Leaderboard (Item 17)
exports.getSectionLeaderboard = asyncHandler(async (req, res) => {
    const { section, departmentId } = req.query;

    if (!section) {
        return res.status(400).json({ success: false, message: "Section filter is required" });
    }

    // Step 1: Find users in that section
    const userQuery = { section };
    if (departmentId) userQuery.department = departmentId;

    const usersInStore = await User.find(userQuery).select('_id');
    const userIds = usersInStore.map(u => u._id);

    // Step 2: Get their points
    const leaderboard = await UserPoints.find({ userId: { $in: userIds } })
        .populate('userId', 'firstName lastName profilePicture section')
        .sort({ experiencePoints: -1 })
        .lean();

    res.json({
        success: true,
        section,
        count: leaderboard.length,
        data: leaderboard.map((lp, index) => ({
            rank: index + 1,
            user: {
                name: `${lp.userId?.firstName} ${lp.userId?.lastName}`,
                profilePicture: lp.userId?.profilePicture
            },
            xp: lp.experiencePoints,
            level: lp.level
        }))
    });
});

// 3. Get User Rank Context (Where do I stand?)
exports.getMyRank = asyncHandler(async (req, res) => {
    const myPoints = await UserPoints.findOne({ userId: req.user.id });
    if (!myPoints) {
        return res.json({ success: true, rank: 'Unranked', xp: 0 });
    }

    const rank = await UserPoints.countDocuments({
        experiencePoints: { $gt: myPoints.experiencePoints }
    }) + 1;

    res.json({
        success: true,
        rank,
        xp: myPoints.experiencePoints,
        level: myPoints.level,
        tier: myPoints.tier
    });
});
