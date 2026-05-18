const Course = require('../../models/academic/Course');
const User = require('../../models/auth/User');

/**
 * Create Course
 * @access Private/Admin
 */
exports.createCourse = async (req, res) => {
    try {
        const { department, facultyIds, programId, semesterNumber, credits } = req.body;

        // Rule 5: Faculty Must Belong to Department
        if (facultyIds && facultyIds.length > 0) {
            const faculties = await User.find({ _id: { $in: facultyIds } }).select('department');
            const mismatch = faculties.some(f => f.department?.toString() !== department?.toString());
            if (mismatch) {
                return res.status(400).json({
                    success: false,
                    message: "One or more faculty members do not belong to the target department"
                });
            }
        }

        const course = await Course.create(req.body);

        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get All Courses
 * @access Private
 */
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('department', 'name code')
            .populate('facultyIds', 'firstName lastName email')
            .populate('programId', 'name code');

        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses.map(c => ({
                ...c.toObject(),
                facultyNames: (c.facultyIds || []).map(f =>
                    `${f.firstName || ''} ${f.lastName || ''}`.trim()
                )
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Course By ID
 * @access Private
 */
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('department', 'name code')
            .populate('facultyIds', 'firstName lastName email')
            .populate('programId', 'name code');

        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        res.status(200).json({
            success: true,
            data: {
                ...course.toObject(),
                facultyNames: (course.facultyIds || []).map(f =>
                    `${f.firstName || ''} ${f.lastName || ''}`.trim()
                )
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Course
 * @access Private/Admin
 */
exports.updateCourse = async (req, res) => {
    try {
        const { department, facultyIds } = req.body;

        // Rule 5 Check if faculty provided
        if (facultyIds || department) {
            // Need currents if not provided in body
            const currentCourse = await Course.findById(req.params.id);
            if (!currentCourse) return res.status(404).json({ success: false, message: "Course not found" });

            const targetDept = department || currentCourse.department;
            const targetFaculties = facultyIds || currentCourse.facultyIds;

            if (targetFaculties && targetFaculties.length > 0) {
                const faculties = await User.find({ _id: { $in: targetFaculties } }).select('department');
                const mismatch = faculties.some(f => f.department?.toString() !== targetDept?.toString());
                if (mismatch) {
                    return res.status(400).json({
                        success: false,
                        message: "Faculty department mismatch"
                    });
                }
            }
        }

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Course
 * @access Private/Admin
 */
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
