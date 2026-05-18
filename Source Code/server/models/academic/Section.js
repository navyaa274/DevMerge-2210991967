const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., 'A', 'B'
    semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    capacity: { type: Number, default: 60 },
    enrolledCount: { type: Number, default: 0 },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Compound unique index for section name within a semester
sectionSchema.index({ semesterId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
