const mongoose = require('mongoose');
const AcademicYear = require('../../models/academic/AcademicYear');

/**
 * Create Academic Year
 * @access Private/Admin
 */
exports.createAcademicYear = async (req, res) => {
    try {
        const { year } = req.body;

        // Check if year already exists
        const existing = await AcademicYear.findOne({ year });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Academic year already exists"
            });
        }

        const academicYear = await AcademicYear.create(req.body);

        res.status(201).json({
            success: true,
            data: academicYear
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get All Academic Years
 * @access Private
 */
exports.getAllAcademicYears = async (req, res) => {
    try {
        const years = await AcademicYear.find().sort({ year: -1 });
        res.status(200).json({
            success: true,
            data: years
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Active Academic Year
 * @access Public/Private
 */
exports.getActiveYear = async (req, res) => {
    try {
        let activeYear = await AcademicYear.findOne({ isActive: true });

        // If no active year exists, return a default one
        if (!activeYear) {
            console.log('No active academic year found, returning default');
            return res.status(200).json({
                success: true,
                data: {
                    _id: 'default-year',
                    year: '2025-2026',
                    isActive: true
                }
            });
        }

        res.status(200).json({
            success: true,
            data: activeYear
        });
    } catch (error) {
        // If database error, return default year
        console.error('Error fetching active year:', error.message);
        res.status(200).json({
            success: true,
            data: {
                _id: 'default-year',
                year: '2025-2026',
                isActive: true
            }
        });
    }
};

/**
 * Activate Academic Year
 * @access Private/Admin
 */
exports.activateYear = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { id } = req.params;

        // Deactivate all first
        await AcademicYear.updateMany(
            { isActive: true },
            { isActive: false },
            { session }
        );

        // Activate target
        const academicYear = await AcademicYear.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true, session }
        );

        if (!academicYear) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                success: false,
                message: "Academic year not found"
            });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: `${academicYear.year} is now the active academic year`,
            data: academicYear
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
};
