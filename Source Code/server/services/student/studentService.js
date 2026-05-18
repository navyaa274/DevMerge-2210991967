const User = require('../../models/auth/User');
const CourseEnrollment = require('../../models/learning/enrollments/CourseEnrollment');
const AcademicYear = require('../../models/academic/AcademicYear');
const Semester = require('../../models/academic/Semester');

/**
 * Student Service — encapsulates student-specific business logic
 */

const getProfileOverview = async (studentId) => {
  const [user, activeYear] = await Promise.all([
    User.findById(studentId).select('firstName lastName email role department program'),
    AcademicYear.findOne({ isActive: true })
  ]);

  if (!user) return null;

  let enrollments = [];
  let semesters = [];

  if (activeYear) {
    [semesters, enrollments] = await Promise.all([
      Semester.find({ academicYear: activeYear._id }),
      CourseEnrollment.find({ studentId: studentId })
        .populate('course', 'name code credits')
        .populate('section', 'name')
    ]);
  }

  // Calculate faculty set from enrollments
  const facultySet = new Set();
  enrollments.forEach(e => {
    if (e.section?.faculty) {
      facultySet.add(e.section.faculty.toString());
    }
  });

  return {
    user,
    activeYear,
    semesters,
    enrollments,
    facultyCount: facultySet.size
  };
};

module.exports = {
  getProfileOverview
};

