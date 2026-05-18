import apiClient from './apiClient';
import { ENDPOINTS } from '../../config/urls';

/**
 * HOD (Head of Department) Management Service
 */
const normalizeDepartmentId = (deptRef) => {
    if (!deptRef) return '';
    if (typeof deptRef === 'string') return deptRef;
    return deptRef._id || deptRef.id || '';
};

const toError = (error, fallbackMessage) => {
    const message = error?.formattedMessage || error?.response?.data?.message || error?.message || fallbackMessage;
    return new Error(message);
};

const hodService = {
    // Get department overview including critical rates and totals
    getDepartmentOverview: async (deptRef) => {
        try {
            const deptId = normalizeDepartmentId(deptRef);
            if (!deptId) return { success: true, data: {} };
            const response = await apiClient.get(ENDPOINTS.INSTITUTIONAL.DEPARTMENT_OVERVIEW(deptId));
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load department overview');
        }
    },

    // Get cognitive load indicators for department students
    getCognitiveLoadData: async (deptRef) => {
        try {
            const deptId = normalizeDepartmentId(deptRef);
            if (!deptId) return { success: true, data: [] };
            const response = await apiClient.get(ENDPOINTS.INSTITUTIONAL.COG_LOAD(deptId));
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load cognitive load data');
        }
    },

    // Get operational efficiency metrics for department
    getEfficiencyMetrics: async (deptRef) => {
        try {
            const deptId = normalizeDepartmentId(deptRef);
            if (!deptId) return { success: true, data: {} };
            const response = await apiClient.get(ENDPOINTS.INSTITUTIONAL.EFFICIENCY(deptId));
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load efficiency metrics');
        }
    },

    // Get accreditation and attainment report for department
    getAccreditationData: async (deptRef) => {
        try {
            const deptId = normalizeDepartmentId(deptRef);
            if (!deptId) return { success: true, data: {} };
            const response = await apiClient.get(ENDPOINTS.INSTITUTIONAL.ACCREDITATION(deptId));
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load accreditation data');
        }
    },

    // Get faculty performance rankings for department
    getFacultyPerformance: async (deptRef) => {
        try {
            const deptId = normalizeDepartmentId(deptRef);
            if (!deptId) return { success: true, data: [] };
            const response = await apiClient.get(ENDPOINTS.INSTITUTIONAL.FACULTY_PERFORMANCE(deptId));
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load faculty performance');
        }
    },

    // Get departmental courses with faculty mappings
    getDepartmentCourses: async (deptRef) => {
        try {
            const deptId = normalizeDepartmentId(deptRef);
            if (!deptId) return { success: true, data: [] };
            const response = await apiClient.get(ENDPOINTS.INSTITUTIONAL.DEPARTMENT_COURSES(deptId));
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load department courses');
        }
    },

    // Get workload comparison across all faculty in a department
    getWorkloadDistribution: async (deptRef) => {
        try {
            const deptId = normalizeDepartmentId(deptRef);
            if (!deptId) return { success: true, data: { workloadDistribution: [] } };
            const response = await apiClient.get(ENDPOINTS.INSTITUTIONAL.WORKLOAD_DISTRIBUTION(deptId));
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load workload distribution');
        }
    },

    // Department Settings Management
    getDepartmentSettings: async (departmentId) => {
        try {
            if (!departmentId) throw new Error('Department ID is required');
            const response = await apiClient.get(`/api/hod/department-settings/${departmentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load department settings');
        }
    },

    updateDepartmentSettings: async (departmentId, settings) => {
        try {
            if (!departmentId) throw new Error('Department ID is required');
            const response = await apiClient.put(`/api/hod/department-settings/${departmentId}`, settings);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update department settings');
        }
    },

    // Course Management
    getCourses: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/hod/courses?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load courses');
        }
    },

    createCourse: async (courseData) => {
        try {
            const response = await apiClient.post('/api/hod/courses', courseData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to create course');
        }
    },

    updateCourse: async (courseId, courseData) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const response = await apiClient.put(`/api/hod/courses/${courseId}`, courseData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update course');
        }
    },

    deleteCourse: async (courseId) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const response = await apiClient.delete(`/api/hod/courses/${courseId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to delete course');
        }
    },

    // Program Management
    getPrograms: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/hod/programs?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load programs');
        }
    },

    createProgram: async (programData) => {
        try {
            const response = await apiClient.post('/api/hod/programs', programData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to create program');
        }
    },

    updateProgram: async (programId, programData) => {
        try {
            if (!programId) throw new Error('Program ID is required');
            const response = await apiClient.put(`/api/hod/programs/${programId}`, programData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update program');
        }
    },

    deleteProgram: async (programId) => {
        try {
            if (!programId) throw new Error('Program ID is required');
            const response = await apiClient.delete(`/api/hod/programs/${programId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to delete program');
        }
    },

    // Department Management
    getDepartments: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/hod/departments?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load departments');
        }
    },

    createDepartment: async (departmentData) => {
        try {
            const response = await apiClient.post('/api/hod/departments', departmentData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to create department');
        }
    },

    updateDepartment: async (departmentId, departmentData) => {
        try {
            if (!departmentId) throw new Error('Department ID is required');
            const response = await apiClient.put(`/api/hod/departments/${departmentId}`, departmentData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update department');
        }
    },

    deleteDepartment: async (departmentId) => {
        try {
            if (!departmentId) throw new Error('Department ID is required');
            const response = await apiClient.delete(`/api/hod/departments/${departmentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to delete department');
        }
    },

    // Section Management
    getSections: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/hod/sections?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load sections');
        }
    },

    createSection: async (sectionData) => {
        try {
            const response = await apiClient.post('/api/hod/sections', sectionData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to create section');
        }
    },

    updateSection: async (sectionId, sectionData) => {
        try {
            if (!sectionId) throw new Error('Section ID is required');
            const response = await apiClient.put(`/api/hod/sections/${sectionId}`, sectionData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update section');
        }
    },

    deleteSection: async (sectionId) => {
        try {
            if (!sectionId) throw new Error('Section ID is required');
            const response = await apiClient.delete(`/api/hod/sections/${sectionId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to delete section');
        }
    },

    // Auto-assign students to sections
    autoAssignStudents: async (semesterId, config = {}) => {
        try {
            if (!semesterId) throw new Error('Semester ID is required');
            const response = await apiClient.post('/api/hod/sections/auto-assign', { semesterId, config });
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to auto-assign students');
        }
    },

    // Faculty Assignment
    assignFaculty: async (assignmentData) => {
        try {
            const response = await apiClient.post('/api/hod/faculty-assignment', assignmentData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to assign faculty');
        }
    },

    // Course Approvals
    getCourseApprovals: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/hod/course-approvals?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load course approvals');
        }
    },

    // Audit Logs
    getAuditLogs: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/hod/audit-logs?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load audit logs');
        }
    },

    getAuditStatistics: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/hod/audit-statistics?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load audit statistics');
        }
    },

    // Broadcast System
    getBroadcastStats: async () => {
        try {
            const response = await apiClient.get('/api/hod/broadcast-stats');
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load broadcast statistics');
        }
    },

    sendBroadcast: async (broadcastData) => {
        try {
            const response = await apiClient.post('/api/hod/broadcast', broadcastData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to send broadcast');
        }
    },

    getBroadcastHistory: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/hod/broadcast-history?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load broadcast history');
        }
    },

    // Gamification
    getGamificationConfig: async () => {
        try {
            const response = await apiClient.get('/api/hod/gamification-config');
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load gamification configuration');
        }
    },

    updateGamificationMultiplier: async (multiplierData) => {
        try {
            const response = await apiClient.post('/api/hod/gamification-multiplier', multiplierData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update gamification multiplier');
        }
    },

    // Department Stats (existing)
    getDepartmentStats: async (departmentId) => {
        try {
            if (!departmentId) throw new Error('Department ID is required');
            const response = await apiClient.get('/api/hod/department-stats');
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load department statistics');
        }
    },

    // Faculty Load (existing)
    getFacultyLoad: async (departmentId) => {
        try {
            if (!departmentId) throw new Error('Department ID is required');
            const response = await apiClient.get('/api/hod/faculty-load');
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load faculty load');
        }
    }
};

export default hodService;
