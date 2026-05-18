const AuditLog = require('../../models/admin/AuditLog');

/**
 * HOD Audit Service
 * Provides comprehensive audit logging for HOD operations
 */

class HODAuditService {
    /**
     * Log HOD operation
     * @param {Object} options - Audit options
     * @param {String} options.userId - User ID performing action
     * @param {String} options.action - Action performed
     * @param {String} options.resource - Resource type (department, program, course, section, faculty)
     * @param {String} options.resourceId - Resource ID
     * @param {Object} options.changes - Changes made
     * @param {Object} options.metadata - Additional metadata
     * @param {Object} options.req - Express request object for IP/User-Agent
     * @param {String} options.status - success or failure
     * @param {String} options.errorMessage - Error message if failed
     */
    static async log(options) {
        try {
            const {
                userId,
                action,
                resource,
                resourceId,
                changes = {},
                metadata = {},
                req,
                status = 'success',
                errorMessage
            } = options;

            const auditLog = new AuditLog({
                userId,
                action: `HOD_${action}`,
                resource,
                resourceId,
                changes: {
                    ...changes,
                    metadata
                },
                ipAddress: req?.ip || req?.connection?.remoteAddress,
                userAgent: req?.get('User-Agent'),
                status,
                errorMessage,
                isPersonalDataAccessed: this.checkPersonalDataAccess(action),
                legalBasis: this.getLegalBasis(action)
            });

            await auditLog.save();
            
            // Optional: Emit real-time audit event
            if (global.auditEmitter) {
                global.auditEmitter.emit('hod_audit', {
                    action: `HOD_${action}`,
                    resource,
                    userId,
                    timestamp: new Date(),
                    status
                });
            }

        } catch (error) {
            console.error('Failed to log HOD audit:', error);
            // Don't throw error to avoid breaking main operation
        }
    }

    /**
     * Check if action involves personal data access
     */
    static checkPersonalDataAccess(action) {
        const personalDataActions = [
            'VIEW_FACULTY_DATA',
            'VIEW_STUDENT_DATA',
            'VIEW_DEPARTMENT_SETTINGS',
            'EXPORT_DATA',
            'VIEW_ANALYTICS'
        ];
        return personalDataActions.includes(action);
    }

    /**
     * Get legal basis for data processing
     */
    static getLegalBasis(action) {
        const legalBasisMap = {
            'CREATE_DEPARTMENT': 'CONTRACT',
            'UPDATE_DEPARTMENT': 'CONTRACT',
            'DELETE_DEPARTMENT': 'LEGAL_OBLIGATION',
            'CREATE_PROGRAM': 'CONTRACT',
            'UPDATE_PROGRAM': 'CONTRACT',
            'DELETE_PROGRAM': 'LEGAL_OBLIGATION',
            'CREATE_COURSE': 'CONTRACT',
            'UPDATE_COURSE': 'CONTRACT',
            'DELETE_COURSE': 'LEGAL_OBLIGATION',
            'ASSIGN_FACULTY': 'CONTRACT',
            'APPROVE_COURSE': 'CONTRACT',
            'BROADCAST_MESSAGE': 'CONTRACT',
            'VIEW_FACULTY_DATA': 'LEGITIMATE_INTERESTS',
            'VIEW_STUDENT_DATA': 'LEGITIMATE_INTERESTS',
            'VIEW_ANALYTICS': 'LEGITIMATE_INTERESTS',
            'EXPORT_DATA': 'CONTRACT'
        };
        return legalBasisMap[action] || 'LEGITIMATE_INTERESTS';
    }

    /**
     * Log department operations
     */
    static async logDepartmentOperation(userId, action, departmentId, changes, req, status = 'success', errorMessage = null) {
        await this.log({
            userId,
            action: `DEPARTMENT_${action}`,
            resource: 'department',
            resourceId: departmentId,
            changes,
            req,
            status,
            errorMessage
        });
    }

    /**
     * Log program operations
     */
    static async logProgramOperation(userId, action, programId, changes, req, status = 'success', errorMessage = null) {
        await this.log({
            userId,
            action: `PROGRAM_${action}`,
            resource: 'program',
            resourceId: programId,
            changes,
            req,
            status,
            errorMessage
        });
    }

    /**
     * Log course operations
     */
    static async logCourseOperation(userId, action, courseId, changes, req, status = 'success', errorMessage = null) {
        await this.log({
            userId,
            action: `COURSE_${action}`,
            resource: 'course',
            resourceId: courseId,
            changes,
            req,
            status,
            errorMessage
        });
    }

    /**
     * Log section operations
     */
    static async logSectionOperation(userId, action, sectionId, changes, req, status = 'success', errorMessage = null) {
        await this.log({
            userId,
            action: `SECTION_${action}`,
            resource: 'section',
            resourceId: sectionId,
            changes,
            req,
            status,
            errorMessage
        });
    }

    /**
     * Log faculty operations
     */
    static async logFacultyOperation(userId, action, facultyId, changes, req, status = 'success', errorMessage = null) {
        await this.log({
            userId,
            action: `FACULTY_${action}`,
            resource: 'faculty',
            resourceId: facultyId,
            changes,
            req,
            status,
            errorMessage
        });
    }

    /**
     * Log broadcast operations
     */
    static async logBroadcastOperation(userId, action, broadcastId, changes, req, status = 'success', errorMessage = null) {
        await this.log({
            userId,
            action: `BROADCAST_${action}`,
            resource: 'broadcast',
            resourceId: broadcastId,
            changes,
            req,
            status,
            errorMessage
        });
    }

    /**
     * Get audit logs for HOD operations
     */
    static async getAuditLogs(filters = {}) {
        try {
            const {
                userId,
                resource,
                action,
                startDate,
                endDate,
                page = 1,
                limit = 50
            } = filters;

            // Build query
            let query = {};
            
            // Filter by HOD actions
            query.action = { $regex: '^HOD_', $options: 'i' };

            if (userId) {
                query.userId = userId;
            }

            if (resource) {
                query.resource = resource;
            }

            if (action) {
                query.action = { $regex: action, $options: 'i' };
            }

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) {
                    query.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.createdAt.$lte = new Date(endDate);
                }
            }

            const skip = (page - 1) * limit;
            const logs = await AuditLog.find(query)
                .populate('userId', 'firstName lastName email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await AuditLog.countDocuments(query);

            return {
                logs,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalLogs: total,
                    hasMore: skip + logs.length < total
                }
            };
        } catch (error) {
            console.error('Failed to get audit logs:', error);
            throw error;
        }
    }

    /**
     * Get audit statistics
     */
    static async getAuditStatistics(filters = {}) {
        try {
            const { userId, startDate, endDate } = filters;

            let matchStage = {
                action: { $regex: '^HOD_', $options: 'i' }
            };

            if (userId) {
                matchStage.userId = mongoose.Types.ObjectId(userId);
            }

            if (startDate || endDate) {
                matchStage.createdAt = {};
                if (startDate) {
                    matchStage.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    matchStage.createdAt.$lte = new Date(endDate);
                }
            }

            const statistics = await AuditLog.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalLogs: { $sum: 1 },
                        successCount: {
                            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
                        },
                        failureCount: {
                            $sum: { $cond: [{ $eq: ['$status', 'failure'] }, 1, 0] }
                        },
                        uniqueUsers: { $addToSet: '$userId' },
                        actionsBreakdown: {
                            $push: {
                                action: '$action',
                                count: 1
                            }
                        },
                        resourceBreakdown: {
                            $push: {
                                resource: '$resource',
                                count: 1
                            }
                        }
                    }
                },
                {
                    $project: {
                        totalLogs: 1,
                        successCount: 1,
                        failureCount: 1,
                        uniqueUserCount: { $size: '$uniqueUsers' },
                        topActions: {
                            $slice: [
                                {
                                    $sortArray: {
                                        input: '$actionsBreakdown',
                                        sortBy: { count: -1 }
                                    }
                                },
                                0,
                                10
                            ]
                        },
                        topResources: {
                            $slice: [
                                {
                                    $sortArray: {
                                        input: '$resourceBreakdown',
                                        sortBy: { count: -1 }
                                    }
                                },
                                0,
                                10
                            ]
                        }
                    }
                }
            ]);

            return statistics[0] || {
                totalLogs: 0,
                successCount: 0,
                failureCount: 0,
                uniqueUserCount: 0,
                topActions: [],
                topResources: []
            };
        } catch (error) {
            console.error('Failed to get audit statistics:', error);
            throw error;
        }
    }
}

module.exports = HODAuditService;
