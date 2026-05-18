const University = require('../../models/academic/University');

/**
 * Create University (Singleton)
 * @access Private/SuperAdmin
 */
exports.createUniversity = async (req, res) => {
    try {
        const existing = await University.findOne();
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "University already exists. System only supports single-university deployment."
            });
        }

        const university = await University.create(req.body);

        res.status(201).json({
            success: true,
            data: university
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get University Details
 * @access Private (All Staff/Admin)
 */
exports.getUniversity = async (req, res) => {
    try {
        const university = await University.findOne();
        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University record not found"
            });
        }

        res.status(200).json({
            success: true,
            data: university
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update University
 * @access Private/SuperAdmin
 */
exports.updateUniversity = async (req, res) => {
    try {
        const university = await University.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!university) {
            return res.status(404).json({
                success: false,
                message: "University not found"
            });
        }

        res.status(200).json({
            success: true,
            data: university
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
