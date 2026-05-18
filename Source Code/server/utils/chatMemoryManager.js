const ChatSession = require('../models/communication/ChatSession');

/**
 * Chat Memory Manager
 * Handles history retrieval and message persistence
 */

exports.getOrCreateSession = async (studentId, courseId, sessionId) => {
    if (sessionId) {
        return await ChatSession.findOne({ _id: sessionId, student: studentId });
    }

    // Create fresh session if none provided
    return await ChatSession.create({
        student: studentId,
        course: courseId,
        isActive: true,
        messages: []
    });
};

exports.addMessageToSession = async (session, role, content) => {
    session.messages.push({ role, content });
    session.messageCount = session.messages.length;
    await session.save();
};

exports.getRecentHistory = async (session, limit = 6) => {
    // Return last X messages to maintain continuity without bloating prompt
    const history = session.messages.slice(-limit).map(m => ({
        role: m.role,
        content: m.content
    }));

    return history;
};
