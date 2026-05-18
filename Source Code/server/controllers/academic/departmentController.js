const Department = require('../../models/academic/Department');

/**
 * Create Department
 * @access Private/Admin
 */
exports.createDepartment = async (req, res) => {
    try {
        const { universityId, code } = req.body;

        // Check if department code already exists in this university
        const existing = await Department.findOne({ universityId, code });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Department code already exists in this university"
            });
        }

        const department = await Department.create(req.body);

        res.status(201).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get All Departments
 * @access Private (Staff/Admin)
 */
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('hodId', 'firstName lastName email')
            .populate('universityId', 'name code');

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments.map(d => ({
                ...d.toObject(),
                hodName: d.hodId
                    ? `${d.hodId.firstName || ''} ${d.hodId.lastName || ''}`.trim()
                    : null
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Single Department
 * @access Private (Authorized Roles)
 */
exports.getDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('hodId', 'firstName lastName email')
            .populate('universityId', 'name code');

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                ...department.toObject(),
                hodName: department.hodId
                    ? `${department.hodId.firstName || ''} ${department.hodId.lastName || ''}`.trim()
                    : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Department
 * @access Private/Admin
 */
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Department (Soft delete or implementation dependent - here we just delete)
 * @access Private/Admin
 */
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Department removed successfully"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
