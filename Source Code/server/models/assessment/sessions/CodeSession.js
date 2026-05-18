const mongoose = require('mongoose');

const codeSessionSchema = new mongoose.Schema({
    labId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentCode: {
        type: String,
        default: ''
    },
    currentLanguage: {
        type: String,
        default: 'javascript'
    },
    currentFileName: {
        type: String,
        default: 'main.js'
    },
    files: [{
        name: String,
        content: String,
        language: String
    }],
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
    createdAt: {
        type: Date,
        default: Date.now
    }
});

codeSessionSchema.index({ labId: 1, userId: 1 });

module.exports = mongoose.model('CodeSession', codeSessionSchema);
