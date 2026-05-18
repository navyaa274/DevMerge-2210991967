const mongoose = require('mongoose');

const editorSessionSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        default: 'Anonymous'
    },
    files: [{
        name: {
            type: String,
            required: true
        },
        content: {
            type: String,
            default: ''
        },
        language: {
            type: String,
            default: 'javascript'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    currentFile: {
        type: String,
        default: 'main.js'
    },
    currentLanguage: {
        type: String,
        default: 'javascript'
    },
    executions: [{
        code: String,
        language: String,
        output: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    lastSaved: {
        type: Date,
        default: Date.now
    },
    lastExecuted: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient queries
editorSessionSchema.index({ roomId: 1, userId: 1 });
editorSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL

module.exports = mongoose.model('EditorSession', editorSessionSchema);
