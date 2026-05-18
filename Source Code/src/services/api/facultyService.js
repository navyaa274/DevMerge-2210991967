import apiClient from './apiClient';

/**
 * Faculty Management Service
 */
const normalizeFacultyId = (facultyRef) => {
    if (!facultyRef) return '';
    if (typeof facultyRef === 'string') return facultyRef;
    return facultyRef._id || facultyRef.id || '';
};

const toError = (error, fallbackMessage) => {
    const message = error?.formattedMessage || error?.response?.data?.message || error?.message || fallbackMessage;
    return new Error(message);
};

const facultyService = {
    // Get faculty profile and overview
    getFacultyProfile: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/profile/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load faculty profile');
        }
    },

    // Update faculty profile
    updateFacultyProfile: async (facultyId, profileData) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.put(`/api/faculty/profile/${facultyId}`, profileData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update faculty profile');
        }
    },

    // Get faculty courses
    getFacultyCourses: async (facultyId, filters = {}) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/courses/${facultyId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load faculty courses');
        }
    },

    getAssignedCourses: async (facultyId) => {
        return facultyService.getFacultyCourses(facultyId);
    },

    // Get faculty schedule
    getFacultySchedule: async (facultyId, filters = {}) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/schedule/${facultyId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load faculty schedule');
        }
    },

    // Get faculty workload
    getFacultyWorkload: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/workload/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load faculty workload');
        }
    },

    // Get faculty performance metrics
    getFacultyPerformance: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/performance/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load faculty performance');
        }
    },

    // Course Management
    getCourseDetails: async (courseId) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const response = await apiClient.get(`/api/faculty/course/${courseId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load course details');
        }
    },

    updateCourseDetails: async (courseId, courseData) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const response = await apiClient.put(`/api/faculty/course/${courseId}`, courseData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update course details');
        }
    },

    // Assignment Management
    getAssignments: async (courseId, filters = {}) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/assignments/${courseId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load assignments');
        }
    },

    createAssignment: async (assignmentData) => {
        try {
            const response = await apiClient.post('/api/faculty/assignments', assignmentData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to create assignment');
        }
    },

    updateAssignment: async (assignmentId, assignmentData) => {
        try {
            if (!assignmentId) throw new Error('Assignment ID is required');
            const response = await apiClient.put(`/api/faculty/assignments/${assignmentId}`, assignmentData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update assignment');
        }
    },

    deleteAssignment: async (assignmentId) => {
        try {
            if (!assignmentId) throw new Error('Assignment ID is required');
            const response = await apiClient.delete(`/api/faculty/assignments/${assignmentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to delete assignment');
        }
    },

    // Student Management
    getCourseStudents: async (courseId, filters = {}) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/students/${courseId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load course students');
        }
    },

    getStudentGrades: async (courseId, studentId) => {
        try {
            if (!courseId || !studentId) throw new Error('Course ID and Student ID are required');
            const response = await apiClient.get(`/api/faculty/grades/${courseId}/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load student grades');
        }
    },

    updateStudentGrades: async (courseId, studentId, gradesData) => {
        try {
            if (!courseId || !studentId) throw new Error('Course ID and Student ID are required');
            const response = await apiClient.put(`/api/faculty/grades/${courseId}/${studentId}`, gradesData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update student grades');
        }
    },

    // Attendance Management
    getAttendanceRecords: async (courseId, filters = {}) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/attendance/${courseId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load attendance records');
        }
    },

    markAttendance: async (attendanceData) => {
        try {
            const response = await apiClient.post('/api/faculty/attendance', attendanceData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to mark attendance');
        }
    },

    updateAttendance: async (attendanceId, attendanceData) => {
        try {
            if (!attendanceId) throw new Error('Attendance ID is required');
            const response = await apiClient.put(`/api/faculty/attendance/${attendanceId}`, attendanceData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update attendance');
        }
    },

    // Exam Management
    getExams: async (courseId, filters = {}) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/exams/${courseId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load exams');
        }
    },

    createExam: async (examData) => {
        try {
            const response = await apiClient.post('/api/faculty/exams', examData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to create exam');
        }
    },

    updateExam: async (examId, examData) => {
        try {
            if (!examId) throw new Error('Exam ID is required');
            const response = await apiClient.put(`/api/faculty/exams/${examId}`, examData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update exam');
        }
    },

    deleteExam: async (examId) => {
        try {
            if (!examId) throw new Error('Exam ID is required');
            const response = await apiClient.delete(`/api/faculty/exams/${examId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to delete exam');
        }
    },

    // Grade Management
    getExamGrades: async (examId) => {
        try {
            if (!examId) throw new Error('Exam ID is required');
            const response = await apiClient.get(`/api/faculty/exam-grades/${examId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load exam grades');
        }
    },

    submitExamGrades: async (examId, gradesData) => {
        try {
            if (!examId) throw new Error('Exam ID is required');
            const response = await apiClient.post(`/api/faculty/exam-grades/${examId}`, gradesData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to submit exam grades');
        }
    },

    // Communication
    sendCourseAnnouncement: async (courseId, announcementData) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const response = await apiClient.post(`/api/faculty/announcements/${courseId}`, announcementData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to send announcement');
        }
    },

    getCourseAnnouncements: async (courseId, filters = {}) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/announcements/${courseId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load announcements');
        }
    },

    // Office Hours
    getOfficeHours: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/office-hours/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load office hours');
        }
    },

    updateOfficeHours: async (facultyId, officeHoursData) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.put(`/api/faculty/office-hours/${facultyId}`, officeHoursData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update office hours');
        }
    },

    // Research & Publications
    getResearchProfile: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/research/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load research profile');
        }
    },

    addPublication: async (facultyId, publicationData) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.post(`/api/faculty/publications/${facultyId}`, publicationData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to add publication');
        }
    },

    // Enhanced features API calls
    getCalendarEvents: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/calendar/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load calendar events');
        }
    },

    getMessages: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/messages/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load messages');
        }
    },

    getAnalytics: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/analytics/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load analytics');
        }
    },

    getGradebook: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/gradebook/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load gradebook');
        }
    },

    getClassRoster: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/roster/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load class roster');
        }
    },

    getAttendanceTracking: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/attendance-tracking/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load attendance tracking');
        }
    },

    getSyllabusManagement: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/syllabus/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load syllabus management');
        }
    },

    getAiAssistant: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/ai-assistant/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load AI assistant');
        }
    },

    getPerformanceMetrics: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/performance-metrics/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load performance metrics');
        }
    },

    getBulkOperations: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/bulk-operations/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load bulk operations');
        }
    },

    // Analytics & Reports
    getCourseAnalytics: async (courseId) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const response = await apiClient.get(`/api/faculty/analytics/course/${courseId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load course analytics');
        }
    },

    getStudentProgress: async (courseId, filters = {}) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/student-progress/${courseId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load student progress');
        }
    },

    generateReport: async (reportType, filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/reports/${reportType}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to generate report');
        }
    },

    // Leave Management
    getLeaveRequests: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/leave/${facultyId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load leave requests');
        }
    },

    submitLeaveRequest: async (leaveData) => {
        try {
            const response = await apiClient.post('/api/faculty/leave', leaveData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to submit leave request');
        }
    },

    // Notifications
    getNotifications: async (facultyId, filters = {}) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/faculty/notifications/${facultyId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load notifications');
        }
    },

    markNotificationRead: async (notificationId) => {
        try {
            if (!notificationId) throw new Error('Notification ID is required');
            const response = await apiClient.put(`/api/faculty/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to mark notification as read');
        }
    },

    // Cognitive visualizer & Advanced Insights
    getGlobalCourseInsights: async (courseId) => {
        try {
            const response = await apiClient.get(`/api/faculty/dashboard/${courseId}/insights`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load global course insights');
        }
    },

    getCourseCalibration: async (courseId) => {
        try {
            const response = await apiClient.get(`/api/faculty/dashboard/${courseId}/calibration`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load course calibration');
        }
    },

    getSynergyGroups: async (courseId, groupSize = 4) => {
        try {
            const response = await apiClient.get(`/api/faculty/dashboard/${courseId}/synergy?groupSize=${groupSize}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load synergy groups');
        }
    },

    generateSmartCohort: async (heuristic, groupSize, courseId) => {
        // Map frontend params to synergy endpoint
        const data = await facultyService.getSynergyGroups(courseId, groupSize);
        // Transform backend response to what SmartCohort.jsx expects if needed
        // Backend returns: { success: true, data: { groups: [...], leftovers: [...] } }
        // SmartCohort.jsx expects: { success: true, cohorts: [...] }
        return {
            success: data.success,
            cohorts: data.data?.groups?.map(g => ({
                name: g.teamName,
                matchScore: g.synergyScore,
                synergy: g.description,
                students: g.members?.map(m => ({
                    id: m,
                    name: "Student " + m.slice(-4),
                    role: "Member",
                    rating: 85 // Mock
                })) || []
            })) || []
        };
    },

    getCognitiveTelemetry: async () => {
        try {
            // This is a global telemetry endpoint for all active labs
            const response = await apiClient.get('/api/faculty/telemetry/cognitive');
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load cognitive telemetry');
        }
    },

    checkQuestHistoryAvailability: async () => {
        try {
            const response = await apiClient.get('/api/faculty/quests/check');
            return response.data.available;
        } catch (e) {
            return false;
        }
    },

    deployZeroDayQuest: async (questData) => {
        try {
            const response = await apiClient.post('/api/faculty/quests/deploy', questData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to deploy quest');
        }
    },

    getQuestHistory: async () => {
        try {
            const response = await apiClient.get('/api/faculty/quests/history');
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load quest history');
        }
    },

    // Dashboard Stats
    getDashboardStats: async (facultyId) => {
        try {
            if (!facultyId) throw new Error('Faculty ID is required');
            const response = await apiClient.get(`/api/faculty/dashboard/${facultyId}/stats`);
            return response.data;
        } catch (error) {
            // Return mock data if API fails
            return {
                success: true,
                data: {
                    totalCourses: 0,
                    totalStudents: 0,
                    pendingAssignments: 0,
                    upcomingClasses: 0
                }
            };
        }
    },

    // Get Active Academic Year
    getActiveYear: async () => {
        try {
            const response = await apiClient.get('/api/academic/active-year');
            return response.data;
        } catch (error) {
            // Return mock data if API fails
            return {
                success: true,
                data: {
                    year: new Date().getFullYear(),
                    semester: 'Fall',
                    isActive: true
                }
            };
        }
    }
};

export default facultyService;
