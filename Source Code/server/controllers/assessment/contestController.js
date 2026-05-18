const Contest = require('../../models/assessment/logic/Contest');
const Submission = require('../../models/assessment/problems/Submission');
const PointSystem = require('../../models/learning/gamification/UserPoints'); // For Phase 5 Item 16
const asyncHandler = require('../../errors/asyncHandler');

/**
 * Contest & Competition System Controller
 * Implements Item 14 (Proctoring) and Item 15 (Leaderboard Engine)
 */

// 1. Create a dynamic contest
exports.createContest = asyncHandler(async (req, res) => {
    const contest = await Contest.create({
        ...req.body,
        createdBy: req.user.id
    });
    res.status(201).json({ success: true, data: contest });
});

// 2. Register for a contest
exports.registerContest = asyncHandler(async (req, res) => {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    // 🛡️ Academic Jurisdictional Check (Phase 6 Item 47)
    if (contest.isInterDepartmental && contest.departments && contest.departments.length > 0) {
        const userDept = req.user.department?.toString();
        const isAllowed = contest.departments.some(d => d.toString() === userDept);

        if (!isAllowed) {
            return res.status(403).json({
                success: false,
                message: 'Your department is not authorized for this specific competition.'
            });
        }
    }

    const isRegistered = contest.participants.some(p => p.userId.toString() === req.user.id);
    if (isRegistered) return res.json({ success: true, message: 'Already registered' });

    contest.participants.push({ userId: req.user.id });
    await contest.save();

    res.json({ success: true, message: 'Registered successfully' });
});

// 3. Start Proctored Session
exports.startSession = asyncHandler(async (req, res) => {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    const now = new Date();
    if (now < contest.startTime) return res.status(400).json({ success: false, message: 'Contest not yet started' });
    if (now > contest.endTime) return res.status(400).json({ success: false, message: 'Contest already ended' });

    // In production, generate a secure JWT or session token for proctoring
    res.json({
        success: true,
        sessionToken: `CTX_${contest._id}_${req.user.id}_${Date.now()}`,
        settings: contest.settings, // Send proctoring settings (Item 14)
        problems: contest.problems
    });
});

/**
 * 4. Contest Leaderboard Rule Engine (Phase 5 Item 15)
 * Calculates ACM/IOI style standings on the fly
 */
exports.getLeaderboard = asyncHandler(async (req, res) => {
    const contest = await Contest.findById(req.params.id).populate('problems.problemId');
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    // Fetch all submissions for this contest
    const submissions = await Submission.find({ contest: contest._id, status: { $ne: 'Pending' } })
        .populate('student', 'name email profilePicture')
        .sort({ submittedAt: 1 });

    const standings = {};

    submissions.forEach(sub => {
        const studentId = sub.student._id.toString();
        if (!standings[studentId]) {
            standings[studentId] = {
                username: sub.student.name,
                userId: studentId,
                totalPoints: 0,
                solvedCount: 0,
                penalty: 0,
                problems: {} // Problem stats
            };
        }

        const probId = sub.problem.toString();
        if (!standings[studentId].problems[probId]) {
            standings[studentId].problems[probId] = { solved: false, attempts: 0, time: 0 };
        }

        const probStats = standings[studentId].problems[probId];
        if (probStats.solved) return; // Ignore submissions after AC

        probStats.attempts++;
        if (sub.status === 'Accepted') {
            probStats.solved = true;
            probStats.time = Math.floor((new Date(sub.submittedAt) - new Date(contest.startTime)) / 60000);

            standings[studentId].solvedCount++;

            // Rules Engine: ACM Style (Penalty for wrong submissions before AC)
            if (contest.scoringType === 'ACM') {
                const wrongAttempts = probStats.attempts - 1;
                const currentPenalty = probStats.time + (wrongAttempts * contest.penaltyPerWrongSubmission);
                standings[studentId].penalty += currentPenalty;
            } else {
                // IOI/Points style
                standings[studentId].totalPoints += 100; // Simplified
            }
        }
    });

    // Format & Render Final Rank
    const rankedStandings = Object.values(standings).sort((a, b) => {
        if (contest.scoringType === 'ACM') {
            if (b.solvedCount !== a.solvedCount) return b.solvedCount - a.solvedCount;
            return a.penalty - b.penalty;
        }
        return b.totalPoints - a.totalPoints;
    });

    res.json({
        success: true,
        contestId: contest._id,
        scoringType: contest.scoringType,
        standings: rankedStandings
    });
});

// 5. Reward System (Phase 5 Item 16/18)
exports.awardRewards = asyncHandler(async (req, res) => {
    // Only admins can trigger final reward awarding
    // This adds XP to user profiles and awards badges
});
