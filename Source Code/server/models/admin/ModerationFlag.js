const mongoose = require('mongoose');

const moderationFlagSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    context: { type: String, required: true },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
    status: { type: String, enum: ['Pending', 'Resolved', 'Dismissed'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ModerationFlag', moderationFlagSchema);
