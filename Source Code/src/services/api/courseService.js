import apiClient from './apiClient';

/**
 * Course and Enrollment Service
 * Silently handles errors and returns empty data for graceful degradation
 */
const courseService = {
    getStudentEnrollments: async (userId) => {
        try {
            const response = await apiClient.get('/courses');
            const courses = response.data?.data || [];
            const enrollments = courses.map(c => ({
                _id: c._id,
                courseId: c,
                semesterId: c.semesterId || { semesterNumber: c.semesterNumber }
            }));
            return { data: enrollments };
        } catch (error) {
            throw error;
        }
    },

    // Get course details
    getCourseDetails: async (courseId) => {
        try {
            const response = await apiClient.get(`/courses/${courseId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get course materials - suppress 404 errors
    getCourseMaterials: async (courseId) => {
        try {
            const response = await apiClient.get(`/course-materials/course/${courseId}`);
            if (response.status >= 200 && response.status < 300 && response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
                return response.data;
            }
            return { data: [] };
        } catch (error) {
            throw error;
        }
    },

    // Get all courses (admin/faculty)
    getAllCourses: async (params) => {
        try {
            const response = await apiClient.get('/courses', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default courseService;
