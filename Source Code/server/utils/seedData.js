const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/auth/User');
const University = require('../models/academic/University');
const AcademicYear = require('../models/academic/AcademicYear');
const Department = require('../models/academic/Department');
const Program = require('../models/academic/Program');
const Course = require('../models/academic/Course');
const Semester = require('../models/academic/Semester');
const Section = require('../models/academic/Section');
const Enrollment = require('../models/learning/enrollments/Enrollment');
const CourseEnrollment = require('../models/learning/enrollments/CourseEnrollment');
const Assignment = require('../models/assessment/assignments/Assignment');
const Exam = require('../models/assessment/exams/Exam');
const Announcement = require('../models/communication/Announcement');
const Discussion = require('../models/communication/Discussion');
const Analytics = require('../models/analytics/Analytics');
const StudentLearningState = require('../models/learning/pathway/StudentLearningState');
const Intervention = require('../models/learning/pathway/Intervention');
const AssignmentSubmission = require('../models/assessment/assignments/AssignmentSubmission');
const StudentWeakness = require('../models/analytics/StudentWeakness');

/**
 * Clear all data from the database
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
  console.log('✅ Database cleared');
};

/**
 * Seed University data
 */
const seedUniversity = async () => {
  const university = await University.create({
    name: 'Tech University of Excellence',
    code: 'TUE',
    address: '123 Innovation Drive, Silicon Valley, CA'
  });
  return university;
};

/**
 * Seed Academic Year
 */
const seedAcademicYears = async () => {
  const currentYear = new Date().getFullYear();
  const academicYear = await AcademicYear.create({
    year: `${currentYear}-${currentYear + 1}`,
    isActive: true
  });
  return academicYear;
};

/**
 * Seed Departments
 */
const seedDepartments = async (universityId) => {
  const departments = [
    {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Focuses on computing systems and software engineering',
      establishedYear: 2000,
      universityId
    },
    {
      name: 'Electronics & Communication',
      code: 'ECE',
      description: 'Focuses on electronic circuits and communication systems',
      establishedYear: 2005,
      universityId
    }
  ];
  return await Department.insertMany(departments);
};

/**
 * Seed Programs
 */
const seedPrograms = async (departments) => {
  const programs = [
    {
      name: 'B.Tech Computer Science',
      code: 'BTECH-CS',
      department: departments[0]._id,
      duration: 4,
      degreeType: 'bachelors',
      curriculum: { totalCredits: 160 }
    },
    {
      name: 'M.Tech Software Engineering',
      code: 'MTECH-SE',
      department: departments[0]._id,
      duration: 2,
      degreeType: 'masters',
      curriculum: { totalCredits: 80 }
    }
  ];
  return await Program.insertMany(programs);
};

/**
 * Seed Semesters
 */
const seedSemesters = async (programs, academicYearId) => {
  const semesters = [];
  for (const program of programs) {
    const maxSemesters = program.duration * 2;
    for (let i = 1; i <= maxSemesters; i++) {
      semesters.push({
        programId: program._id,
        academicYearId,
        semesterNumber: i,
        startDate: new Date(new Date().getFullYear(), (i % 2 === 1 ? 7 : 0), 1), // Aug for odd, Jan for even
        endDate: new Date(new Date().getFullYear(), (i % 2 === 1 ? 11 : 4), 30) // Dec for odd, May for even
      });
    }
  }
  return await Semester.insertMany(semesters);
};

/**
 * Seed Sections
 */
const seedSections = async (semesters) => {
  const sections = [];
  for (const semester of semesters) {
    sections.push({
      name: 'A',
      semesterId: semester._id,
      capacity: 60
    });
  }
  return await Section.insertMany(sections);
};

/**
 * Seed Courses
 */
const seedCourses = async (departments, programs, academicYearId) => {
  const courses = [
    {
      name: 'Data Structures & Algorithms',
      code: 'CS101',
      department: departments[0]._id,
      program: programs[0]._id,
      credits: 4,
      semester: 3,
      academicYear: academicYearId,
      courseType: 'core'
    },
    {
      name: 'Operating Systems',
      code: 'CS102',
      department: departments[0]._id,
      program: programs[0]._id,
      credits: 3,
      semester: 4,
      academicYear: academicYearId,
      courseType: 'core'
    }
  ];
  return await Course.insertMany(courses);
};

/**
 * Seed Users
 */
const createUsers = async (departments) => {
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  const users = [
    {
      firstName: 'Super',
      lastName: 'Admin',
      name: 'Super Admin',
      email: 'superadmin@tue.edu',
      password: hashedPassword,
      role: 'super_admin'
    },
    {
      firstName: 'Admin',
      lastName: 'User',
      name: 'Admin User',
      email: 'admin@tue.edu',
      password: hashedPassword,
      role: 'admin'
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      name: 'John Doe',
      email: 'hod.cse@tue.edu',
      password: hashedPassword,
      role: 'hod',
      employeeId: 'EMP001'
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      name: 'Jane Smith',
      email: 'faculty.cse@tue.edu',
      password: hashedPassword,
      role: 'faculty',
      employeeId: 'EMP002'
    },
    {
      firstName: 'Alice',
      lastName: 'Student',
      name: 'Alice Student',
      email: 'alice@tue.edu',
      password: hashedPassword,
      role: 'student',
      studentId: 'STU001'
    }
  ];

  const createdUsers = await User.insertMany(users);

  // Assign HOD to department
  await Department.findByIdAndUpdate(departments[0]._id, { hod: createdUsers[2]._id });

  return createdUsers;
};

/**
 * Seed Enrollments
 */
const seedEnrollments = async (users, sections, semesters, courses) => {
  const student = users.find(u => u.role === 'student');
  const faculty = users.find(u => u.role === 'faculty');

  // Semester enrollment (Alice in Semester 3 of B.Tech CS)
  const btechCsSem3 = semesters.find(s => s.semesterNumber === 3);
  const sectionA = sections.find(sec => sec.semesterId.equals(btechCsSem3._id));

  const enrollment = await Enrollment.create({
    studentId: student._id,
    sectionId: sectionA._id,
    semesterId: btechCsSem3._id,
    status: 'active'
  });

  // Course enrollment (Alice in CS101)
  const dsaCourse = courses.find(c => c.code === 'CS101');
  const courseEnrollment = await CourseEnrollment.create({
    studentId: student._id,
    courseId: dsaCourse._id,
    semesterId: btechCsSem3._id,
    status: 'active'
  });

  // Assign faculty to course
  await Course.findByIdAndUpdate(dsaCourse._id, { faculty: faculty._id });

  return { enrollment, courseEnrollment };
};

/**
 * Seed Assignments
 */
const seedAssignments = async (courses, users) => {
  const dsaCourse = courses.find(c => c.code === 'CS101');
  const faculty = users.find(u => u.role === 'faculty');
  const student = users.find(u => u.role === 'student');

  const assignment = await Assignment.create({
    title: 'Data Structures Implementation',
    description: 'Implement Linked List and Binary Search Tree in JavaScript',
    course: dsaCourse._id,
    createdBy: faculty._id,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    totalMarks: 50,
    coMappings: [{ coCode: 'CO1', weightage: 100 }],
    questions: [
      { text: 'Implement a singly linked list', marks: 25, bloomLevel: 'Apply' },
      { text: 'Implement a binary search tree', marks: 25, bloomLevel: 'Apply' }
    ]
  });

  // Add a submission
  await Assignment.findByIdAndUpdate(assignment._id, {
    $push: {
      submissions: {
        student: student._id,
        submittedAt: new Date(),
        grade: 45,
        feedback: 'Excellent work!'
      }
    }
  });

  return assignment;
};

/**
 * Seed Exams
 */
const seedExams = async (courses, users) => {
  const dsaCourse = courses.find(c => c.code === 'CS101');
  const faculty = users.find(u => u.role === 'faculty');
  const student = users.find(u => u.role === 'student');

  const exam = await Exam.create({
    title: 'Midterm Examination',
    description: 'Covers Units 1-3',
    course: dsaCourse._id,
    createdBy: faculty._id,
    examType: 'MCQ',
    questions: [
      {
        type: 'mcq',
        title: 'Complexity Analysis',
        description: 'What is the time complexity of searching in a BST?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
        correctAnswer: 'O(log n)',
        marks: 2,
        order: 1
      }
    ],
    duration: 60,
    totalMarks: 50,
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
    students: [student._id]
  });

  return exam;
};

/**
 * Seed Materials
 */
const seedMaterials = async (courses, users) => {
  // We can skip this if we don't have a model for materials yet, 
  // but let's assume we might have it in Course model under curriculum.syllabus
  const dsaCourse = courses.find(c => c.code === 'CS101');
  await Course.findByIdAndUpdate(dsaCourse._id, {
    'curriculum.syllabus': [
      { week: 1, topic: 'Introduction to Algorithms', content: 'Big O Notation', learningOutcomes: ['Understand complexity'] },
      { week: 2, topic: 'Linear Data Structures', content: 'Arrays and Linked Lists', learningOutcomes: ['Implement lists'] }
    ]
  });
};

/**
 * Seed Notifications (Announcements)
 */
const seedNotifications = async (courses, users) => {
  const dsaCourse = courses.find(c => c.code === 'CS101');
  const faculty = users.find(u => u.role === 'faculty');

  const announcement = await Announcement.create({
    title: 'Welcome to DSA!',
    content: 'Get ready to dive deep into algorithms.',
    author: faculty._id,
    course: dsaCourse._id,
    isPublished: true,
    publishedAt: new Date()
  });

  return announcement;
};

/**
 * Seed Discussions
 */
const seedDiscussions = async (users) => {
  const student = users.find(u => u.role === 'student');
  const faculty = users.find(u => u.role === 'faculty');

  const discussion = await Discussion.create({
    title: 'Linked List vs Array',
    content: 'When should I use a linked list over an array?',
    authorId: student._id,
    category: 'general',
    tags: ['dsa', 'performance'],
    replies: [
      {
        authorId: faculty._id,
        content: 'Use linked lists when you need frequent insertions/deletions at the beginning.',
        likes: 5,
        createdAt: new Date()
      }
    ]
  });

  return discussion;
};

/**
 * Seed Analytics
 */
const seedAnalytics = async (users, departments, courses) => {
  const student = users.find(u => u.role === 'student');
  const faculty = users.find(u => u.role === 'faculty');
  const cseDept = departments.find(d => d.code === 'CSE');
  const dsaCourse = courses.find(c => c.code === 'CS101');

  const studentAnalytics = await Analytics.create({
    type: 'student',
    userId: student._id,
    totalSubmissions: 10,
    acceptedSubmissions: 8,
    acceptanceRate: 80,
    topicStats: { 'Data Structures': 90, 'Algorithms': 70 },
    weakestTopics: ['Dynamic Programming'],
    performanceTrend: [
      { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), score: 75 },
      { date: new Date(), score: 85 }
    ]
  });

  const facultyAnalytics = await Analytics.create({
    type: 'faculty',
    userId: faculty._id,
    totalProblems: 20,
    avgProblemDifficulty: 'Medium',
    studentEngagement: 95
  });

  const courseAnalytics = await Analytics.create({
    type: 'course',
    courseId: dsaCourse._id,
    enrollmentCount: 60,
    avgScore: 78,
    completionRate: 92
  });

  const departmentAnalytics = await Analytics.create({
    type: 'department',
    departmentId: cseDept._id,
    departmentRanking: 1,
    avgStudentPerformance: 82
  });

  return { studentAnalytics, facultyAnalytics, courseAnalytics, departmentAnalytics };
};

/**
 * Seed Governance & Logic Layers
 */
const seedGovernance = async (users, courses, departments, assignment) => {
  const student = users.find(u => u.role === 'student');
  const faculty = users.find(u => u.role === 'faculty');
  const dsaCourse = courses.find(c => c.code === 'CS101');

  // 1. Student Learning State
  await StudentLearningState.create({
    student: student._id,
    course: dsaCourse._id,
    adaptationMode: 'normal'
  });

  // 2. Assignment Submission
  const submission = await AssignmentSubmission.create({
    assignment: assignment._id,
    student: student._id,
    content: 'https://github.com/student/dsa-lab',
    submissionType: 'link',
    grade: 85,
    status: 'graded',
    gradedBy: faculty._id,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)   // 1 day ago (1 day turnaround)
  });

  // 3. Intervention
  await Intervention.create({
    studentId: student._id,
    courseId: dsaCourse._id,
    topic: 'Recursion Depth',
    triggerTrend: 'Declining',
    recommendationType: 'conceptual_remediation',
    message: 'Student struggling with recursion depth concepts.',
    severityLevel: 'High',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)  // 3 days ago (2 day resolution)
  });

  // 4. Topic Struggle (for heatmap)
  await StudentWeakness.create({
    student: student._id,
    course: dsaCourse._id,
    weakTopics: [
      { topic: 'Recursion', score: 45, totalQuestions: 10, improvementTrend: 'Critical' },
      { topic: 'Graphs', score: 55, totalQuestions: 8, improvementTrend: 'Declining' }
    ]
  });
};

/**
 * Main Seed Function
 */
const seedAll = async () => {
  try {
    const university = await seedUniversity();
    const academicYear = await seedAcademicYears();
    const departments = await seedDepartments(university._id);
    const programs = await seedPrograms(departments);
    const semesters = await seedSemesters(programs, academicYear._id);
    const sections = await seedSections(semesters);
    const courses = await seedCourses(departments, programs, academicYear._id);
    const users = await createUsers(departments);

    await seedEnrollments(users, sections, semesters, courses);
    await seedAssignments(courses, users);
    await seedExams(courses, users);
    await seedMaterials(courses, users);
    await seedNotifications(courses, users);
    await seedDiscussions(users);
    await seedAnalytics(users, departments, courses);

    // Seed the logic layers (Corrected for summary metrics)
    const assignment = await Assignment.findOne({ course: courses[0]._id });
    await seedGovernance(users, courses, departments, assignment);

    return {
      university,
      academicYear,
      departments,
      programs,
      semesters,
      sections,
      courses,
      users
    };
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
};

module.exports = {
  seedAll,
  seedDepartments,
  seedPrograms,
  seedCourses,
  createUsers,
  seedAssignments,
  seedSubmissions: async () => { }, // Handled within seedAssignments for simplicity
  seedExams,
  seedMaterials,
  seedNotifications,
  seedDiscussions,
  seedAnalytics,
  clearDatabase
};
