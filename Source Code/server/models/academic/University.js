const mongoose = require('mongoose');

const universitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true }, // e.g., 'MIT'
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Ensure only one university document can exist (optional enforcement)
universitySchema.pre('save', async function (next) {
    const University = mongoose.model('University', universitySchema);
    const count = await University.countDocuments();
    if (count >= 1 && this.isNew) {
        return next(new Error('Only one University record is allowed'));
    }
    next();
});

universitySchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('University', universitySchema);
