const mongoose = require('mongoose');

const academicYearSchema = new mongoose.Schema({
    year: { type: String, required: true }, // e.g., '2025-2026'
    isActive: { type: Boolean, default: false }
});

// Ensure only one active academic year at a time
academicYearSchema.pre('save', async function (next) {
    if (this.isActive) {
        // Deactivate any other active year
        await this.constructor.updateMany({ _id: { $ne: this._id }, isActive: true }, { isActive: false });
    }
    next();
});

module.exports = mongoose.model('AcademicYear', academicYearSchema);
