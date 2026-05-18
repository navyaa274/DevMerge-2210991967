const Program = require('../../models/academic/Program');
const Course = require('../../models/academic/Course');
const Section = require('../../models/academic/Section');
const User = require('../../models/auth/User');
const Semester = require('../../models/academic/Semester');
const Broadcast = require('../../models/communication/Broadcast');
const CodeSession = require('../../models/assessment/sessions/CodeSession');
const Department = require('../../models/academic/Department');
const Quest = require('../../models/learning/gamification/Quest');
const HODAuditService = require('../../services/audit/hodAuditService');

/**
 * Get Department Dashboard Stats
 * @access Private/HOD/Admin
 */
exports.getDepartmentStats = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const [programsCount, coursesCount, sectionsCount, facultyCount, studentsCount] = await Promise.all([
            Program.countDocuments({ department: departmentId }),
            Course.countDocuments({ department: departmentId }),
            Section.countDocuments({
                semesterId: {
                    $in: await Semester.find({ programId: { $in: await Program.find({ department: departmentId }).select('_id') } }).select('_id')
                }
            }),
            User.countDocuments({ department: departmentId, role: 'faculty' }),
            User.countDocuments({ department: departmentId, role: 'student' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                programs: programsCount,
                courses: coursesCount,
                sections: sectionsCount,
                faculty: facultyCount,
                students: studentsCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Faculty Load for Department
 * @access Private/HOD/Admin
 */
exports.getFacultyLoad = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const faculty = await User.find({ department: departmentId, role: 'faculty' }).select('firstName lastName email');

        const facultyLoad = await Promise.all(faculty.map(async (f) => {
            const courses = await Course.find({
                $or: [
                    { facultyIds: f._id },
                    { faculty: f._id }
                ]
            });
            const sections = await Section.find({ classTeacherId: f._id });

            const totalCredits = courses.reduce((sum, c) => sum + (c.credits || 0), 0);

            return {
                _id: f._id,
                name: f.fullName || `${f.firstName} ${f.lastName}`,
                email: f.email,
                coursesAssigned: courses.length,
                totalCredits,
                sectionsAsTeacher: sections.length
            };
        }));

        res.status(200).json({
            success: true,
            data: facultyLoad
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const notificationService = require('../../services/notification/notificationService');
const emailService = require('../../utils/emailService');

/**
 * Global Broadcast
 * @access Private/HOD/Admin
 */
exports.broadcast = async (req, res) => {
    try {
        const { message, severity, target } = req.body;

        // Find HOD to get department
        const hod = await User.findById(req.user.id);
        const departmentId = hod.department;

        if (!departmentId && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(400).json({ success: false, message: 'HOD is not assigned to a department' });
        }

        const broadcast = new Broadcast({
            message,
            severity,
            target,
            sender: req.user.id
        });

        await broadcast.save();

        // 1. Identify Recipients
        let recipientRoles = [];
        if (target === 'all') recipientRoles = ['faculty', 'student'];
        else if (target === 'faculty') recipientRoles = ['faculty'];
        else if (target === 'students') recipientRoles = ['student'];

        const query = { role: { $in: recipientRoles } };
        if (departmentId) query.department = departmentId;

        const recipients = await User.find(query).select('_id email firstName lastName');
        const recipientIds = recipients.map(r => r._id);

        if (recipientIds.length > 0) {
            // 2. Send In-App Notifications
            await notificationService.sendBulkNotifications(
                recipientIds,
                'announcement',
                `Institutional Directive: ${severity.toUpperCase()}`,
                message,
                { broadcastId: broadcast._id, severity }
            );

            // 3. Send Emails (Best Effort)
            try {
                for (const recipient of recipients) {
                    await emailService.sendEmail({
                        to: recipient.email,
                        subject: `[DevMerge] Global Broadcast: ${severity.toUpperCase()}`,
                        data: {
                            firstName: recipient.firstName,
                            message: message,
                            highlightText: `Action Required: ${severity === 'critical' ? 'IMMEDIATE' : 'Soon'}`,
                            platformName: 'DevMerge University Platform'
                        }
                    }).catch(err => console.error(`Email relay failed for ${recipient.email}:`, err.message));
                }
            } catch (err) {
                console.warn('Mail relay subsystem offline:', err.message);
            }
        }

        res.status(201).json({
            success: true,
            message: `Broadcast successfully relayed to ${recipientIds.length} nodes.`,
            broadcast
        });

        // Log broadcast operation
        await HODAuditService.logBroadcastOperation(
            req.user.id,
            'SEND',
            broadcast._id,
            {
                message,
                severity,
                target,
                recipientCount: recipientIds.length,
                recipientRoles,
                departmentId: hod.department
            },
            req
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Department Settings
 * @access Private/HOD/Admin
 */
exports.getDepartmentSettings = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const requestingUser = req.user;

        // Security check - HOD can only access their own department
        if (requestingUser.role === 'hod' && requestingUser.department?.toString() !== departmentId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: You can only access your own department settings' 
            });
        }

        const department = await Department.findById(departmentId)
            .populate('hod', 'firstName lastName email employeeId')
            .select('-__v -createdAt -updatedAt');

        if (!department) {
            return res.status(404).json({ 
                success: false, 
                message: 'Department not found' 
            });
        }

        res.status(200).json({
            success: true,
            data: {
                department: {
                    id: department._id,
                    name: department.name,
                    code: department.code,
                    description: department.description,
                    hod: department.hod,
                    isActive: department.isActive,
                    establishedYear: department.establishedYear,
                    contactInfo: department.contactInfo,
                    gamificationConfig: department.gamificationConfig,
                    resources: department.resources
                },
                permissions: {
                    canUpdate: requestingUser.role === 'admin' || requestingUser.role === 'super_admin' || 
                              (requestingUser.role === 'hod' && requestingUser.department?.toString() === departmentId)
                }
            }
        });

        // Log department settings access
        await HODAuditService.logDepartmentOperation(
            requestingUser._id,
            'VIEW_SETTINGS',
            departmentId,
            { accessedFields: ['name', 'code', 'description', 'hod', 'contactInfo', 'gamificationConfig', 'resources'] },
            req
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Department Settings
 * @access Private/HOD/Admin
 */
exports.updateDepartmentSettings = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const requestingUser = req.user;
        const updates = req.body;

        // Security check - HOD can only update their own department
        if (requestingUser.role === 'hod' && requestingUser.department?.toString() !== departmentId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: You can only update your own department settings' 
            });
        }

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ 
                success: false, 
                message: 'Department not found' 
            });
        }

        // Define allowed fields for different user roles
        const allowedFieldsForHOD = [
            'description',
            'contactInfo.email',
            'contactInfo.phone', 
            'contactInfo.office',
            'resources.laboratories',
            'resources.classrooms'
        ];

        const allowedFieldsForAdmin = [
            ...allowedFieldsForHOD,
            'name',
            'hod',
            'isActive',
            'establishedYear'
        ];

        // Determine which fields this user can update
        const allowedFields = (requestingUser.role === 'admin' || requestingUser.role === 'super_admin') 
            ? allowedFieldsForAdmin 
            : allowedFieldsForHOD;

        // Filter updates to only include allowed fields
        const filteredUpdates = {};
        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                if (field.includes('.')) {
                    // Handle nested fields
                    const [parent, child] = field.split('.');
                    if (!filteredUpdates[parent]) filteredUpdates[parent] = {};
                    filteredUpdates[parent][child] = updates[field];
                } else {
                    filteredUpdates[field] = updates[field];
                }
            }
        }

        // Validate email if provided
        if (filteredUpdates.contactInfo?.email) {
            const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(filteredUpdates.contactInfo.email)) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid email format' 
                });
            }
        }

        // Validate HOD assignment if provided
        if (filteredUpdates.hod) {
            const newHOD = await User.findById(filteredUpdates.hod);
            if (!newHOD) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Specified HOD user not found' 
                });
            }
        }

        // Apply updates
        Object.assign(department, filteredUpdates);
        await department.save();

        // Populate HOD info for response
        await department.populate('hod', 'firstName lastName email employeeId');

        res.status(200).json({
            success: true,
            message: 'Department settings updated successfully',
            data: {
                department: {
                    id: department._id,
                    name: department.name,
                    code: department.code,
                    description: department.description,
                    hod: department.hod,
                    isActive: department.isActive,
                    establishedYear: department.establishedYear,
                    contactInfo: department.contactInfo,
                    gamificationConfig: department.gamificationConfig,
                    resources: department.resources,
                    updatedAt: department.updatedAt
                }
            }
        });

        // Log department settings update
        await HODAuditService.logDepartmentOperation(
            requestingUser._id,
            'UPDATE_SETTINGS',
            departmentId,
            { 
                updatedFields: Object.keys(filteredUpdates),
                previousValues: department._previousData || {},
                newValues: filteredUpdates
            },
            req
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Course Approvals
 * @access Private/HOD/Admin
 */
exports.getCourseApprovals = async (req, res) => {
    try {
        const { departmentId, status, page = 1, limit = 20 } = req.query;
        const requestingUser = req.user;

        // Security check - HOD can only view their own department's courses
        if (requestingUser.role === 'hod' && requestingUser.department?.toString() !== departmentId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: You can only view your own department courses' 
            });
        }

        // Build query
        const query = { department: departmentId };
        
        // Filter by approval status if provided
        if (status && ['draft', 'pending_approval', 'approved', 'rejected', 'requires_revision'].includes(status)) {
            query.approvalStatus = status;
        } else {
            // Default to show courses that need attention
            query.approvalStatus = { $in: ['pending_approval', 'requires_revision'] };
        }

        // Get courses with pagination
        const skip = (page - 1) * limit;
        const courses = await Course.find(query)
            .populate('department', 'name code')
            .populate('program', 'name code degreeType')
            .populate('faculty', 'firstName lastName email employeeId')
            .populate('approvalDetails.submittedBy', 'firstName lastName email')
            .populate('approvalDetails.reviewedBy', 'firstName lastName email')
            .sort({ 'approvalDetails.submittedAt': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count for pagination
        const total = await Course.countDocuments(query);

        // Get summary statistics
        const stats = await Course.aggregate([
            { $match: { department: mongoose.Types.ObjectId(departmentId) } },
            { $group: {
                _id: '$approvalStatus',
                count: { $sum: 1 }
            }}
        ]);

        const statsMap = {
            draft: 0,
            pending_approval: 0,
            approved: 0,
            rejected: 0,
            requires_revision: 0
        };

        stats.forEach(stat => {
            statsMap[stat._id] = stat.count;
        });

        res.status(200).json({
            success: true,
            data: {
                courses: courses.map(course => ({
                    id: course._id,
                    name: course.name,
                    code: course.code,
                    credits: course.credits,
                    semester: course.semester,
                    courseType: course.courseType,
                    approvalStatus: course.approvalStatus,
                    approvalDetails: course.approvalDetails,
                    department: course.department,
                    program: course.program,
                    faculty: course.faculty,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt
                })),
                statistics: statsMap,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalCourses: total,
                    hasMore: skip + courses.length < total
                },
                permissions: {
                    canApprove: requestingUser.role === 'admin' || requestingUser.role === 'super_admin' || 
                               (requestingUser.role === 'hod' && requestingUser.department?.toString() === departmentId),
                    canReview: requestingUser.role === 'admin' || requestingUser.role === 'super_admin' || 
                              (requestingUser.role === 'hod' && requestingUser.department?.toString() === departmentId)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Faculty Assignment
 * @access Private/HOD/Admin
 */
exports.assignFaculty = async (req, res) => {
    try {
        const { courseId, facultyId, action } = req.body;
        const requestingUser = req.user;

        // Validate required fields
        if (!courseId || !facultyId || !action) {
            return res.status(400).json({ 
                success: false, 
                message: 'Course ID, Faculty ID, and action are required' 
            });
        }

        // Validate action
        const validActions = ['assign', 'unassign', 'reassign'];
        if (!validActions.includes(action)) {
            return res.status(400).json({ 
                success: false, 
                message: `Action must be one of: ${validActions.join(', ')}` 
            });
        }

        // Get course and validate
        const course = await Course.findById(courseId).populate('department', 'name code');
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: 'Course not found' 
            });
        }

        // Security check - HOD can only assign faculty to their own department's courses
        if (requestingUser.role === 'hod' && requestingUser.department?.toString() !== course.department._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: You can only assign faculty to your own department courses' 
            });
        }

        // Get faculty and validate
        const faculty = await User.findById(facultyId);
        if (!faculty) {
            return res.status(404).json({ 
                success: false, 
                message: 'Faculty member not found' 
            });
        }

        if (faculty.role !== 'faculty') {
            return res.status(400).json({ 
                success: false, 
                message: 'User is not a faculty member' 
            });
        }

        // Check if faculty belongs to the same department
        if (faculty.department?.toString() !== course.department._id.toString()) {
            return res.status(400).json({ 
                success: false, 
                message: 'Faculty member must belong to the same department as the course' 
            });
        }

        let result;
        let notificationMessage;

        switch (action) {
            case 'assign':
                // Check if course already has a faculty assigned
                if (course.faculty && course.faculty.toString() === facultyId) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Faculty member is already assigned to this course' 
                    });
                }

                // Assign faculty to course
                course.faculty = facultyId;
                if (!course.facultyIds.includes(facultyId)) {
                    course.facultyIds.push(facultyId);
                }
                await course.save();

                result = {
                    action: 'assigned',
                    course: {
                        id: course._id,
                        name: course.name,
                        code: course.code
                    },
                    faculty: {
                        id: faculty._id,
                        name: `${faculty.firstName} ${faculty.lastName}`,
                        email: faculty.email
                    }
                };
                notificationMessage = `You have been assigned to course: ${course.name} (${course.code})`;
                break;

            case 'unassign':
                // Check if faculty is assigned to course
                if (!course.faculty || course.faculty.toString() !== facultyId) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Faculty member is not assigned to this course' 
                    });
                }

                // Unassign faculty from course
                course.faculty = null;
                course.facultyIds = course.facultyIds.filter(id => id.toString() !== facultyId);
                await course.save();

                result = {
                    action: 'unassigned',
                    course: {
                        id: course._id,
                        name: course.name,
                        code: course.code
                    },
                    faculty: {
                        id: faculty._id,
                        name: `${faculty.firstName} ${faculty.lastName}`,
                        email: faculty.email
                    }
                };
                notificationMessage = `You have been unassigned from course: ${course.name} (${course.code})`;
                break;

            case 'reassign':
                // Get previous faculty for notification
                const previousFacultyId = course.faculty;
                
                // Assign new faculty
                course.faculty = facultyId;
                if (!course.facultyIds.includes(facultyId)) {
                    course.facultyIds.push(facultyId);
                }
                await course.save();

                result = {
                    action: 'reassigned',
                    course: {
                        id: course._id,
                        name: course.name,
                        code: course.code
                    },
                    newFaculty: {
                        id: faculty._id,
                        name: `${faculty.firstName} ${faculty.lastName}`,
                        email: faculty.email
                    },
                    previousFacultyId
                };
                notificationMessage = `You have been reassigned to course: ${course.name} (${course.code})`;
                break;
        }

        // Send notification to faculty (optional - would require notification service)
        try {
            const notificationService = require('../../services/notification/notificationService');
            await notificationService.sendNotification(
                facultyId,
                'faculty_assignment',
                'Course Assignment Update',
                notificationMessage,
                {
                    courseId: course._id,
                    courseName: course.name,
                    courseCode: course.code,
                    action: result.action,
                    assignedBy: requestingUser._id
                }
            );
        } catch (notificationError) {
            console.warn('Failed to send faculty assignment notification:', notificationError.message);
        }

        res.status(200).json({
            success: true,
            message: `Faculty ${result.action} successfully`,
            data: result
        });

        // Log faculty assignment operation
        await HODAuditService.logFacultyOperation(
            requestingUser._id,
            result.action.toUpperCase(),
            facultyId,
            {
                courseId,
                courseName: course.name,
                courseCode: course.code,
                previousFacultyId: result.previousFacultyId,
                assignmentDetails: result
            },
            req
        );

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get All Departments (for HOD view)
 * @access Private/HOD/Admin
 */
exports.getDepartments = async (req, res) => {
    try {
        const { page = 1, limit = 20, search, isActive } = req.query;
        const requestingUser = req.user;

        // Build query
        let query = {};
        
        // HODs can only see their own department
        if (requestingUser.role === 'hod') {
            query._id = requestingUser.department;
        } else {
            // Admins can filter by status
            if (isActive !== undefined) {
                query.isActive = isActive === 'true';
            }
            
            // Search functionality
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { code: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
        }

        // Get departments with pagination
        const skip = (page - 1) * limit;
        const departments = await Department.find(query)
            .populate('hod', 'firstName lastName email employeeId')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Department.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                departments: departments.map(dept => ({
                    id: dept._id,
                    name: dept.name,
                    code: dept.code,
                    description: dept.description,
                    hod: dept.hod,
                    isActive: dept.isActive,
                    establishedYear: dept.establishedYear,
                    contactInfo: dept.contactInfo,
                    statistics: dept.statistics,
                    createdAt: dept.createdAt,
                    updatedAt: dept.updatedAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalDepartments: total,
                    hasMore: skip + departments.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create Department
 * @access Private/Admin/SuperAdmin
 */
exports.createDepartment = async (req, res) => {
    try {
        const {
            name,
            code,
            description,
            establishedYear,
            contactInfo,
            hod: hodId
        } = req.body;

        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({ 
                success: false, 
                message: 'Department name and code are required' 
            });
        }

        // Check if department code already exists
        const existingDept = await Department.findOne({ code: code.toUpperCase() });
        if (existingDept) {
            return res.status(400).json({ 
                success: false, 
                message: 'Department with this code already exists' 
            });
        }

        // Validate HOD assignment if provided
        if (hodId) {
            const hodUser = await User.findById(hodId);
            if (!hodUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Specified HOD user not found' 
                });
            }
        }

        // Create department
        const department = new Department({
            name: name.trim(),
            code: code.toUpperCase(),
            description: description?.trim(),
            establishedYear,
            contactInfo,
            hod: hodId || null
        });

        await department.save();

        // Update HOD's department reference if assigned
        if (hodId) {
            await User.findByIdAndUpdate(hodId, { department: department._id });
        }

        // Populate HOD info for response
        await department.populate('hod', 'firstName lastName email employeeId');

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: {
                department: {
                    id: department._id,
                    name: department.name,
                    code: department.code,
                    description: department.description,
                    hod: department.hod,
                    isActive: department.isActive,
                    establishedYear: department.establishedYear,
                    contactInfo: department.contactInfo,
                    statistics: department.statistics,
                    createdAt: department.createdAt
                }
            }
        });

        // Log department creation
        await HODAuditService.logDepartmentOperation(
            req.user.id,
            'CREATE',
            department._id,
            {
                name: department.name,
                code: department.code,
                description: department.description,
                establishedYear: department.establishedYear,
                hod: hodId
            },
            req
        );
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Department
 * @access Private/Admin/SuperAdmin
 */
exports.updateDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;
        const updates = req.body;

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ 
                success: false, 
                message: 'Department not found' 
            });
        }

        // Handle HOD reassignment
        if (updates.hod !== undefined) {
            // Remove department reference from old HOD
            if (department.hod) {
                await User.findByIdAndUpdate(department.hod, { department: null });
            }
            
            // Assign new HOD
            if (updates.hod) {
                const newHOD = await User.findById(updates.hod);
                if (!newHOD) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Specified HOD user not found' 
                    });
                }
                await User.findByIdAndUpdate(updates.hod, { department: departmentId });
            }
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (key === 'code') {
                department[key] = updates[key].toUpperCase();
            } else {
                department[key] = updates[key];
            }
        });

        await department.save();

        // Populate HOD info for response
        await department.populate('hod', 'firstName lastName email employeeId');

        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: {
                department: {
                    id: department._id,
                    name: department.name,
                    code: department.code,
                    description: department.description,
                    hod: department.hod,
                    isActive: department.isActive,
                    establishedYear: department.establishedYear,
                    contactInfo: department.contactInfo,
                    statistics: department.statistics,
                    updatedAt: department.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Department
 * @access Private/Admin/SuperAdmin
 */
exports.deleteDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({ 
                success: false, 
                message: 'Department not found' 
            });
        }

        // Check if department has associated programs or courses
        const Program = require('../../models/academic/Program');
        const Course = require('../../models/academic/Course');
        
        const [programCount, courseCount] = await Promise.all([
            Program.countDocuments({ department: departmentId }),
            Course.countDocuments({ department: departmentId })
        ]);

        if (programCount > 0 || courseCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete department with associated programs or courses' 
            });
        }

        // Remove department reference from HOD
        if (department.hod) {
            await User.findByIdAndUpdate(department.hod, { department: null });
        }

        // Soft delete by marking as inactive
        department.isActive = false;
        await department.save();

        res.status(200).json({
            success: true,
            message: 'Department deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Programs (for HOD view)
 * @access Private/HOD/Admin
 */
exports.getPrograms = async (req, res) => {
    try {
        const { departmentId, page = 1, limit = 20, search, degreeType, isActive } = req.query;
        const requestingUser = req.user;

        // Build query
        let query = {};
        
        // HODs can only see programs from their own department
        if (requestingUser.role === 'hod') {
            query.department = requestingUser.department;
        } else if (departmentId) {
            query.department = departmentId;
        }

        // Filters
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (degreeType && ['bachelors', 'masters', 'doctorate', 'diploma', 'certificate'].includes(degreeType)) {
            query.degreeType = degreeType;
        }

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Get programs with pagination
        const skip = (page - 1) * limit;
        const programs = await Program.find(query)
            .populate('department', 'name code')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Program.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                programs: programs.map(program => ({
                    id: program._id,
                    name: program.name,
                    code: program.code,
                    description: program.description,
                    degreeType: program.degreeType,
                    duration: program.duration,
                    isActive: program.isActive,
                    department: program.department,
                    accreditation: program.accreditation,
                    curriculum: program.curriculum,
                    admission: program.admission,
                    statistics: program.statistics,
                    createdAt: program.createdAt,
                    updatedAt: program.updatedAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPrograms: total,
                    hasMore: skip + programs.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create Program
 * @access Private/Admin/SuperAdmin
 */
exports.createProgram = async (req, res) => {
    try {
        const {
            name,
            code,
            department,
            description,
            duration,
            degreeType,
            curriculum,
            admission,
            outcomes,
            accreditation
        } = req.body;

        // Validate required fields
        if (!name || !code || !department || !duration || !degreeType) {
            return res.status(400).json({ 
                success: false, 
                message: 'Program name, code, department, duration, and degree type are required' 
            });
        }

        // Validate degree type
        const validDegreeTypes = ['bachelors', 'masters', 'doctorate', 'diploma', 'certificate'];
        if (!validDegreeTypes.includes(degreeType)) {
            return res.status(400).json({ 
                success: false, 
                message: `Degree type must be one of: ${validDegreeTypes.join(', ')}` 
            });
        }

        // Check if program code already exists
        const existingProgram = await Program.findOne({ code: code.toUpperCase() });
        if (existingProgram) {
            return res.status(400).json({ 
                success: false, 
                message: 'Program with this code already exists' 
            });
        }

        // Validate department exists
        const dept = await Department.findById(department);
        if (!dept) {
            return res.status(400).json({ 
                success: false, 
                message: 'Department not found' 
            });
        }

        // Create program
        const program = new Program({
            name: name.trim(),
            code: code.toUpperCase(),
            department,
            description: description?.trim(),
            duration,
            degreeType,
            curriculum,
            admission,
            outcomes,
            accreditation
        });

        await program.save();

        // Populate department info for response
        await program.populate('department', 'name code');

        res.status(201).json({
            success: true,
            message: 'Program created successfully',
            data: {
                program: {
                    id: program._id,
                    name: program.name,
                    code: program.code,
                    description: program.description,
                    degreeType: program.degreeType,
                    duration: program.duration,
                    isActive: program.isActive,
                    department: program.department,
                    accreditation: program.accreditation,
                    curriculum: program.curriculum,
                    admission: program.admission,
                    outcomes: program.outcomes,
                    statistics: program.statistics,
                    createdAt: program.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Program
 * @access Private/Admin/SuperAdmin
 */
exports.updateProgram = async (req, res) => {
    try {
        const { programId } = req.params;
        const updates = req.body;
        const requestingUser = req.user;

        const program = await Program.findById(programId).populate('department', 'name code');
        if (!program) {
            return res.status(404).json({ 
                success: false, 
                message: 'Program not found' 
            });
        }

        // Security check - HOD can only update programs in their department
        if (requestingUser.role === 'hod' && requestingUser.department?.toString() !== program.department._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: You can only update programs in your own department' 
            });
        }

        // Validate degree type if provided
        if (updates.degreeType) {
            const validDegreeTypes = ['bachelors', 'masters', 'doctorate', 'diploma', 'certificate'];
            if (!validDegreeTypes.includes(updates.degreeType)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Degree type must be one of: ${validDegreeTypes.join(', ')}` 
                });
            }
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (key === 'code') {
                program[key] = updates[key].toUpperCase();
            } else {
                program[key] = updates[key];
            }
        });

        await program.save();

        res.status(200).json({
            success: true,
            message: 'Program updated successfully',
            data: {
                program: {
                    id: program._id,
                    name: program.name,
                    code: program.code,
                    description: program.description,
                    degreeType: program.degreeType,
                    duration: program.duration,
                    isActive: program.isActive,
                    department: program.department,
                    accreditation: program.accreditation,
                    curriculum: program.curriculum,
                    admission: program.admission,
                    outcomes: program.outcomes,
                    statistics: program.statistics,
                    updatedAt: program.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Program
 * @access Private/Admin/SuperAdmin
 */
exports.deleteProgram = async (req, res) => {
    try {
        const { programId } = req.params;

        const program = await Program.findById(programId);
        if (!program) {
            return res.status(404).json({ 
                success: false, 
                message: 'Program not found' 
            });
        }

        // Check if program has associated courses
        const courseCount = await Course.countDocuments({ program: programId });

        if (courseCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete program with associated courses' 
            });
        }

        // Soft delete by marking as inactive
        program.isActive = false;
        await program.save();

        res.status(200).json({
            success: true,
            message: 'Program deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Courses (for HOD view)
 * @access Private/HOD/Admin
 */
exports.getCourses = async (req, res) => {
    try {
        const { departmentId, programId, page = 1, limit = 20, search, courseType, approvalStatus, isActive } = req.query;
        const requestingUser = req.user;

        // Build query
        let query = {};
        
        // HODs can only see courses from their own department
        if (requestingUser.role === 'hod') {
            query.department = requestingUser.department;
        } else if (departmentId) {
            query.department = departmentId;
        }

        // Program filter
        if (programId) {
            query.program = programId;
        }

        // Filters
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (courseType && ['core', 'elective', 'lab', 'seminar', 'project'].includes(courseType)) {
            query.courseType = courseType;
        }

        if (approvalStatus && ['draft', 'pending_approval', 'approved', 'rejected', 'requires_revision'].includes(approvalStatus)) {
            query.approvalStatus = approvalStatus;
        }

        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Get courses with pagination
        const skip = (page - 1) * limit;
        const courses = await Course.find(query)
            .populate('department', 'name code')
            .populate('program', 'name code degreeType')
            .populate('faculty', 'firstName lastName email employeeId')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                courses: courses.map(course => ({
                    id: course._id,
                    name: course.name,
                    code: course.code,
                    description: course.description,
                    credits: course.credits,
                    semester: course.semester,
                    courseType: course.courseType,
                    approvalStatus: course.approvalStatus,
                    isActive: course.isActive,
                    department: course.department,
                    program: course.program,
                    faculty: course.faculty,
                    enrollment: course.enrollment,
                    statistics: course.statistics,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalCourses: total,
                    hasMore: skip + courses.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create Course
 * @access Private/Admin/SuperAdmin
 */
exports.createCourse = async (req, res) => {
    try {
        const {
            name,
            code,
            department,
            program,
            description,
            credits,
            semester,
            courseType = 'core',
            curriculum,
            assessment,
            resources,
            enrollment
        } = req.body;

        // Validate required fields
        if (!name || !code || !department || !program || !credits || !semester) {
            return res.status(400).json({ 
                success: false, 
                message: 'Course name, code, department, program, credits, and semester are required' 
            });
        }

        // Validate course type
        const validCourseTypes = ['core', 'elective', 'lab', 'seminar', 'project'];
        if (!validCourseTypes.includes(courseType)) {
            return res.status(400).json({ 
                success: false, 
                message: `Course type must be one of: ${validCourseTypes.join(', ')}` 
            });
        }

        // Check if course code already exists
        const existingCourse = await Course.findOne({ code: code.toUpperCase() });
        if (existingCourse) {
            return res.status(400).json({ 
                success: false, 
                message: 'Course with this code already exists' 
            });
        }

        // Validate department and program exist
        const [dept, prog] = await Promise.all([
            Department.findById(department),
            Program.findById(program)
        ]);

        if (!dept) {
            return res.status(400).json({ 
                success: false, 
                message: 'Department not found' 
            });
        }

        if (!prog) {
            return res.status(400).json({ 
                success: false, 
                message: 'Program not found' 
            });
        }

        // Create course
        const course = new Course({
            name: name.trim(),
            code: code.toUpperCase(),
            department,
            program,
            description: description?.trim(),
            credits,
            semester,
            courseType,
            curriculum,
            assessment,
            resources,
            enrollment,
            approvalStatus: 'draft'
        });

        await course.save();

        // Populate related info for response
        await course.populate([
            { path: 'department', select: 'name code' },
            { path: 'program', select: 'name code degreeType' },
            { path: 'faculty', select: 'firstName lastName email employeeId' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: {
                course: {
                    id: course._id,
                    name: course.name,
                    code: course.code,
                    description: course.description,
                    credits: course.credits,
                    semester: course.semester,
                    courseType: course.courseType,
                    approvalStatus: course.approvalStatus,
                    isActive: course.isActive,
                    department: course.department,
                    program: course.program,
                    faculty: course.faculty,
                    curriculum: course.curriculum,
                    assessment: course.assessment,
                    resources: course.resources,
                    enrollment: course.enrollment,
                    createdAt: course.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Course
 * @access Private/Admin/SuperAdmin
 */
exports.updateCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const updates = req.body;
        const requestingUser = req.user;

        const course = await Course.findById(courseId)
            .populate('department', 'name code')
            .populate('program', 'name code degreeType');
        
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: 'Course not found' 
            });
        }

        // Security check - HOD can only update courses in their department
        if (requestingUser.role === 'hod' && requestingUser.department?.toString() !== course.department._id.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied: You can only update courses in your own department' 
            });
        }

        // Validate course type if provided
        if (updates.courseType) {
            const validCourseTypes = ['core', 'elective', 'lab', 'seminar', 'project'];
            if (!validCourseTypes.includes(updates.courseType)) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Course type must be one of: ${validCourseTypes.join(', ')}` 
                });
            }
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (key === 'code') {
                course[key] = updates[key].toUpperCase();
            } else {
                course[key] = updates[key];
            }
        });

        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: {
                course: {
                    id: course._id,
                    name: course.name,
                    code: course.code,
                    description: course.description,
                    credits: course.credits,
                    semester: course.semester,
                    courseType: course.courseType,
                    approvalStatus: course.approvalStatus,
                    isActive: course.isActive,
                    department: course.department,
                    program: course.program,
                    faculty: course.faculty,
                    curriculum: course.curriculum,
                    assessment: course.assessment,
                    resources: course.resources,
                    enrollment: course.enrollment,
                    updatedAt: course.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Course
 * @access Private/Admin/SuperAdmin
 */
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: 'Course not found' 
            });
        }

        // Check if course has enrolled students or assignments
        const Assignment = require('../../models/assessment/Assignment');
        const [assignmentCount] = await Promise.all([
            Assignment.countDocuments({ course: courseId })
        ]);

        if (assignmentCount > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete course with associated assignments' 
            });
        }

        // Soft delete by marking as inactive
        course.isActive = false;
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Course deactivated successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Sections (for HOD view)
 * @access Private/HOD/Admin
 */
exports.getSections = async (req, res) => {
    try {
        const { semesterId, page = 1, limit = 20, search, hasTeacher } = req.query;
        const requestingUser = req.user;

        // Build query
        let query = {};
        
        if (semesterId) {
            query.semesterId = semesterId;
        }

        // Filter by teacher assignment
        if (hasTeacher !== undefined) {
            if (hasTeacher === 'true') {
                query.classTeacherId = { $exists: true, $ne: null };
            } else {
                query.$or = [
                    { classTeacherId: { $exists: false } },
                    { classTeacherId: null }
                ];
            }
        }

        // Search functionality
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        // Get sections with pagination
        const skip = (page - 1) * limit;
        const sections = await Section.find(query)
            .populate('semesterId', 'semesterNumber programId')
            .populate('classTeacherId', 'firstName lastName email employeeId')
            .populate('students', 'firstName lastName email studentId')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Section.countDocuments(query);

        // Get program details for each section
        const sectionsWithPrograms = await Promise.all(
            sections.map(async (section) => {
                const populatedSection = section.toObject();
                if (section.semesterId?.programId) {
                    const program = await Program.findById(section.semesterId.programId)
                        .select('name code degreeType department')
                        .populate('department', 'name code');
                    populatedSection.program = program;
                }
                return populatedSection;
            })
        );

        res.status(200).json({
            success: true,
            data: {
                sections: sectionsWithPrograms.map(section => ({
                    id: section._id,
                    name: section.name,
                    semester: section.semesterId,
                    program: section.program,
                    classTeacher: section.classTeacherId,
                    capacity: section.capacity,
                    enrolledCount: section.enrolledCount,
                    students: section.students,
                    availableSlots: section.capacity - section.enrolledCount,
                    isFull: section.enrolledCount >= section.capacity,
                    createdAt: section.createdAt,
                    updatedAt: section.updatedAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalSections: total,
                    hasMore: skip + sections.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create Section
 * @access Private/Admin/SuperAdmin
 */
exports.createSection = async (req, res) => {
    try {
        const {
            name,
            semesterId,
            classTeacherId,
            capacity = 60
        } = req.body;

        // Validate required fields
        if (!name || !semesterId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Section name and semester ID are required' 
            });
        }

        // Validate semester exists
        const semester = await Semester.findById(semesterId).populate('programId');
        if (!semester) {
            return res.status(400).json({ 
                success: false, 
                message: 'Semester not found' 
            });
        }

        // Check if section name already exists for this semester
        const existingSection = await Section.findOne({ 
            name: name.trim().toUpperCase(), 
            semesterId 
        });
        if (existingSection) {
            return res.status(400).json({ 
                success: false, 
                message: 'Section with this name already exists for this semester' 
            });
        }

        // Validate teacher assignment if provided
        if (classTeacherId) {
            const teacher = await User.findById(classTeacherId);
            if (!teacher || teacher.role !== 'faculty') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid teacher assignment' 
                });
            }
        }

        // Create section
        const section = new Section({
            name: name.trim().toUpperCase(),
            semesterId,
            classTeacherId,
            capacity
        });

        await section.save();

        // Populate related info for response
        await section.populate([
            { path: 'semesterId', populate: { path: 'programId' } },
            { path: 'classTeacherId', select: 'firstName lastName email employeeId' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            data: {
                section: {
                    id: section._id,
                    name: section.name,
                    semester: section.semesterId,
                    classTeacher: section.classTeacherId,
                    capacity: section.capacity,
                    enrolledCount: section.enrolledCount,
                    availableSlots: section.capacity - section.enrolledCount,
                    createdAt: section.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Section
 * @access Private/Admin/SuperAdmin
 */
exports.updateSection = async (req, res) => {
    try {
        const { sectionId } = req.params;
        const updates = req.body;

        const section = await Section.findById(sectionId)
            .populate('semesterId', 'programId');
        
        if (!section) {
            return res.status(404).json({ 
                success: false, 
                message: 'Section not found' 
            });
        }

        // Validate teacher assignment if provided
        if (updates.classTeacherId) {
            const teacher = await User.findById(updates.classTeacherId);
            if (!teacher || teacher.role !== 'faculty') {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid teacher assignment' 
                });
            }
        }

        // Check for duplicate section name if name is being updated
        if (updates.name && updates.name !== section.name) {
            const existingSection = await Section.findOne({ 
                name: updates.name.trim().toUpperCase(), 
                semesterId: section.semesterId._id,
                _id: { $ne: sectionId }
            });
            if (existingSection) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Section with this name already exists for this semester' 
                });
            }
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (key === 'name') {
                section[key] = updates[key].trim().toUpperCase();
            } else {
                section[key] = updates[key];
            }
        });

        await section.save();

        // Populate related info for response
        await section.populate([
            { path: 'semesterId', populate: { path: 'programId' } },
            { path: 'classTeacherId', select: 'firstName lastName email employeeId' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Section updated successfully',
            data: {
                section: {
                    id: section._id,
                    name: section.name,
                    semester: section.semesterId,
                    classTeacher: section.classTeacherId,
                    capacity: section.capacity,
                    enrolledCount: section.enrolledCount,
                    availableSlots: section.capacity - section.enrolledCount,
                    updatedAt: section.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Section
 * @access Private/Admin/SuperAdmin
 */
exports.deleteSection = async (req, res) => {
    try {
        const { sectionId } = req.params;

        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(404).json({ 
                success: false, 
                message: 'Section not found' 
            });
        }

        // Check if section has enrolled students
        if (section.enrolledCount > 0 || (section.students && section.students.length > 0)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot delete section with enrolled students' 
            });
        }

        await Section.findByIdAndDelete(sectionId);

        res.status(200).json({
            success: true,
            message: 'Section deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Auto-assign Students to Sections
 * @access Private/HOD/Admin
 */
exports.autoAssignStudents = async (req, res) => {
    try {
        const { semesterId, config = {} } = req.body;
        const requestingUser = req.user;

        // Validate semester exists
        const semester = await Semester.findById(semesterId).populate('programId');
        if (!semester) {
            return res.status(400).json({ 
                success: false, 
                message: 'Semester not found' 
            });
        }

        // Get all sections for this semester
        const sections = await Section.find({ semesterId })
            .populate('classTeacherId', 'firstName lastName email');

        if (sections.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No sections found for this semester' 
            });
        }

        // Get students to be assigned (simplified logic)
        const students = await User.find({ 
            role: 'student',
            // Add logic to get students for this program/semester
        }).limit(100); // Limit for demo

        // Simple round-robin assignment
        const assignments = [];
        students.forEach((student, index) => {
            const sectionIndex = index % sections.length;
            const section = sections[sectionIndex];
            
            assignments.push({
                studentId: student._id,
                sectionId: section._id,
                sectionName: section.name
            });
        });

        // Update sections with assigned students
        for (const assignment of assignments) {
            await Section.findByIdAndUpdate(
                assignment.sectionId,
                { 
                    $addToSet: { students: assignment.studentId },
                    $inc: { enrolledCount: 1 }
                }
            );
        }

        res.status(200).json({
            success: true,
            message: `Successfully assigned ${students.length} students to ${sections.length} sections`,
            data: {
                totalStudents: students.length,
                totalSections: sections.length,
                assignments,
                semester: {
                    id: semester._id,
                    semesterNumber: semester.semesterNumber,
                    program: semester.programId
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Audit Logs
 * @access Private/HOD/Admin
 */
exports.getAuditLogs = async (req, res) => {
    try {
        const requestingUser = req.user;
        const filters = { ...req.query };

        // HODs can only see audit logs for their own actions
        if (requestingUser.role === 'hod') {
            filters.userId = requestingUser._id;
        }

        const result = await HODAuditService.getAuditLogs(filters);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Audit Statistics
 * @access Private/HOD/Admin
 */
exports.getAuditStatistics = async (req, res) => {
    try {
        const requestingUser = req.user;
        const filters = { ...req.query };

        // HODs can only see statistics for their own actions
        if (requestingUser.role === 'hod') {
            filters.userId = requestingUser._id;
        }

        const statistics = await HODAuditService.getAuditStatistics(filters);

        res.status(200).json({
            success: true,
            data: statistics
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Real-time Statistics for Broadcast Panel
 * @access Private/HOD/Admin
 */
exports.getBroadcastStats = async (req, res) => {
    try {
        const realtimeDashboard = req.app.get('realtimeDashboard');
        const liveMetrics = realtimeDashboard?.getCurrentMetrics();
        const fiveMinutesAgo = new Date(Date.now() - 300000);

        // Find HOD to get department for scoped stats
        const hod = await User.findById(req.user.id);
        const deptId = hod.department;

        const baseQuery = deptId ? { department: deptId } : {};

        // Use live metrics if available, otherwise fallback to DB
        const studentsOnline = liveMetrics?.users?.activeStudents ||
            await User.countDocuments({ ...baseQuery, role: 'student', lastActive: { $gte: fiveMinutesAgo } });

        const facultyOnline = liveMetrics?.users?.activeFaculty ||
            await User.countDocuments({ ...baseQuery, role: 'faculty', lastActive: { $gte: fiveMinutesAgo } });

        const labsRunning = liveMetrics?.users?.labsRunning ||
            await CodeSession.countDocuments({ lastSaved: { $gte: fiveMinutesAgo } });

        const [totalStudents, totalFaculty] = await Promise.all([
            User.countDocuments({ ...baseQuery, role: 'student' }),
            User.countDocuments({ ...baseQuery, role: 'faculty' })
        ]);

        res.status(200).json({
            success: true,
            data: {
                studentsOnline: Math.max(studentsOnline, 0),
                facultyOnline: Math.max(facultyOnline, 0),
                labsRunning: Math.max(labsRunning, 0),
                totalStudents: Math.max(totalStudents, 1),
                totalFaculty: Math.max(totalFaculty, 1),
                totalPossibleLabs: 500
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
/**
 * Get Broadcast History
 * @access Private/HOD/Admin
 */
exports.getBroadcastHistory = async (req, res) => {
    try {
        const history = await Broadcast.find()
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('sender', 'firstName lastName name');

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Gamification Overrides
 * @access Private/HOD/Admin
 */
exports.getGamificationConfig = async (req, res) => {
    try {
        const hod = await User.findById(req.user.id);
        const department = await Department.findById(hod.department);

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        // Get active zero-day quests for this department
        const activeQuests = await Quest.find({
            issuer: req.user.id,
            isActive: true,
            expiresAt: { $gt: new Date() }
        });

        res.status(200).json({
            success: true,
            data: {
                config: department.gamificationConfig || { globalXpMultiplier: 1.0 },
                activeQuests
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Gamification Multiplier
 * @access Private/HOD/Admin
 */
exports.updateGamificationMultiplier = async (req, res) => {
    try {
        const { multiplier, durationHours } = req.body;
        const hod = await User.findById(req.user.id);

        const expiry = durationHours ? new Date(Date.now() + durationHours * 60 * 60 * 1000) : null;

        const department = await Department.findByIdAndUpdate(
            hod.department,
            {
                'gamificationConfig.globalXpMultiplier': multiplier,
                'gamificationConfig.multiplierExpiry': expiry
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Global XP Multiplier updated to ${multiplier}x`,
            data: department.gamificationConfig
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
