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
const Research = require('../../models/academic/Research');
const Publication = require('../../models/academic/Publication');

/**
 * Get Faculty Profile
 * @access Private/Faculty
 */
exports.getFacultyProfile = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const requestingUser = req.user;

        // Faculty can only view their own profile
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own profile' });
        }

        const faculty = await User.findById(facultyId)
            .populate('department', 'name code')
            .select('-password -__v');

        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                faculty: {
                    id: faculty._id,
                    name: faculty.name,
                    email: faculty.email,
                    employeeId: faculty.employeeId,
                    phone: faculty.phone,
                    bio: faculty.bio,
                    department: faculty.department,
                    specialization: faculty.specialization,
                    qualification: faculty.qualification,
                    experience: faculty.experience,
                    joinDate: faculty.joinDate,
                    isActive: faculty.isActive
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Faculty Profile
 * @access Private/Faculty
 */
exports.updateFacultyProfile = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const updates = req.body;
        const requestingUser = req.user;

        // Faculty can only update their own profile
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only update your own profile' });
        }

        const faculty = await User.findById(facultyId);
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        // Faculty can only update certain fields
        const allowedFields = ['name', 'email', 'phone', 'bio', 'specialization', 'qualification'];
        const filteredUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        Object.assign(faculty, filteredUpdates);
        await faculty.save();

        await faculty.populate('department', 'name code');

        res.status(200).json({
            success: true,
            message: 'Faculty profile updated successfully',
            data: {
                faculty: {
                    id: faculty._id,
                    name: faculty.name,
                    email: faculty.email,
                    employeeId: faculty.employeeId,
                    phone: faculty.phone,
                    bio: faculty.bio,
                    department: faculty.department,
                    specialization: faculty.specialization,
                    qualification: faculty.qualification,
                    experience: faculty.experience,
                    joinDate: faculty.joinDate,
                    isActive: faculty.isActive
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Faculty Courses
 * @access Private/Faculty/Admin
 */
exports.getFacultyCourses = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const { page = 1, limit = 20, search, isActive } = req.query;
        const requestingUser = req.user;

        // Faculty can only view their own courses
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own courses' });
        }

        let query = { faculty: facultyId };

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
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
            .populate('students', 'name email studentId')
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
                    students: course.students,
                    faculty: course.faculty,
                    isActive: course.isActive,
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
 * Get Faculty Schedule
 * @access Private/Faculty
 */
exports.getFacultySchedule = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const { weekStart, weekEnd } = req.query;
        const requestingUser = req.user;

        // Faculty can only view their own schedule
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own schedule' });
        }

        const courses = await Course.find({ faculty: facultyId, isActive: true })
            .populate('sections', 'name schedule room')
            .select('name code sections');

        const schedule = [];
        
        courses.forEach(course => {
            course.sections.forEach(section => {
                if (section.schedule) {
                    schedule.push({
                        courseName: course.name,
                        courseCode: course.code,
                        sectionName: section.name,
                        schedule: section.schedule,
                        room: section.room,
                        type: 'lecture'
                    });
                }
            });
        });

        res.status(200).json({
            success: true,
            data: {
                schedule: schedule.sort((a, b) => {
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
 * Get Faculty Workload
 * @access Private/Faculty/Admin
 */
exports.getFacultyWorkload = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const requestingUser = req.user;

        // Faculty can only view their own workload
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own workload' });
        }

        const courses = await Course.find({ faculty: facultyId, isActive: true })
            .populate('students', 'name email studentId')
            .select('name credits students');

        const totalCourses = courses.length;
        const totalStudents = courses.reduce((sum, course) => sum + (course.students?.length || 0), 0);
        const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

        // Calculate teaching hours (assuming 3 hours per credit per week)
        const teachingHours = totalCredits * 3;

        // Get office hours from faculty profile
        const faculty = await User.findById(facultyId).select('officeHours');
        const officeHours = faculty?.officeHours?.length || 0;

        res.status(200).json({
            success: true,
            data: {
                workload: {
                    totalCourses,
                    totalStudents,
                    totalCredits,
                    teachingHours,
                    officeHours,
                    averageStudentsPerCourse: totalCourses > 0 ? Math.round(totalStudents / totalCourses) : 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Faculty Performance
 * @access Private/Faculty/Admin
 */
exports.getFacultyPerformance = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const requestingUser = req.user;

        // Faculty can only view their own performance
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own performance' });
        }

        // Get performance metrics from various sources
        const [courses, research, publications] = await Promise.all([
            Course.find({ faculty: facultyId }),
            Research.find({ faculty: facultyId }),
            Publication.find({ faculty: facultyId })
        ]);

        // Calculate performance metrics
        const studentRating = 85; // Mock data - would come from student feedback
        const researchScore = research.length > 0 ? 75 : 0;
        const teachingScore = courses.length > 0 ? 80 : 0;
        const overallRating = Math.round((studentRating + researchScore + teachingScore) / 3);

        res.status(200).json({
            success: true,
            data: {
                performance: {
                    studentRating,
                    researchScore,
                    teachingScore,
                    overallRating,
                    totalCourses: courses.length,
                    totalResearch: research.length,
                    totalPublications: publications.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Course Details
 * @access Private/Faculty
 */
exports.getCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const requestingUser = req.user;

        const course = await Course.findById(courseId)
            .populate('department', 'name code')
            .populate('program', 'name code')
            .populate('students', 'name email studentId')
            .populate('faculty', 'name email');

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only view their own courses
        if (requestingUser.role === 'faculty' && course.faculty._id.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own courses' });
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
                    students: course.students,
                    faculty: course.faculty,
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
 * Update Course Details
 * @access Private/Faculty/Admin
 */
exports.updateCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.params;
        const updates = req.body;
        const requestingUser = req.user;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only update their own courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only update your own courses' });
        }

        // Faculty can only update certain fields
        const allowedFields = ['description', 'curriculum', 'assessment'];
        const filteredUpdates = {};
        
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        Object.assign(course, filteredUpdates);
        await course.save();

        await course.populate('department', 'name code');
        await course.populate('program', 'name code');
        await course.populate('faculty', 'name email');

        res.status(200).json({
            success: true,
            message: 'Course details updated successfully',
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
 * Get Assignments
 * @access Private/Faculty
 */
exports.getAssignments = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 20, search, status } = req.query;
        const requestingUser = req.user;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only view assignments for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view assignments for your courses' });
        }

        let query = { course: courseId };

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
            .sort({ createdAt: -1 })
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
 * Create Assignment
 * @access Private/Faculty/Admin
 */
exports.createAssignment = async (req, res) => {
    try {
        const { title, description, courseId, dueDate, totalPoints } = req.body;
        const requestingUser = req.user;

        if (!title || !description || !courseId || !dueDate || !totalPoints) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only create assignments for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only create assignments for your courses' });
        }

        const assignment = new Assignment({
            title,
            description,
            course: courseId,
            dueDate: new Date(dueDate),
            totalPoints,
            status: 'active'
        });

        await assignment.save();
        await assignment.populate('course', 'name code');

        res.status(201).json({
            success: true,
            message: 'Assignment created successfully',
            data: {
                assignment: {
                    id: assignment._id,
                    title: assignment.title,
                    description: assignment.description,
                    course: assignment.course,
                    dueDate: assignment.dueDate,
                    totalPoints: assignment.totalPoints,
                    status: assignment.status,
                    createdAt: assignment.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Assignment
 * @access Private/Faculty/Admin
 */
exports.updateAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const updates = req.body;
        const requestingUser = req.user;

        const assignment = await Assignment.findById(assignmentId).populate('course');
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Faculty can only update assignments for their courses
        if (requestingUser.role === 'faculty' && assignment.course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only update assignments for your courses' });
        }

        Object.assign(assignment, updates);
        await assignment.save();

        await assignment.populate('course', 'name code');

        res.status(200).json({
            success: true,
            message: 'Assignment updated successfully',
            data: {
                assignment: {
                    id: assignment._id,
                    title: assignment.title,
                    description: assignment.description,
                    course: assignment.course,
                    dueDate: assignment.dueDate,
                    totalPoints: assignment.totalPoints,
                    status: assignment.status,
                    updatedAt: assignment.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete Assignment
 * @access Private/Faculty/Admin
 */
exports.deleteAssignment = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const requestingUser = req.user;

        const assignment = await Assignment.findById(assignmentId).populate('course');
        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        // Faculty can only delete assignments for their courses
        if (requestingUser.role === 'faculty' && assignment.course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only delete assignments for your courses' });
        }

        await Assignment.findByIdAndDelete(assignmentId);

        res.status(200).json({
            success: true,
            message: 'Assignment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Course Students
 * @access Private/Faculty
 */
exports.getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 20, search } = req.query;
        const requestingUser = req.user;

        const course = await Course.findById(courseId).populate('students');
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only view students for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view students for your courses' });
        }

        let students = course.students || [];

        if (search) {
            students = students.filter(student => 
                student.name.toLowerCase().includes(search.toLowerCase()) ||
                student.email.toLowerCase().includes(search.toLowerCase()) ||
                student.studentId.toLowerCase().includes(search.toLowerCase())
            );
        }

        const skip = (page - 1) * limit;
        const paginatedStudents = students.slice(skip, skip + parseInt(limit));

        res.status(200).json({
            success: true,
            data: {
                students: paginatedStudents.map(student => ({
                    id: student._id,
                    name: student.name,
                    email: student.email,
                    studentId: student.studentId,
                    program: student.program,
                    semester: student.semester
                })),
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(students.length / limit),
                    totalStudents: students.length,
                    hasMore: skip + paginatedStudents.length < students.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Student Grades
 * @access Private/Faculty
 */
exports.getStudentGrades = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const requestingUser = req.user;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only view grades for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view grades for your courses' });
        }

        const grades = await Grade.find({ course: courseId, student: studentId })
            .populate('assignment', 'title totalPoints')
            .populate('exam', 'title totalPoints')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                grades: grades.map(grade => ({
                    id: grade._id,
                    student: grade.student,
                    course: grade.course,
                    assignment: grade.assignment,
                    exam: grade.exam,
                    score: grade.score,
                    totalPoints: grade.totalPoints,
                    percentage: grade.percentage,
                    grade: grade.grade,
                    feedback: grade.feedback,
                    gradedAt: grade.gradedAt
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Student Grades
 * @access Private/Faculty
 */
exports.updateStudentGrades = async (req, res) => {
    try {
        const { courseId, studentId } = req.params;
        const { grade, feedback } = req.body;
        const requestingUser = req.user;

        if (!grade) {
            return res.status(400).json({ success: false, message: 'Grade is required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only update grades for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only update grades for your courses' });
        }

        // Create or update grade
        const gradeRecord = await Grade.findOneAndUpdate(
            { course: courseId, student: studentId },
            {
                course: courseId,
                student: studentId,
                grade,
                feedback,
                gradedBy: requestingUser._id,
                gradedAt: new Date()
            },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Grade updated successfully',
            data: {
                grade: {
                    id: gradeRecord._id,
                    student: gradeRecord.student,
                    course: gradeRecord.course,
                    grade: gradeRecord.grade,
                    feedback: gradeRecord.feedback,
                    gradedAt: gradeRecord.gradedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Attendance Records
 * @access Private/Faculty
 */
exports.getAttendanceRecords = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 20, date, status } = req.query;
        const requestingUser = req.user;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only view attendance for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view attendance for your courses' });
        }

        let query = { course: courseId };

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
            .populate('student', 'name email studentId')
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Attendance.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                attendance: attendance.map(record => ({
                    id: record._id,
                    student: record.student,
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
 * Mark Attendance
 * @access Private/Faculty
 */
exports.markAttendance = async (req, res) => {
    try {
        const { courseId, date, studentIds, status } = req.body;
        const requestingUser = req.user;

        if (!courseId || !date || !studentIds || !studentIds.length || !status) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only mark attendance for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only mark attendance for your courses' });
        }

        const attendanceDate = new Date(date);
        const attendanceRecords = [];

        for (const studentId of studentIds) {
            // Check if attendance already exists for this student on this date
            const existingAttendance = await Attendance.findOne({
                course: courseId,
                student: studentId,
                date: attendanceDate
            });

            if (existingAttendance) {
                // Update existing record
                existingAttendance.status = status;
                existingAttendance.markedBy = requestingUser._id;
                await existingAttendance.save();
                attendanceRecords.push(existingAttendance);
            } else {
                // Create new record
                const attendance = new Attendance({
                    course: courseId,
                    student: studentId,
                    date: attendanceDate,
                    status,
                    markedBy: requestingUser._id
                });
                await attendance.save();
                attendanceRecords.push(attendance);
            }
        }

        res.status(201).json({
            success: true,
            message: `Attendance marked for ${attendanceRecords.length} students`,
            data: {
                attendance: attendanceRecords.map(record => ({
                    id: record._id,
                    student: record.student,
                    course: record.course,
                    date: record.date,
                    status: record.status,
                    markedBy: record.markedBy,
                    createdAt: record.createdAt
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Exams
 * @access Private/Faculty
 */
exports.getExams = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 20, search, status } = req.query;
        const requestingUser = req.user;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only view exams for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view exams for your courses' });
        }

        let query = { course: courseId };

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
 * Create Exam
 * @access Private/Faculty/Admin
 */
exports.createExam = async (req, res) => {
    try {
        const { title, description, courseId, examDate, duration, totalPoints } = req.body;
        const requestingUser = req.user;

        if (!title || !courseId || !examDate || !duration || !totalPoints) {
            return res.status(400).json({ success: false, message: 'All required fields must be provided' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only create exams for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only create exams for your courses' });
        }

        const exam = new Exam({
            title,
            description,
            course: courseId,
            examDate: new Date(examDate),
            duration,
            totalPoints,
            status: 'scheduled'
        });

        await exam.save();
        await exam.populate('course', 'name code');

        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
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
                    createdAt: exam.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Send Course Announcement
 * @access Private/Faculty
 */
exports.sendCourseAnnouncement = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { title, message } = req.body;
        const requestingUser = req.user;

        if (!title || !message) {
            return res.status(400).json({ success: false, message: 'Title and message are required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only send announcements for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only send announcements for your courses' });
        }

        const announcement = new Announcement({
            title,
            message,
            course: courseId,
            sender: requestingUser._id,
            type: 'course',
            priority: 'normal'
        });

        await announcement.save();
        await announcement.populate('course', 'name code');
        await announcement.populate('sender', 'name email');

        // Create notifications for all students in the course
        const notifications = course.students.map(studentId => ({
            recipient: studentId,
            type: 'announcement',
            title: `New Announcement: ${title}`,
            message: message,
            relatedId: announcement._id,
            relatedType: 'Announcement'
        }));

        await Notification.insertMany(notifications);

        res.status(201).json({
            success: true,
            message: 'Announcement sent successfully',
            data: {
                announcement: {
                    id: announcement._id,
                    title: announcement.title,
                    message: announcement.message,
                    course: announcement.course,
                    sender: announcement.sender,
                    type: announcement.type,
                    priority: announcement.priority,
                    createdAt: announcement.createdAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get Course Announcements
 * @access Private/Faculty/Student
 */
exports.getCourseAnnouncements = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const requestingUser = req.user;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Faculty can only view announcements for their courses
        if (requestingUser.role === 'faculty' && course.faculty.toString() !== requestingUser._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view announcements for your courses' });
        }

        const skip = (page - 1) * limit;
        const announcements = await Announcement.find({ course: courseId })
            .populate('sender', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Announcement.countDocuments({ course: courseId });

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
 * Get Notifications
 * @access Private/Faculty
 */
exports.getNotifications = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const { page = 1, limit = 20, read } = req.query;
        const requestingUser = req.user;

        // Faculty can only view their own notifications
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own notifications' });
        }

        let query = { recipient: facultyId };

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
 * @access Private/Faculty
 */
exports.markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const requestingUser = req.user;

        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        // Faculty can only mark their own notifications as read
        if (requestingUser.role === 'faculty' && notification.recipient.toString() !== requestingUser._id.toString()) {
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
 * Get Office Hours
 * @access Private/Faculty
 */
exports.getOfficeHours = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const requestingUser = req.user;

        // Faculty can only view their own office hours
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only view your own office hours' });
        }

        const faculty = await User.findById(facultyId).select('officeHours');
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        res.status(200).json({
            success: true,
            data: {
                officeHours: faculty.officeHours || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update Office Hours
 * @access Private/Faculty
 */
exports.updateOfficeHours = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const { officeHours } = req.body;
        const requestingUser = req.user;

        // Faculty can only update their own office hours
        if (requestingUser.role === 'faculty' && requestingUser._id.toString() !== facultyId) {
            return res.status(403).json({ success: false, message: 'Access denied: You can only update your own office hours' });
        }

        const faculty = await User.findById(facultyId);
        if (!faculty) {
            return res.status(404).json({ success: false, message: 'Faculty not found' });
        }

        faculty.officeHours = officeHours;
        await faculty.save();

        res.status(200).json({
            success: true,
            message: 'Office hours updated successfully',
            data: {
                officeHours: faculty.officeHours
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Faculty Analytics
exports.getFacultyAnalytics = async (req, res) => {
    try {
        const { facultyId } = req.params;
        // Placeholder implementation
        res.json({ success: true, data: { facultyId, analytics: {} } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
