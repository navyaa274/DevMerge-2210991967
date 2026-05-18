const UserPoints = require('../../models/learning/gamification/UserPoints');
const Streak = require('../../models/learning/gamification/Streak');

/**
 * Gamification Service
 * Handles the logic for awarding XP, managing streaks, and leveling up students.
 */
class GamificationService {
    /**
     * Award XP to a user and update their streak
     */
    async awardXP(userId, points, activityType = 'problem') {
        // 1. Update Points
        let userPoints = await UserPoints.findOne({ userId });
        if (!userPoints) {
            userPoints = new UserPoints({ userId });
        }

        userPoints.experiencePoints += points;
        userPoints.totalPoints += points;

        if (activityType === 'problem') userPoints.pointsBreakdown.problemsSolved += 1;

        const leveledUp = userPoints.updateLevel();
        await userPoints.save();

        // 2. Update Streak
        let streak = await Streak.findOne({ user: userId });
        if (!streak) {
            streak = new Streak({ user: userId });
        }

        streak.recordActivity(points);
        await streak.save();

        return {
            points: points,
            totalPoints: userPoints.totalPoints,
            currentStreak: streak.currentStreak,
            leveledUp
        };
    }
}

module.exports = new GamificationService();
