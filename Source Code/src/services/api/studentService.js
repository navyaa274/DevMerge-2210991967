import apiClient from './apiClient';

/**
 * Student Management Service
 */
const normalizeStudentId = (studentRef) => {
    if (!studentRef) return '';
    if (typeof studentRef === 'string') return studentRef;
    return studentRef._id || studentRef.id || '';
};

const toError = (error, fallbackMessage) => {
    const message = error?.formattedMessage || error?.response?.data?.message || error?.message || fallbackMessage;
    return new Error(message);
};

const studentService = {
    // Get student profile and overview
    getProfileOverview: async () => {
        try {
            const response = await apiClient.get('/student/profile/overview');
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load profile overview');
        }
    },

    // Get student profile and overview (alias)
    getStudentProfile: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/profile/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load student profile');
        }
    },

    // Update student profile
    updateStudentProfile: async (studentId, profileData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.put(`/api/student/profile/${studentId}`, profileData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update student profile');
        }
    },

    // Academic Information
    getStudentAcademics: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/academics/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load academic information');
        }
    },

    getCurrentSemester: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/current-semester/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load current semester');
        }
    },

    getEnrolledCourses: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/api/student/courses/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load enrolled courses');
        }
    },

    getCourseDetails: async (courseId) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const response = await apiClient.get(`/student/course/${courseId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load course details');
        }
    },

    // Course Registration
    getAvailableCourses: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/available-courses/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load available courses');
        }
    },

    registerForCourse: async (studentId, courseId) => {
        try {
            if (!studentId || !courseId) throw new Error('Student ID and Course ID are required');
            const response = await apiClient.post('/student/course-registration', { studentId, courseId });
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to register for course');
        }
    },

    dropCourse: async (studentId, courseId) => {
        try {
            if (!studentId || !courseId) throw new Error('Student ID and Course ID are required');
            const response = await apiClient.delete(`/student/course-registration/${studentId}/${courseId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to drop course');
        }
    },

    // Assignments
    getAssignments: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/assignments/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load assignments');
        }
    },

    getAssignmentDetails: async (assignmentId) => {
        try {
            if (!assignmentId) throw new Error('Assignment ID is required');
            const response = await apiClient.get(`/student/assignment/${assignmentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load assignment details');
        }
    },

    submitAssignment: async (assignmentId, submissionData) => {
        try {
            if (!assignmentId) throw new Error('Assignment ID is required');
            const response = await apiClient.post(`/student/assignment/${assignmentId}/submit`, submissionData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to submit assignment');
        }
    },

    // Grades
    getGrades: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/grades/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load grades');
        }
    },

    getGPA: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/gpa/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load GPA');
        }
    },

    getTranscript: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/transcript/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load transcript');
        }
    },

    // Attendance
    getAttendanceRecords: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/attendance/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load attendance records');
        }
    },

    getAttendanceSummary: async (studentId, semesterId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = semesterId ? `?semesterId=${semesterId}` : '';
            const response = await apiClient.get(`/student/attendance-summary/${studentId}${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load attendance summary');
        }
    },

    // Exams
    getExams: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/exams/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load exams');
        }
    },

    getExamDetails: async (examId) => {
        try {
            if (!examId) throw new Error('Exam ID is required');
            const response = await apiClient.get(`/student/exam/${examId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load exam details');
        }
    },

    getExamResults: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/exam-results/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load exam results');
        }
    },

    // Schedule & Timetable
    getTimetable: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/timetable/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load timetable');
        }
    },

    getTodaySchedule: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/today-schedule/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load today\'s schedule');
        }
    },

    // Library & Resources
    getLibraryResources: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/library/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load library resources');
        }
    },

    getCourseMaterials: async (courseId) => {
        try {
            if (!courseId) throw new Error('Course ID is required');
            const response = await apiClient.get(`/student/course-materials/${courseId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load course materials');
        }
    },

    // Financial Information
    getFeeStructure: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/fees/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load fee structure');
        }
    },

    getPaymentHistory: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/payment-history/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load payment history');
        }
    },

    makePayment: async (paymentData) => {
        try {
            const response = await apiClient.post('/student/payment', paymentData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to process payment');
        }
    },

    // Scholarships & Financial Aid
    getScholarships: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/scholarships/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load scholarships');
        }
    },

    applyForScholarship: async (studentId, scholarshipData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.post(`/student/scholarships/${studentId}/apply`, scholarshipData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to apply for scholarship');
        }
    },

    // Hostel & Accommodation
    getHostelInfo: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/hostel/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load hostel information');
        }
    },

    applyForHostel: async (studentId, hostelData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.post(`/student/hostel/${studentId}/apply`, hostelData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to apply for hostel');
        }
    },

    // Notifications & Communications
    getNotifications: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/notifications/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load notifications');
        }
    },

    markNotificationRead: async (notificationId) => {
        try {
            if (!notificationId) throw new Error('Notification ID is required');
            const response = await apiClient.put(`/student/notifications/${notificationId}/read`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to mark notification as read');
        }
    },

    getAnnouncements: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/announcements/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load announcements');
        }
    },

    // Leave & Permissions
    getLeaveRequests: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/leave/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load leave requests');
        }
    },

    submitLeaveRequest: async (studentId, leaveData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.post(`/api/student/leave/${studentId}`, leaveData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to submit leave request');
        }
    },

    // Progress & Analytics
    getAcademicProgress: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/academic-progress/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load academic progress');
        }
    },

    getPerformanceAnalytics: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/performance/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load performance analytics');
        }
    },

    getLearningAnalytics: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/learning-analytics/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load learning analytics');
        }
    },

    // Career Services
    getCareerServices: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/career/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load career services');
        }
    },

    getInternships: async (studentId, filters = {}) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/internships/${studentId}?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load internships');
        }
    },

    applyForInternship: async (studentId, internshipData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.post(`/student/internships/${studentId}/apply`, internshipData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to apply for internship');
        }
    },

    // Feedback & Surveys
    getFeedbackForms: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/feedback/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load feedback forms');
        }
    },

    submitFeedback: async (studentId, feedbackData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.post(`/api/student/feedback/${studentId}`, feedbackData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to submit feedback');
        }
    },

    // Documents & Certificates
    getDocuments: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/documents/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load documents');
        }
    },

    uploadDocument: async (studentId, documentData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.post(`/student/documents/${studentId}`, documentData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to upload document');
        }
    },

    requestCertificate: async (studentId, certificateData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.post(`/student/certificates/${studentId}`, certificateData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to request certificate');
        }
    },

    // Support & Help
    getSupportTickets: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/support/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load support tickets');
        }
    },

    createSupportTicket: async (studentId, ticketData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.post(`/api/student/support/${studentId}`, ticketData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to create support ticket');
        }
    },

    // Enhanced features API calls
    getCalendarEvents: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/calendar/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load calendar events');
        }
    },

    getMessages: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/messages/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load messages');
        }
    },

    getAnalytics: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/analytics/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load analytics');
        }
    },

    getCertificates: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/certificates/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load certificates');
        }
    },

    getLearningPaths: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/learning-paths/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load learning paths');
        }
    },

    getCollaborations: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/collaborations/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load collaborations');
        }
    },

    getLibraryBooks: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/library/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load library books');
        }
    },

    getAchievements: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/achievements/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load achievements');
        }
    },

    getRealtimeNotifications: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/api/student/realtime-notifications/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load realtime notifications');
        }
    },
    getSettings: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/settings/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load settings');
        }
    },

    updateSettings: async (studentId, settingsData) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.put(`/student/settings/${studentId}`, settingsData);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to update settings');
        }
    },

    // Gamification & Achievements
    getAchievements: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/achievements/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load achievements');
        }
    },

    getUserPoints: async (studentId) => {
        try {
            if (!studentId) throw new Error('Student ID is required');
            const response = await apiClient.get(`/student/points/${studentId}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load user points');
        }
    },

    getLeaderboard: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await apiClient.get(`/student/leaderboard?${queryParams}`);
            return response.data;
        } catch (error) {
            throw toError(error, 'Failed to load leaderboard');
        }
    }
};

export default studentService;
