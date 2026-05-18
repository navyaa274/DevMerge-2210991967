const Program = require('../../models/academic/Program');

// Helper: resolve department field — frontend uses 'departmentId', schema uses 'department'
const resolveDept = (body) => {
    const dept = body.departmentId || body.department;
    const dur = body.durationYears || body.duration;
    return { ...body, department: dept, duration: dur };
};

/**
 * Create Program
 * @access Private/Admin/HOD
 */
exports.createProgram = async (req, res) => {
    try {
        const data = resolveDept(req.body);
        const { department, code } = data;

        if (!department) {
            return res.status(400).json({ success: false, message: 'departmentId is required' });
        }

        const existing = await Program.findOne({ department, code });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Program code already exists in this department"
            });
        }

        const program = await Program.create(data);
        const populated = await Program.findById(program._id).populate('department', 'name code');

        res.status(201).json({ success: true, data: populated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get All Programs
 * @access Private (Staff/Admin/HOD)
 */
exports.getAllPrograms = async (req, res) => {
    try {
        const filter = {};
        // HOD can only see their own department's programs
        if (req.user.role === 'hod' && req.user.department) {
            filter.department = req.user.department;
        }

        const programs = await Program.find(filter)
            .populate('department', 'name code');

        // Normalize response: add departmentId alias for frontend compatibility
        res.status(200).json({
            success: true,
            count: programs.length,
            data: programs.map(p => ({
                ...p.toObject(),
                departmentId: p.department
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Programs by Department
 * @access Private (Authorized Roles)
 */
exports.getProgramsByDepartment = async (req, res) => {
    try {
        const programs = await Program.find({ department: req.params.departmentId })
            .populate('department', 'name code');

        res.status(200).json({
            success: true,
            count: programs.length,
            data: programs.map(p => ({
                ...p.toObject(),
                departmentId: p.department
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Program
 * @access Private/Admin/HOD
 */
exports.updateProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (!program) {
            return res.status(404).json({ success: false, message: "Program not found" });
        }

        // Security Check: HOD can only update their own department's programs
        if (req.user.role === 'hod' && program.department.toString() !== req.user.department?.toString()) {
            return res.status(403).json({ success: false, message: "Department access restricted" });
        }

        const data = resolveDept(req.body);
        const { name, code, degreeType, duration, department, curriculum, isActive, totalSemesters, durationYears } = data;

        if (name !== undefined) program.name = name;
        if (code !== undefined) program.code = code;
        if (degreeType !== undefined) program.degreeType = degreeType;
        if (duration !== undefined) program.duration = duration;
        if (durationYears !== undefined) program.durationYears = durationYears;
        if (totalSemesters !== undefined) program.totalSemesters = totalSemesters;
        if (department !== undefined) program.department = department;
        if (isActive !== undefined) program.isActive = isActive;
        if (curriculum) {
            program.curriculum = { ...program.curriculum?.toObject(), ...curriculum };
        }

        program.updatedAt = new Date();
        await program.save();

        const populated = await Program.findById(program._id).populate('department', 'name code');

        res.status(200).json({
            success: true,
            data: { ...populated.toObject(), departmentId: populated.department }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete (Deactivate) Program
 * @access Private/Admin/HOD
 */
exports.deleteProgram = async (req, res) => {
    try {
        const program = await Program.findById(req.params.id);

        if (!program) {
            return res.status(404).json({ success: false, message: "Program not found" });
        }

        if (req.user.role === 'hod' && program.department.toString() !== req.user.department?.toString()) {
            return res.status(403).json({ success: false, message: "Department access restricted" });
        }

        program.isActive = false;
        program.updatedAt = new Date();
        await program.save();

        res.status(200).json({ success: true, message: "Program deactivated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
