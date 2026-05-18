const Section = require('../../models/academic/Section');

/**
 * Create Section
 * @access Private/Admin
 */
exports.createSection = async (req, res) => {
    try {
        const { semesterId, name } = req.body;

        const existing = await Section.findOne({ semesterId, name });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Section name already exists in this semester"
            });
        }

        const section = await Section.create(req.body);

        res.status(201).json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Sections by Semester
 * @access Private
 */
exports.getSectionsBySemester = async (req, res) => {
    try {
        const sections = await Section.find({ semesterId: req.params.semesterId })
            .populate('classTeacherId', 'firstName lastName email')
            .populate('students', 'firstName lastName studentId');

        res.status(200).json({
            success: true,
            count: sections.length,
            data: sections.map(s => ({
                ...s.toObject(),
                classTeacherName: s.classTeacherId
                    ? `${s.classTeacherId.firstName || ''} ${s.classTeacherId.lastName || ''}`.trim()
                    : null
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Section
 * @access Private/Admin
 */
exports.updateSection = async (req, res) => {
    try {
        const section = await Section.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
        res.status(200).json({ success: true, data: section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Section
 * @access Private/Admin
 */
exports.deleteSection = async (req, res) => {
    try {
        const section = await Section.findByIdAndDelete(req.params.id);
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
        res.status(200).json({ success: true, message: 'Section removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Assign Faculty to Section
 * @access Private/HOD/Admin
 */
exports.assignFaculty = async (req, res) => {
    try {
        const { facultyId } = req.body;
        const section = await Section.findByIdAndUpdate(
            req.params.id,
            { classTeacherId: facultyId },
            { new: true }
        ).populate('classTeacherId', 'name email');
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
        res.status(200).json({ success: true, data: section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Enroll Student to Section
 * @access Private/HOD/Admin
 */
exports.enrollStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const section = await Section.findById(req.params.id);
        if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

        if (!section.students) section.students = [];

        // Check if already enrolled
        if (section.students.map(String).includes(String(studentId))) {
            return res.status(400).json({ success: false, message: 'Student is already enrolled in this section' });
        }

        // Check capacity
        if (section.enrolledCount >= section.capacity) {
            return res.status(400).json({ success: false, message: `Section is at full capacity (${section.capacity})` });
        }

        section.students.push(studentId);
        section.enrolledCount = section.students.length;
        await section.save();

        res.status(200).json({ success: true, data: section });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get All Sections
 */
exports.getAllSections = async (req, res) => {
    try {
        const sections = await Section.find()
            .populate('classTeacherId', 'firstName lastName email')
            .populate('students', 'firstName lastName studentId');

        res.status(200).json({
            success: true,
            count: sections.length,
            data: sections.map(s => ({
                ...s.toObject(),
                classTeacherName: s.classTeacherId
                    ? `${s.classTeacherId.firstName || ''} ${s.classTeacherId.lastName || ''}`.trim()
                    : null
            }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Advanced Rule-Based Student Enrollment Engine
 * Supports: Capacity constraints, multi-criteria sorting, and dry-run preview
 */
exports.autoAssignStudents = async (req, res) => {
    try {
        const { semesterId } = req.params;
        const {
            sortBy = 'studentId',
            dryRun = false,
            clearExisting = true,
            assignmentRule = 'capacity_balanced' // 'strict_roll' or 'capacity_balanced'
        } = req.body;

        const Semester = require('../../models/academic/Semester');
        const User = require('../../models/auth/User');

        const semester = await Semester.findById(semesterId);
        if (!semester) return res.status(404).json({ success: false, message: 'Semester not found' });

        const sections = await Section.find({ semesterId }).sort('name');
        if (sections.length === 0) return res.status(400).json({ success: false, message: 'No sections configured' });

        // Calculate total capacity
        const totalCapacity = sections.reduce((sum, s) => sum + (s.capacity || 60), 0);

        const students = await User.find({
            role: 'student',
            programId: semester.programId,
            semester: semester.semesterNumber,
            isActive: true
        }).sort(sortBy === 'merit' ? { gpa: -1 } : { studentId: 1 });

        if (students.length > totalCapacity) {
            return res.status(400).json({
                success: false,
                message: `Insufficient capacity. Need ${students.length} slots, only ${totalCapacity} available.`
            });
        }

        const allocations = sections.map(s => ({
            sectionId: s._id,
            name: s.name,
            capacity: s.capacity || 60,
            assignedStudents: []
        }));

        let currentSectionIdx = 0;
        const resultMapping = [];

        // Allocation Logic
        for (const student of students) {
            let assigned = false;
            let attempts = 0;

            while (!assigned && attempts < allocations.length) {
                const target = allocations[currentSectionIdx];
                if (target.assignedStudents.length < target.capacity) {
                    target.assignedStudents.push(student._id);
                    resultMapping.push({
                        studentId: student.studentId,
                        name: student.name,
                        section: target.name
                    });
                    assigned = true;
                }

                // Move to next section anyway to balance
                currentSectionIdx = (currentSectionIdx + 1) % allocations.length;
                attempts++;
            }
        }

        if (dryRun) {
            return res.status(200).json({
                success: true,
                isDryRun: true,
                message: "Dry run completed. No changes saved.",
                allocations: allocations.map(a => ({ name: a.name, count: a.assignedStudents.length, capacity: a.capacity })),
                preview: resultMapping.slice(0, 10) // Show first 10 for preview
            });
        }

        // Apply Changes
        const bulkUserOps = [];
        const sectionUpdates = [];

        for (const alloc of allocations) {
            sectionUpdates.push(Section.findByIdAndUpdate(alloc.sectionId, {
                students: alloc.assignedStudents,
                enrolledCount: alloc.assignedStudents.length
            }));

            alloc.assignedStudents.forEach(uid => {
                bulkUserOps.push({
                    updateOne: {
                        filter: { _id: uid },
                        update: { section: alloc.name }
                    }
                });
            });
        }

        if (clearExisting) {
            await Promise.all(sectionUpdates);
            if (bulkUserOps.length > 0) await User.bulkWrite(bulkUserOps);
        }

        res.status(200).json({
            success: true,
            message: `Successfully enrolled ${students.length} students.`,
            stats: allocations.map(a => ({ name: a.name, count: a.assignedStudents.length }))
        });

    } catch (error) {
        console.error('[Enrollment Engine Error]', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

