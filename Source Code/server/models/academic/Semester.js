const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
    academicYearId: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    semesterNumber: { type: Number, required: true }, // e.g., 1,2,...
    startDate: { type: Date },
    endDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Validation: semesterNumber must be <= totalSemesters of the linked program
semesterSchema.pre('save', async function (next) {
    try {
        const Program = mongoose.model('Program');
        const prog = await Program.findById(this.programId).select('duration');
        if (!prog) return next(new Error('Program not found'));
        const maxSemesters = prog.duration * 2; // Assuming 2 semesters per year
        if (this.semesterNumber > maxSemesters) {
            return next(new Error(`semesterNumber exceeds maximum semesters (${maxSemesters}) for the program`));
        }
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('Semester', semesterSchema);
