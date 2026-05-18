const Semester = require('../../models/academic/Semester');
const Program = require('../../models/academic/Program');
const AcademicYear = require('../../models/academic/AcademicYear');
/**
 * Create Semester
 * @access Private/Admin
 */
exports.createSemester = async (req, res) => {
    try {
        const { programId, academicYearId, semesterNumber } = req.body;

        // Check if semester already exists for this program and academic year
        const existing = await Semester.findOne({ programId, academicYearId, semesterNumber });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Semester already exists for this program and year"
            });
        }

        const semester = await Semester.create(req.body);

        res.status(201).json({
            success: true,
            data: semester
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Semesters by Program
 * @access Private
 */
exports.getSemestersByProgram = async (req, res) => {
    try {
        const semesters = await Semester.find({ programId: req.params.programId })
            .populate('academicYearId', 'year isActive')
            .sort({ semesterNumber: 1 });

        res.status(200).json({
            success: true,
            count: semesters.length,
            data: semesters
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Current Semesters (for active academic year)
 * @access Private
 */
exports.getCurrentSemesters = async (req, res) => {
    try {
        const activeYear = await AcademicYear.findOne({ isActive: true });

        let semesters;
        if (activeYear) {
            semesters = await Semester.find({ academicYearId: activeYear._id })
                .populate('programId', 'name code')
                .sort({ semesterNumber: 1 });
        } else {
            // Fallback: return most recent semesters across all years
            semesters = await Semester.find()
                .populate('programId', 'name code')
                .populate('academicYearId', 'year isActive')
                .sort({ createdAt: -1 })
                .limit(20);
        }

        res.status(200).json({
            success: true,
            count: semesters.length,
            activeYearId: activeYear?._id || null,
            data: semesters
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
