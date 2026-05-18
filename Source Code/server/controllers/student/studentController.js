const mongoose = require('mongoose');
const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const Assignment = require('../../models/academic/Assignment');
const Exam = require('../../models/academic/Exam');
const Attendance = require('../../models/academic/Attendance');
const Grade = require('../../models/academic/Grade');
const Announcement = require('../../models/communication/Announcement');
const Notification = require('../../models/communication/Notification');
const LeaveRequest = require('../../models/admin/LeaveRequest');
const Scholarship = require('../../models/admin/Scholarship');
const Payment = require('../../models/admin/Payment');
const SupportTicket = require('../../models/admin/SupportTicket');
const Feedback = require('../../models/admin/Feedback');
const Document = require('../../models/admin/Document');
const Certificate = require('../../models/admin/Certificate');

/**
 * Get Student Profile
 * @access Private/Student
 */
exports.getStudentProfile = async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            // Development mode - mock profile
            const { studentId } = req.params;
            const requestingUser = req.user;
            
            // Mock student data
            const mockStudent = {
                id: studentId || requestingUser?._id || 'dev_user_123',
                name: requestingUser?.name || 'Development Student',
                email: requestingUser?.email || 'student@example.com',
                studentId: 'DEV2024001',
                program: { name: 'Computer Science', code: 'CS', degreeType: 'Bachelor' },
                department: { name: 'Computer Science', code: 'CS' },
                semester: { semesterNumber: 4, academicYear: '2024' },
                phone: '+1234567890',
                address: '123 Dev Street, Test City',
                dateOfBirth: '2000-01-01',
                gender: 'Other',
                nationality: 'Developer',
                enrollmentDate: '2020-09-01',
                isActive: true
            };

            return res.status(200).json({
                success: true,
                data: { student: mockStudent },
                devMode: true
            });
        }

        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own profile
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own profile' });
        }

        const student = await User.findById(studentId)
            .populate('program', 'name code degreeType')
            .populate('department', 'name code')
            .populate('semester', 'semesterNumber academicYear')
            .select('-password -__v');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    studentId: student.studentId,
                    program: student.program,
                    department: student.department,
                    semester: student.semester,
                    phone: student.phone,
                    address: student.address,
                    dateOfBirth: student.dateOfBirth,
                    gender: student.gender,
                    nationality: student.nationality,
                    enrollmentDate: student.enrollmentDate,
                    isActive: student.isActive
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Student Profile
 * @access Private/Student
 */
exports.updateStudentProfile = async (req, res) => {
    try {
        const { studentId } = req.params;
        const updates = req.body;
        const requestingUser = req.user;

        // Student can only update their own profile
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only update your own profile' });
        }

        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Student can only update certain fields
        const allowedFields = ['name', 'email', 'phone', 'address'];
        const filteredUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        Object.assign(student, filteredUpdates);
        await student.save();

        await student.populate('program', 'name code degreeType');
        await student.populate('department', 'name code');
        await student.populate('semester', 'semesterNumber academicYear');

        res.status(200).json({
            success: true,
            message: 'Student profile updated successfully',
            data: {
                student: {
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    studentId: student.studentId,
                    program: student.program,
                    department: student.department,
                    semester: student.semester,
                    phone: student.phone,
                    address: student.address,
                    dateOfBirth: student.dateOfBirth,
                    gender: student.gender,
                    nationality: student.nationality,
                    enrollmentDate: student.enrollmentDate,
                    isActive: student.isActive
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Student Academics
 * @access Private/Student
 */
exports.getStudentAcademics = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own academics
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own academics' });
        }

        const student = await User.findById(studentId)
            .populate('program', 'name code degreeType duration')
            .populate('department', 'name code')
            .populate('semester', 'semesterNumber academicYear');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get enrolled courses and grades
        const enrolledCourses = await Course.find({ students: studentId })
            .populate('faculty', 'name email')
            .select('name code credits semester faculty');

        const grades = await Grade.find({ student: studentId })
            .populate('course', 'name code credits')
            .populate('assignment', 'title totalPoints')
            .populate('exam', 'title totalPoints')
            .sort({ createdAt: -1 });

        // Calculate GPA
        const totalGradePoints = grades.reduce((sum, grade) => {
            const gradeValue = getGradeValue(grade.grade);
            return sum + (gradeValue * (grade.course?.credits || 1));
        }, 0);

        const totalCredits = grades.reduce((sum, grade) => sum + (grade.course?.credits || 1), 0);
        const currentGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                academics: {
                    program: student.program,
                    department: student.department,
                    currentSemester: student.semester,
                    enrolledCourses: enrolledCourses.map(course => ({
                        id: course._id,
                        name: course.name,
                        code: course.code,
                        credits: course.credits,
                        semester: course.semester,
                        faculty: course.faculty
                    })),
                    grades: grades.map(grade => ({
                        id: grade._id,
                        course: grade.course,
                        assignment: grade.assignment,
                        exam: grade.exam,
                        grade: grade.grade,
                        score: grade.score,
                        totalPoints: grade.totalPoints,
                        percentage: grade.percentage,
                        feedback: grade.feedback,
                        gradedAt: grade.gradedAt
                    })),
                    currentGPA: parseFloat(currentGPA),
                    totalCredits,
                    completedCourses: enrolledCourses.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Current Semester
 * @access Private/Student
 */
exports.getCurrentSemester = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own semester
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own semester' });
        }

        const student = await User.findById(studentId)
            .populate('semester')
            .populate('program', 'name code');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                semester: {
                    id: student.semester._id,
                    semesterNumber: student.semester.semesterNumber,
                    academicYear: student.semester.academicYear,
                    startDate: student.semester.startDate,
                    endDate: student.semester.endDate,
                    program: student.program
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Enrolled Courses
 * @access Private/Student
 */
exports.getEnrolledCourses = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, search, semester } = req.query;
        const requestingUser = req.user;

        // Student can only view their own courses
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own courses' });
        }

        let query = { students: studentId, isActive: true };

        if (semester) {
            query.semester = parseInt(semester);
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const courses = await Course.find(query)
            .populate('department', 'name code')
            .populate('program', 'name code')
            .populate('faculty', 'name email')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Course.countDocuments(query);

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
                    department: course.department,
                    program: course.program,
                    faculty: course.faculty,
                    isActive: course.isActive
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
 * Get Course Details
 * @access Private/Student
 */
exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const requestingUser = req.user;

        const course = await Course.findById(courseId)
            .populate('department', 'name code')
            .populate('program', 'name code')
            .populate('faculty', 'name email')
            .populate('sections', 'name room schedule');

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if student is enrolled in this course
        if (requestingUser.role === 'student' && !course.students.includes(requestingUser._id)) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not enrolled in this course' });
        }

        res.status(200).json({
            success: true,
            data: {
                course: {
                    id: course._id,
                    name: course.name,
                    code: course.code,
                    credits: course.credits,
                    semester: course.semester,
                    courseType: course.courseType,
                    description: course.description,
                    department: course.department,
                    program: course.program,
                    faculty: course.faculty,
                    sections: course.sections,
                    curriculum: course.curriculum,
                    assessment: course.assessment,
                    isActive: course.isActive
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Available Courses
 * @access Private/Student
 */
exports.getAvailableCourses = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, search, semester } = req.query;
        const requestingUser = req.user;

        // Student can only view available courses for themselves
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view available courses for yourself' });
        }

        const student = await User.findById(studentId).select('program semester');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        let query = { 
            program: student.program,
            semester: student.semester,
            isActive: true,
            students: { $ne: studentId } // Exclude already enrolled courses
        };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const courses = await Course.find(query)
            .populate('department', 'name code')
            .populate('faculty', 'name email')
            .sort({ name: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Course.countDocuments(query);

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
                    department: course.department,
                    faculty: course.faculty,
                    description: course.description
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
 * Register for Course
 * @access Private/Student
 */
exports.registerForCourse = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        const requestingUser = req.user;

        // Student can only register themselves
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only register yourself for courses' });
        }

        const [student, course] = await Promise.all([
            User.findById(studentId),
            Course.findById(courseId)
        ]);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if student is already enrolled
        if (course.students.includes(studentId)) {
            return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
        }

        // Check course capacity
        if (course.students.length >= course.capacity) {
            return res.status(400).json({ success: false, message: 'Course is full' });
        }

        // Add student to course
        course.students.push(studentId);
        await course.save();

        // Create notification for faculty
        await Notification.create({
            recipient: course.faculty,
            type: 'course_registration',
            title: 'New Student Registration',
            message: `${student.name} has registered for ${course.name}`,
            relatedId: courseId,
            relatedType: 'Course'
        });

        res.status(200).json({
            success: true,
            message: 'Successfully registered for course',
            data: {
                course: {
                    id: course._id,
                    name: course.name,
                    code: course.code
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Drop Course
 * @access Private/Student
 */
exports.dropCourse = async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        const requestingUser = req.user;

        // Student can only drop themselves from courses
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only drop yourself from courses' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if student is enrolled
        if (!course.students.includes(studentId)) {
            return res.status(400).json({ success: false, message: 'Not enrolled in this course' });
        }

        // Remove student from course
        course.students = course.students.filter(id => id.toString() !== studentId);
        await course.save();

        res.status(200).json({
            success: true,
            message: 'Successfully dropped from course',
            data: {
                course: {
                    id: course._id,
                    name: course.name,
                    code: course.code
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Assignments
 * @access Private/Student
 */
exports.getAssignments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, search, status } = req.query;
        const requestingUser = req.user;

        // Student can only view their own assignments
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own assignments' });
        }

        // Get student's enrolled courses
        const enrolledCourses = await Course.find({ students: studentId }).select('_id');
        const courseIds = enrolledCourses.map(course => course._id);

        let query = { course: { $in: courseIds } };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const assignments = await Assignment.find(query)
            .populate('course', 'name code')
            .sort({ dueDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Assignment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                assignments: assignments.map(assignment => ({
                    id: assignment._id,
                    title: assignment.title,
                    description: assignment.description,
                    course: assignment.course,
                    dueDate: assignment.dueDate,
                    totalPoints: assignment.totalPoints,
                    status: assignment.status,
                    submissions: assignment.submissions,
                    createdAt: assignment.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAssignments: total,
                    hasMore: skip + assignments.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Assignment Details
 * @access Private/Student
 */
exports.getAssignmentDetails = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const requestingUser = req.user;

        const assignment = await Assignment.findById(assignmentId)
            .populate('course', 'name code students')
            .populate('submissions.student', 'name email studentId');

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Check if student is enrolled in the course
        if (requestingUser.role === 'student' && !assignment.course.students.includes(requestingUser._id)) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not enrolled in this course' });
        }

        // Find student's submission
        const studentSubmission = assignment.submissions.find(
            sub => sub.student._id.toString() === requestingUser._id.toString()
        );

        res.status(200).json({
            success: true,
            data: {
                assignment: {
                    id: assignment._id,
                    title: assignment.title,
                    description: assignment.description,
                    course: assignment.course,
                    dueDate: assignment.dueDate,
                    totalPoints: assignment.totalPoints,
                    status: assignment.status,
                    submission: studentSubmission || null,
                    createdAt: assignment.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Submit Assignment
 * @access Private/Student
 */
exports.submitAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { submittedAt, content, attachments } = req.body;
        const requestingUser = req.user;

        const assignment = await Assignment.findById(assignmentId).populate('course');
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Check if student is enrolled in the course
        if (requestingUser.role === 'student' && !assignment.course.students.includes(requestingUser._id)) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not enrolled in this course' });
        }

        // Check if assignment is already submitted
        const existingSubmission = assignment.submissions.find(
            sub => sub.student.toString() === requestingUser._id.toString()
        );

        if (existingSubmission) {
            return res.status(400).json({ success: false, message: 'Assignment already submitted' });
        }

        // Add submission
        const submission = {
            student: requestingUser._id,
            submittedAt: new Date(submittedAt),
            content,
            attachments: attachments || []
        };

        assignment.submissions.push(submission);
        await assignment.save();

        // Create notification for faculty
        await Notification.create({
            recipient: assignment.course.faculty,
            type: 'assignment_submission',
            title: 'New Assignment Submission',
            message: `${requestingUser.name} has submitted ${assignment.title}`,
            relatedId: assignmentId,
            relatedType: 'Assignment'
        });

        res.status(200).json({
            success: true,
            message: 'Assignment submitted successfully',
            data: {
                submission: {
                    student: submission.student,
                    submittedAt: submission.submittedAt,
                    content: submission.content,
                    attachments: submission.attachments
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Grades
 * @access Private/Student
 */
exports.getGrades = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, semester, courseId } = req.query;
        const requestingUser = req.user;

        // Student can only view their own grades
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own grades' });
        }

        let query = { student: studentId };

        if (courseId) {
            query.course = courseId;
        }

        if (semester) {
            // Need to join with courses to filter by semester
            const courses = await Course.find({ semester: parseInt(semester) }).select('_id');
            const courseIds = courses.map(course => course._id);
            query.course = { $in: courseIds };
        }

        const skip = (page - 1) * limit;
        const grades = await Grade.find(query)
            .populate('course', 'name code semester credits')
            .populate('assignment', 'title totalPoints')
            .populate('exam', 'title totalPoints')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Grade.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                grades: grades.map(grade => ({
                    id: grade._id,
                    course: grade.course,
                    assignment: grade.assignment,
                    exam: grade.exam,
                    grade: grade.grade,
                    score: grade.score,
                    totalPoints: grade.totalPoints,
                    percentage: grade.percentage,
                    feedback: grade.feedback,
                    gradedAt: grade.gradedAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalGrades: total,
                    hasMore: skip + grades.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get GPA
 * @access Private/Student
 */
exports.getGPA = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own GPA
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own GPA' });
        }

        const grades = await Grade.find({ student: studentId })
            .populate('course', 'credits')
            .sort({ createdAt: -1 });

        // Calculate GPA for each semester
        const semesterGPAs = {};
        let totalGradePoints = 0;
        let totalCredits = 0;

        grades.forEach(grade => {
            const gradeValue = getGradeValue(grade.grade);
            const credits = grade.course?.credits || 1;
            const semester = grade.course?.semester || 1;

            if (!semesterGPAs[semester]) {
                semesterGPAs[semester] = { gradePoints: 0, credits: 0 };
            }

            semesterGPAs[semester].gradePoints += gradeValue * credits;
            semesterGPAs[semester].credits += credits;

            totalGradePoints += gradeValue * credits;
            totalCredits += credits;
        });

        // Calculate GPA for each semester
        const semesterResults = Object.keys(semesterGPAs).map(semester => ({
            semester: parseInt(semester),
            gpa: semesterGPAs[semester].credits > 0 ? 
                (semesterGPAs[semester].gradePoints / semesterGPAs[semester].credits).toFixed(2) : 0,
            credits: semesterGPAs[semester].credits
        }));

        // Calculate cumulative GPA
        const cumulativeGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                gpa: {
                    currentGPA: parseFloat(cumulativeGPA),
                    totalCredits,
                    completedCourses: grades.length,
                    semesterGPAs: semesterResults.sort((a, b) => a.semester - b.semester)
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Transcript
 * @access Private/Student
 */
exports.getTranscript = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own transcript
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own transcript' });
        }

        const [student, grades] = await Promise.all([
            User.findById(studentId)
                .populate('program', 'name code degreeType')
                .populate('department', 'name code'),
            Grade.find({ student: studentId })
                .populate('course', 'name code semester credits')
                .populate('assignment', 'title totalPoints')
                .populate('exam', 'title totalPoints')
                .sort({ createdAt: -1 })
        ]);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Group grades by semester
        const transcript = {};
        let totalGradePoints = 0;
        let totalCredits = 0;

        grades.forEach(grade => {
            const semester = grade.course.semester;
            const gradeValue = getGradeValue(grade.grade);
            const credits = grade.course.credits;

            if (!transcript[semester]) {
                transcript[semester] = {
                    semester,
                    courses: [],
                    gradePoints: 0,
                    credits: 0
                };
            }

            transcript[semester].courses.push({
                courseName: grade.course.name,
                courseCode: grade.course.code,
                credits: credits,
                grade: grade.grade,
                gradeValue: gradeValue,
                assignment: grade.assignment,
                exam: grade.exam,
                gradedAt: grade.gradedAt
            });

            transcript[semester].gradePoints += gradeValue * credits;
            transcript[semester].credits += credits;

            totalGradePoints += gradeValue * credits;
            totalCredits += credits;
        });

        // Calculate GPA for each semester
        Object.keys(transcript).forEach(semester => {
            const sem = transcript[semester];
            sem.gpa = sem.credits > 0 ? (sem.gradePoints / sem.credits).toFixed(2) : 0;
        });

        const cumulativeGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                transcript: {
                    student: {
                        name: student.name,
                        studentId: student.studentId,
                        program: student.program,
                        department: student.department
                    },
                    cumulativeGPA: parseFloat(cumulativeGPA),
                    totalCredits,
                    semesters: Object.keys(transcript).sort((a, b) => a - b).map(key => transcript[key])
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Attendance Records
 * @access Private/Student
 */
exports.getAttendanceRecords = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, date, status, courseId } = req.query;
        const requestingUser = req.user;

        // Student can only view their own attendance
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own attendance' });
        }

        let query = { student: studentId };

        if (courseId) {
            query.course = courseId;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            query.date = { $gte: startDate, $lt: endDate };
        }

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const attendance = await Attendance.find(query)
            .populate('course', 'name code')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Attendance.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                attendance: attendance.map(record => ({
                    id: record._id,
                    course: record.course,
                    date: record.date,
                    status: record.status,
                    markedBy: record.markedBy,
                    notes: record.notes,
                    createdAt: record.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total,
                    hasMore: skip + attendance.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Attendance Summary
 * @access Private/Student
 */
exports.getAttendanceSummary = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { semesterId } = req.query;
        const requestingUser = req.user;

        // Student can only view their own attendance summary
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own attendance summary' });
        }

        let query = { student: studentId };

        if (semesterId) {
            // Get courses for this semester
            const courses = await Course.find({ semester: semesterId }).select('_id');
            const courseIds = courses.map(course => course._id);
            query.course = { $in: courseIds };
        }

        const attendance = await Attendance.find(query);
        
        const totalClasses = attendance.length;
        const attendedClasses = attendance.filter(record => record.status === 'present').length;
        const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

        res.status(200).json({
            success: true,
            data: {
                attendance: {
                    totalClasses,
                    attendedClasses,
                    percentage,
                    status: percentage >= 75 ? 'Good' : 'Poor'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Exams
 * @access Private/Student
 */
exports.getExams = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, search, status } = req.query;
        const requestingUser = req.user;

        // Student can only view their own exams
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own exams' });
        }

        // Get student's enrolled courses
        const enrolledCourses = await Course.find({ students: studentId }).select('_id');
        const courseIds = enrolledCourses.map(course => course._id);

        let query = { course: { $in: courseIds } };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const exams = await Exam.find(query)
            .populate('course', 'name code')
            .sort({ examDate: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Exam.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                exams: exams.map(exam => ({
                    id: exam._id,
                    title: exam.title,
                    description: exam.description,
                    course: exam.course,
                    examDate: exam.examDate,
                    duration: exam.duration,
                    totalPoints: exam.totalPoints,
                    status: exam.status,
                    createdAt: exam.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalExams: total,
                    hasMore: skip + exams.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Exam Details
 * @access Private/Student
 */
exports.getExamDetails = async (req, res) => {
    try {
        const { examId } = req.params;
        const requestingUser = req.user;

        const exam = await Exam.findById(examId)
            .populate('course', 'name code students')
            .populate('results.student', 'name email studentId');

        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        // Check if student is enrolled in the course
        if (requestingUser.role === 'student' && !exam.course.students.includes(requestingUser._id)) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not enrolled in this course' });
        }

        // Find student's result
        const studentResult = exam.results.find(
            result => result.student._id.toString() === requestingUser._id.toString()
        );

        res.status(200).json({
            success: true,
            data: {
                exam: {
                    id: exam._id,
                    title: exam.title,
                    description: exam.description,
                    course: exam.course,
                    examDate: exam.examDate,
                    duration: exam.duration,
                    totalPoints: exam.totalPoints,
                    status: exam.status,
                    result: studentResult || null,
                    createdAt: exam.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Exam Results
 * @access Private/Student
 */
exports.getExamResults = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, semester, courseId } = req.query;
        const requestingUser = req.user;

        // Student can only view their own exam results
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own exam results' });
        }

        let query = { 'results.student': studentId };

        if (courseId) {
            query.course = courseId;
        }

        if (semester) {
            // Need to join with courses to filter by semester
            const courses = await Course.find({ semester: parseInt(semester) }).select('_id');
            const courseIds = courses.map(course => course._id);
            query.course = { $in: courseIds };
        }

        const skip = (page - 1) * limit;
        const exams = await Exam.find(query)
            .populate('course', 'name code semester')
            .sort({ examDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Exam.countDocuments(query);

        // Extract student results
        const results = exams.map(exam => {
            const studentResult = exam.results.find(
                result => result.student.toString() === studentId
            );
            return {
                exam: {
                    id: exam._id,
                    title: exam.title,
                    course: exam.course,
                    examDate: exam.examDate,
                    totalPoints: exam.totalPoints,
                    status: exam.status
                },
                result: studentResult
            };
        });

        res.status(200).json({
            success: true,
            data: {
                results,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalResults: total,
                    hasMore: skip + results.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Timetable
 * @access Private/Student
 */
exports.getTimetable = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { weekStart, weekEnd } = req.query;
        const requestingUser = req.user;

        // Student can only view their own timetable
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own timetable' });
        }

        // Get student's enrolled courses
        const enrolledCourses = await Course.find({ students: studentId })
            .populate('sections', 'name schedule room')
            .populate('faculty', 'name email')
            .select('name code sections faculty');

        const timetable = [];
        
        enrolledCourses.forEach(course => {
            course.sections.forEach(section => {
                if (section.schedule) {
                    timetable.push({
                        courseName: course.name,
                        courseCode: course.code,
                        sectionName: section.name,
                        schedule: section.schedule,
                        room: section.room,
                        faculty: course.faculty,
                        type: 'lecture'
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                timetable: timetable.sort((a, b) => {
                    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    return dayOrder.indexOf(a.schedule.day) - dayOrder.indexOf(b.schedule.day);
                })
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Today's Schedule
 * @access Private/Student
 */
exports.getTodaySchedule = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own schedule
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own schedule' });
        }

        const today = new Date();
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDay = dayNames[today.getDay()];

        // Get student's enrolled courses
        const enrolledCourses = await Course.find({ students: studentId })
            .populate('sections', 'name schedule room')
            .populate('faculty', 'name email')
            .select('name code sections faculty');

        const todaySchedule = [];
        
        enrolledCourses.forEach(course => {
            course.sections.forEach(section => {
                if (section.schedule && section.schedule.day === todayDay) {
                    todaySchedule.push({
                        courseName: course.name,
                        courseCode: course.code,
                        sectionName: section.name,
                        schedule: section.schedule,
                        room: section.room,
                        faculty: course.faculty,
                        type: 'lecture'
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                schedule: todaySchedule.sort((a, b) => {
                    return a.schedule.startTime.localeCompare(b.schedule.startTime);
                })
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Notifications
 * @access Private/Student
 */
exports.getNotifications = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, read } = req.query;
        const requestingUser = req.user;

        // Student can only view their own notifications
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own notifications' });
        }

        let query = { recipient: studentId };

        if (read !== undefined) {
            query.read = read === 'true';
        }

        const skip = (page - 1) * limit;
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Notification.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                notifications: notifications.map(notification => ({
                    id: notification._id,
                    recipient: notification.recipient,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    read: notification.read,
                    relatedId: notification.relatedId,
                    relatedType: notification.relatedType,
                    createdAt: notification.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalNotifications: total,
                    hasMore: skip + notifications.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Mark Notification Read
 * @access Private/Student
 */
exports.markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const requestingUser = req.user;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Student can only mark their own notifications as read
        if (requestingUser.role === 'student' && notification.recipient.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only mark your own notifications as read' });
        }

        notification.read = true;
        notification.readAt = new Date();
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: {
                notification: {
                    id: notification._id,
                    read: notification.read,
                    readAt: notification.readAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Announcements
 * @access Private/Student
 */
exports.getAnnouncements = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const requestingUser = req.user;

        // Student can only view announcements for themselves
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view announcements for yourself' });
        }

        // Get student's enrolled courses
        const enrolledCourses = await Course.find({ students: studentId }).select('_id');
        const courseIds = enrolledCourses.map(course => course._id);

        const skip = (page - 1) * limit;
        const announcements = await Announcement.find({ 
            $or: [
                { course: { $in: courseIds } },
                { targetAudience: 'all_students' },
                { targetAudience: studentId }
            ]
        })
            .populate('course', 'name code')
            .populate('sender', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Announcement.countDocuments({
            $or: [
                { course: { $in: courseIds } },
                { targetAudience: 'all_students' },
                { targetAudience: studentId }
            ]
        });

        res.status(200).json({
            success: true,
            data: {
                announcements: announcements.map(announcement => ({
                    id: announcement._id,
                    title: announcement.title,
                    message: announcement.message,
                    course: announcement.course,
                    sender: announcement.sender,
                    type: announcement.type,
                    priority: announcement.priority,
                    createdAt: announcement.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalAnnouncements: total,
                    hasMore: skip + announcements.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Leave Requests
 * @access Private/Student
 */
exports.getLeaveRequests = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, status } = req.query;
        const requestingUser = req.user;

        // Student can only view their own leave requests
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own leave requests' });
        }

        let query = { student: studentId };

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const leaveRequests = await LeaveRequest.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await LeaveRequest.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                leaveRequests: leaveRequests.map(request => ({
                    id: request._id,
                    student: request.student,
                    type: request.type,
                    reason: request.reason,
                    startDate: request.startDate,
                    endDate: request.endDate,
                    status: request.status,
                    approvedBy: request.approvedBy,
                    approvedAt: request.approvedAt,
                    createdAt: request.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalRequests: total,
                    hasMore: skip + leaveRequests.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Submit Leave Request
 * @access Private/Student
 */
exports.submitLeaveRequest = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { type, reason, startDate, endDate } = req.body;
        const requestingUser = req.user;

        // Student can only submit leave requests for themselves
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only submit leave requests for yourself' });
        }

        if (!type || !reason || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const leaveRequest = new LeaveRequest({
            student: studentId,
            type,
            reason,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: 'pending'
        });

        await leaveRequest.save();

        // Create notification for HOD
        await Notification.create({
            recipient: requestingUser.department,
            type: 'leave_request',
            title: 'New Leave Request',
            message: `${requestingUser.name} has submitted a leave request`,
            relatedId: leaveRequest._id,
            relatedType: 'LeaveRequest'
        });

        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            data: {
                leaveRequest: {
                    id: leaveRequest._id,
                    student: leaveRequest.student,
                    type: leaveRequest.type,
                    reason: leaveRequest.reason,
                    startDate: leaveRequest.startDate,
                    endDate: leaveRequest.endDate,
                    status: leaveRequest.status,
                    createdAt: leaveRequest.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Academic Progress
 * @access Private/Student
 */
exports.getAcademicProgress = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own academic progress
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own academic progress' });
        }

        const [student, grades] = await Promise.all([
            User.findById(studentId).populate('program'),
            Grade.find({ student: studentId }).populate('course', 'credits semester')
        ]);

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const program = student.program;
        const totalProgramCredits = program.duration * program.creditsPerSemester;

        // Calculate progress metrics
        const completedCredits = grades.reduce((sum, grade) => sum + (grade.course?.credits || 0), 0);
        const overallProgress = totalProgramCredits > 0 ? (completedCredits / totalProgramCredits) * 100 : 0;

        // Group by semester
        const semesterProgress = {};
        grades.forEach(grade => {
            const semester = grade.course.semester;
            if (!semesterProgress[semester]) {
                semesterProgress[semester] = { credits: 0 };
            }
            semesterProgress[semester].credits += grade.course?.credits || 0;
        });

        const currentSemesterCredits = student.semester ? 
            semesterProgress[student.semester.semesterNumber]?.credits || 0 : 0;
        const semesterProgressPercentage = program.creditsPerSemester > 0 ? 
            (currentSemesterCredits / program.creditsPerSemester) * 100 : 0;

        // Calculate CGPA
        const totalGradePoints = grades.reduce((sum, grade) => {
            return sum + getGradeValue(grade.grade) * (grade.course?.credits || 1);
        }, 0);
        const cgpa = completedCredits > 0 ? (totalGradePoints / completedCredits).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                academicProgress: {
                    overallProgress: Math.round(overallProgress),
                    semesterProgress: Math.round(semesterProgressPercentage),
                    completedCredits,
                    totalProgramCredits,
                    cgpa: parseFloat(cgpa),
                    currentSemester: student.semester?.semesterNumber || 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Performance Analytics
 * @access Private/Student
 */
exports.getPerformanceAnalytics = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own performance analytics
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own performance analytics' });
        }

        const [grades, attendance] = await Promise.all([
            Grade.find({ student: studentId }).populate('course', 'name code'),
            Attendance.find({ student: studentId })
        ]);

        // Calculate performance metrics
        const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        grades.forEach(grade => {
            const gradeLetter = grade.grade;
            if (gradeDistribution[gradeLetter] !== undefined) {
                gradeDistribution[gradeLetter]++;
            }
        });

        const totalClasses = attendance.length;
        const attendedClasses = attendance.filter(record => record.status === 'present').length;
        const attendanceRate = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;

        // Calculate average grade
        const gradeValues = grades.map(grade => getGradeValue(grade.grade));
        const averageGrade = gradeValues.length > 0 ? 
            (gradeValues.reduce((sum, val) => sum + val, 0) / gradeValues.length).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            data: {
                performance: {
                    gradeDistribution,
                    attendanceRate: Math.round(attendanceRate),
                    averageGrade: parseFloat(averageGrade),
                    totalGrades: grades.length,
                    totalClasses,
                    attendedClasses
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Fee Structure
 * @access Private/Student
 */
exports.getFeeStructure = async (req, res) => {
    try {
        const { studentId } = req.params;
        const requestingUser = req.user;

        // Student can only view their own fee structure
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own fee structure' });
        }

        const student = await User.findById(studentId).populate('program');
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Mock fee structure - would come from program or fee model
        const feeStructure = {
            tuitionFee: student.program?.tuitionFee || 50000,
            registrationFee: 5000,
            libraryFee: 2000,
            labFee: 3000,
            examinationFee: 2000,
            hostelFee: 12000,
            otherFees: 1000,
            totalFee: 75000,
            paymentDeadline: '2024-08-15'
        };

        res.status(200).json({
            success: true,
            data: {
                feeStructure
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Payment History
 * @access Private/Student
 */
exports.getPaymentHistory = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, status } = req.query;
        const requestingUser = req.user;

        // Student can only view their own payment history
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own payment history' });
        }

        let query = { student: studentId };

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const payments = await Payment.find(query)
            .sort({ paymentDate: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Payment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                payments: payments.map(payment => ({
                    id: payment._id,
                    student: payment.student,
                    amount: payment.amount,
                    paymentDate: payment.paymentDate,
                    method: payment.method,
                    status: payment.status,
                    transactionId: payment.transactionId,
                    createdAt: payment.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalPayments: total,
                    hasMore: skip + payments.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Make Payment
 * @access Private/Student
 */
exports.makePayment = async (req, res) => {
    try {
        const { amount, method, paymentType } = req.body;
        const requestingUser = req.user;

        if (!amount || !method || !paymentType) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const payment = new Payment({
            student: requestingUser._id,
            amount,
            method,
            paymentType,
            status: 'pending',
            paymentDate: new Date(),
            transactionId: generateTransactionId()
        });

        await payment.save();

        res.status(201).json({
            success: true,
            message: 'Payment initiated successfully',
            data: {
                payment: {
                    id: payment._id,
                    amount: payment.amount,
                    method: payment.method,
                    paymentType: payment.paymentType,
                    status: payment.status,
                    transactionId: payment.transactionId,
                    paymentDate: payment.paymentDate
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Scholarships
 * @access Private/Student
 */
exports.getScholarships = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { page = 1, limit = 20, status } = req.query;
        const requestingUser = req.user;

        // Student can only view their own scholarships
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own scholarships' });
        }

        let query = { student: studentId };

        if (status) {
            query.status = status;
        }

        const skip = (page - 1) * limit;
        const scholarships = await Scholarship.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Scholarship.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                scholarships: scholarships.map(scholarship => ({
                    id: scholarship._id,
                    student: scholarship.student,
                    name: scholarship.name,
                    type: scholarship.type,
                    amount: scholarship.amount,
                    status: scholarship.status,
                    applicationDate: scholarship.applicationDate,
                    awardedDate: scholarship.awardedDate,
                    createdAt: scholarship.createdAt
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalScholarships: total,
                    hasMore: skip + scholarships.length < total
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Apply for Scholarship
 * @access Private/Student
 */
exports.applyForScholarship = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { scholarshipId, documents, essay } = req.body;
        const requestingUser = req.user;

        // Student can only apply for scholarships for themselves
        if (requestingUser.role === 'student' && requestingUser._id.toString() !== studentId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only apply for scholarships for yourself' });
        }

        const scholarship = new Scholarship({
            student: studentId,
            scholarshipId,
            documents,
            essay,
            status: 'pending',
            applicationDate: new Date()
        });

        await scholarship.save();

        res.status(201).json({
            success: true,
            message: 'Scholarship application submitted successfully',
            data: {
                scholarship: {
                    id: scholarship._id,
                    student: scholarship.student,
                    scholarshipId: scholarship.scholarshipId,
                    status: scholarship.status,
                    applicationDate: scholarship.applicationDate
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Gamification & Achievements
exports.getAchievements = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            // Development mode - mock achievements data
            const achievements = [
                {
                    id: 1,
                    title: "First Steps",
                    description: "Complete your first assignment",
                    icon: "🎯",
                    earned: true,
                    earnedAt: new Date('2024-01-15')
                },
                {
                    id: 2,
                    title: "Code Master",
                    description: "Submit 10 coding assignments",
                    icon: "💻",
                    earned: true,
                    earnedAt: new Date('2024-02-20')
                },
                {
                    id: 3,
                    title: "Perfect Score",
                    description: "Get 100% on 5 assignments",
                    icon: "⭐",
                    earned: false,
                    progress: 3,
                    total: 5
                },
                {
                    id: 4,
                    title: "Consistent Learner",
                    description: "Login for 30 consecutive days",
                    icon: "📅",
                    earned: false,
                    progress: 12,
                    total: 30
                }
            ];

            return res.status(200).json({
                success: true,
                data: achievements,
                devMode: true
            });
        }
        
        // Mock achievements data (original code)
        const achievements = [
            {
                id: 1,
                title: "First Steps",
                description: "Complete your first assignment",
                icon: "🎯",
                earned: true,
                earnedAt: new Date('2024-01-15')
            },
            {
                id: 2,
                title: "Code Master",
                description: "Submit 10 coding assignments",
                icon: "💻",
                earned: true,
                earnedAt: new Date('2024-02-20')
            },
            {
                id: 3,
                title: "Perfect Score",
                description: "Get 100% on 5 assignments",
                icon: "⭐",
                earned: false,
                progress: 3,
                total: 5
            },
            {
                id: 4,
                title: "Consistent Learner",
                description: "Login for 30 consecutive days",
                icon: "📅",
                earned: false,
                progress: 12,
                total: 30
            }
        ];

        res.status(200).json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getUserPoints = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            // Development mode - mock points data
            const pointsData = {
                totalPoints: 2450,
                currentLevel: "Advanced",
                nextLevelPoints: 3000,
                pointsHistory: [
                    { type: "assignment", points: 50, description: "Completed Java Assignment", createdAt: new Date('2024-03-10') },
                    { type: "achievement", points: 100, description: "Earned 'Code Master' badge", createdAt: new Date('2024-03-08') },
                    { type: "bonus", points: 25, description: "Daily login streak", createdAt: new Date('2024-03-07') },
                    { type: "assignment", points: 75, description: "Completed Data Structures Quiz", createdAt: new Date('2024-03-05') }
                ],
                levelProgress: {
                    currentLevelPoints: 2450,
                    nextLevelPoints: 3000,
                    percentage: 81.67
                }
            };

            return res.status(200).json({
                success: true,
                data: pointsData,
                devMode: true
            });
        }
        
        // Mock points data (original code)
        const pointsData = {
            totalPoints: 2450,
            currentLevel: "Advanced",
            nextLevelPoints: 3000,
            pointsHistory: [
                { type: "assignment", points: 50, description: "Completed Java Assignment", createdAt: new Date('2024-03-10') },
                { type: "achievement", points: 100, description: "Earned 'Code Master' badge", createdAt: new Date('2024-03-08') },
                { type: "bonus", points: 25, description: "Daily login streak", createdAt: new Date('2024-03-07') },
                { type: "assignment", points: 75, description: "Completed Data Structures Quiz", createdAt: new Date('2024-03-05') }
            ],
            levelProgress: {
                currentLevelPoints: 2450,
                nextLevelPoints: 3000,
                percentage: 81.67
            }
        };

        res.status(200).json({
            success: true,
            data: pointsData
        });
    } catch (error) {
        console.error('Get user points error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const { limit = 10, timeframe = 'all' } = req.query;
        
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            // Development mode - mock leaderboard data
            const leaderboard = [
                { rank: 1, name: "Alice Johnson", points: 3250, level: "Expert", avatar: "👩‍💻" },
                { rank: 2, name: "Bob Smith", points: 2980, level: "Advanced", avatar: "👨‍💻" },
                { rank: 3, name: "Carol Davis", points: 2750, level: "Advanced", avatar: "👩‍🎓" },
                { rank: 4, name: "David Wilson", points: 2450, level: "Advanced", avatar: "👨‍🎓" },
                { rank: 5, name: "Emma Brown", points: 2200, level: "Intermediate", avatar: "👩‍💼" },
                { rank: 6, name: "Frank Miller", points: 1950, level: "Intermediate", avatar: "👨‍💼" },
                { rank: 7, name: "Grace Lee", points: 1800, level: "Intermediate", avatar: "👩‍🔬" },
                { rank: 8, name: "Henry Taylor", points: 1650, level: "Intermediate", avatar: "👨‍🔬" },
                { rank: 9, name: "Ivy Chen", points: 1500, level: "Intermediate", avatar: "👩‍🏫" },
                { rank: 10, name: "Jack Anderson", points: 1350, level: "Beginner", avatar: "👨‍🏫" }
            ];

            return res.status(200).json({
                success: true,
                data: {
                    leaderboard,
                    userRank: 4, // Current user's rank
                    totalParticipants: 156
                },
                devMode: true
            });
        }
        
        // Mock leaderboard data (original code)
        const leaderboard = [
            { rank: 1, name: "Alice Johnson", points: 3250, level: "Expert", avatar: "👩‍💻" },
            { rank: 2, name: "Bob Smith", points: 2980, level: "Advanced", avatar: "👨‍💻" },
            { rank: 3, name: "Carol Davis", points: 2750, level: "Advanced", avatar: "👩‍🎓" },
            { rank: 4, name: "David Wilson", points: 2450, level: "Advanced", avatar: "👨‍🎓" },
            { rank: 5, name: "Emma Brown", points: 2200, level: "Intermediate", avatar: "👩‍💼" },
            { rank: 6, name: "Frank Miller", points: 1950, level: "Intermediate", avatar: "👨‍💼" },
            { rank: 7, name: "Grace Lee", points: 1800, level: "Intermediate", avatar: "👩‍🔬" },
            { rank: 8, name: "Henry Taylor", points: 1650, level: "Intermediate", avatar: "👨‍🔬" },
            { rank: 9, name: "Ivy Chen", points: 1500, level: "Intermediate", avatar: "👩‍🏫" },
            { rank: 10, name: "Jack Anderson", points: 1350, level: "Beginner", avatar: "👨‍🏫" }
        ];

        res.status(200).json({
            success: true,
            data: {
                leaderboard,
                userRank: 4, // Current user's rank
                totalParticipants: 156
            }
        });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Student Profile Overview (for dashboard)
 * @access Private/Student
 */
exports.getProfileOverview = async (req, res) => {
    try {
        // Check if database is connected
        if (mongoose.connection.readyState !== 1) {
            // Development mode - mock profile overview
            const requestingUser = req.user;
            
            const mockOverview = {
                student: {
                    id: requestingUser?._id || 'dev_user_123',
                    name: requestingUser?.name || 'Development Student',
                    email: requestingUser?.email || 'student@example.com',
                    studentId: 'DEV2024001',
                    program: { name: 'Computer Science', code: 'CS', degreeType: 'Bachelor' },
                    department: { name: 'Computer Science', code: 'CS' },
                    semester: { semesterNumber: 4, academicYear: '2024' },
                    isActive: true
                },
                enrolledCourses: [
                    { id: 1, name: 'Data Structures', code: 'CS201', credits: 4 },
                    { id: 2, name: 'Algorithms', code: 'CS202', credits: 4 },
                    { id: 3, name: 'Web Development', code: 'CS203', credits: 3 }
                ],
                academicStats: {
                    gpa: 3.7,
                    totalCredits: 45,
                    completedCourses: 12,
                    ongoingCourses: 3
                },
                recentActivity: [
                    { type: 'assignment', title: 'Java Assignment', completedAt: new Date('2024-03-10') },
                    { type: 'quiz', title: 'Data Structures Quiz', completedAt: new Date('2024-03-08') },
                    { type: 'achievement', title: 'Code Master Badge', earnedAt: new Date('2024-03-05') }
                ]
            };

            return res.status(200).json({
                success: true,
                data: mockOverview,
                devMode: true
            });
        }

        const requestingUser = req.user;
        
        // Get student profile with populated data
        const student = await User.findById(requestingUser._id)
            .populate('program', 'name code degreeType')
            .populate('department', 'name code')
            .populate('semester', 'semesterNumber academicYear')
            .select('-password -__v');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        // Get enrolled courses
        const enrolledCourses = await Course.find({ 
            students: requestingUser._id,
            isActive: true 
        }).select('name code credits');

        // Calculate academic stats
        const completedCourses = await Grade.countDocuments({ 
            student: requestingUser._id,
            status: 'completed'
        });
        
        const ongoingCourses = enrolledCourses.length;
        const totalCredits = enrolledCourses.reduce((sum, course) => sum + course.credits, 0);

        const profileOverview = {
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                studentId: student.studentId,
                program: student.program,
                department: student.department,
                semester: student.semester,
                isActive: student.isActive
            },
            enrolledCourses,
            academicStats: {
                gpa: 3.7, // Mock GPA - would be calculated from actual grades
                totalCredits,
                completedCourses,
                ongoingCourses
            }
        };

        res.status(200).json({
            success: true,
            data: profileOverview
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function to convert grade to GPA value
function getGradeValue(grade) {
    const gradeMap = {
        'A+': 4.0,
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'C-': 1.7,
        'D+': 1.3,
        'D': 1.0,
        'D-': 0.7,
        'F': 0.0
    };
    return gradeMap[grade] || 0.0;
}

// Helper function to generate transaction ID
function generateTransactionId() {
    return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
}
