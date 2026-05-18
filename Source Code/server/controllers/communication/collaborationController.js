const Submission = require('../../models/assessment/problems/Submission');
const Team = require('../../models/communication/Team');
const asyncHandler = require('../../errors/asyncHandler');

/**
 * Peer Learning & Study Group Controller
 * Implements Item 26 (Peer Learning) and Item 28 (Study Groups)
 */

// 1. Share Submission (Peer Learning - Item 26)
exports.shareSubmission = asyncHandler(async (req, res) => {
    const { submissionId, isPublic } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    if (submission.student.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to share this submission' });
    }

    if (submission.status !== 'Accepted') {
        return res.status(400).json({ success: false, message: 'Only accepted solutions can be shared' });
    }

    submission.isPublic = isPublic;
    await submission.save();

    res.json({ success: true, message: `Solution is now ${isPublic ? 'Public' : 'Private'}`, data: submission });
});

// 2. Get Public Submissions (Global Library - Item 26)
exports.getPublicLibrary = asyncHandler(async (req, res) => {
    const { problemId, language } = req.query;
    const query = { isPublic: true };
    if (problemId) query.problem = problemId;
    if (language) query.language = language;

    const solutions = await Submission.find(query)
        .populate('student', 'firstName lastName profilePicture')
        .populate('problem', 'title difficulty')
        .sort({ 'likes.length': -1, submittedAt: -1 })
        .limit(20)
        .lean();

    res.json({ success: true, count: solutions.length, data: solutions });
});

// 3. Create Study Group (Peer-to-Peer Help - Item 28)
exports.createStudyGroup = asyncHandler(async (req, res) => {
    const { name, description, isPublic } = req.body;

    const group = await Team.create({
        name,
        description,
        isPublic: isPublic !== undefined ? isPublic : true,
        isStudyGroup: true,
        leaderId: req.user.id,
        members: [{ userId: req.user.id, role: 'leader' }]
    });

    res.status(201).json({ success: true, data: group });
});

// 4. Join Group/Study Circle
exports.joinGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    const group = await Team.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.some(m => m.userId.toString() === req.user.id);
    if (isMember) return res.status(400).json({ success: false, message: 'Already a member' });

    group.members.push({ userId: req.user.id, role: 'member' });
    await group.save();

    res.json({ success: true, message: 'Joined successfully', data: group });
});
