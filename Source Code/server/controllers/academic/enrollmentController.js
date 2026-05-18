const Enrollment = require('../../models/learning/enrollments/Enrollment');
const Section = require('../../models/academic/Section');
const Semester = require('../../models/academic/Semester');
const User = require('../../models/auth/User');
const mongoose = require('mongoose');

/**
 * Create Enrollment (Student into Section)
 * @access Private/Admin
 */
exports.createEnrollment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { studentId, sectionId, semesterId } = req.body;

        // Rule 4: Semester Must Match Program
        const [student, semester] = await Promise.all([
            User.findById(studentId).select('programId'),
            Semester.findById(semesterId).select('programId')
        ]);

        if (!student || !semester) {
            return res.status(404).json({ success: false, message: "Student or Semester not found" });
        }

        if (student.programId?.toString() !== semester.programId?.toString()) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Academic Integrity Violation: Student program mismatch with semester program"
            });
        }

        // Rule 2: Student Cannot Enroll Twice (Index already exists, but checking here too)
        const existing = await Enrollment.findOne({ studentId, semesterId }).session(session);
        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Student is already enrolled in a section for this semester"
            });
        }

        // Rule 3: Section Capacity Hard Lock (Atomic)
        const section = await Section.findOneAndUpdate(
            {
                _id: sectionId,
                semesterId: semesterId, // Safety check
                $expr: { $lt: ["$enrolledCount", "$capacity"] }
            },
            { $inc: { enrolledCount: 1 } },
            { new: true, session }
        );

        if (!section) {
            // Check if it's capacity or missing section
            const checkSection = await Section.findById(sectionId);
            if (!checkSection) {
                await session.abortTransaction();
                session.endSession();
                return res.status(404).json({ success: false, message: "Section not found" });
            }

            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: "Section capacity reached or semester mismatch for section"
            });
        }

        const enrollment = new Enrollment(req.body);
        await enrollment.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            data: enrollment
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Enrollments by Section
 * @access Private
 */
exports.getEnrollmentsBySection = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ sectionId: req.params.sectionId })
            .populate('studentId', 'name email');

        res.status(200).json({
            success: true,
            count: enrollments.length,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Enrollments for a Student
 * @access Private
 */
exports.getStudentEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.params.studentId })
            .populate({
                path: 'sectionId',
                select: 'name',
                populate: { path: 'semesterId', select: 'semesterNumber academicYearId' }
            });

        res.status(200).json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
