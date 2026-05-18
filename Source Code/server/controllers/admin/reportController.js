const User = require("../../models/auth/User");
const Course = require("../../models/academic/Course");
const Submission = require("../../models/assessment/problems/Submission");

const csvEscape = (val) => {
  if (val == null) return "";
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) return `'${str.replace(/"/g, '""')}`;
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
};

/**
 * Export Students Report (CSV)
 */
exports.exportStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).select(
      "name email department createdAt",
    );
    const csv =
      "Name,Email,Department,Created Date\n" +
      students
        .map((s) =>
          [
            csvEscape(s.name),
            csvEscape(s.email),
            csvEscape(s.department || "N/A"),
            csvEscape(s.createdAt),
          ].join(","),
        )
        .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="students-report.csv"',
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Export Faculty Report (CSV)
 */
exports.exportFaculty = async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" }).select(
      "name email department createdAt",
    );
    const csv =
      "Name,Email,Department,Created Date\n" +
      faculty
        .map((f) =>
          [
            csvEscape(f.name),
            csvEscape(f.email),
            csvEscape(f.department || "N/A"),
            csvEscape(f.createdAt),
          ].join(","),
        )
        .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="faculty-report.csv"',
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Export Courses Report (CSV)
 */
exports.exportCourses = async (req, res) => {
  try {
    const courses = await Course.find().select(
      "title code semester credits students createdAt",
    );
    const csv =
      "Title,Code,Semester,Credits,Students Enrolled,Created Date\n" +
      courses
        .map((c) =>
          [
            csvEscape(c.title),
            csvEscape(c.code),
            csvEscape(c.semester),
            csvEscape(c.credits),
            csvEscape(c.students?.length || 0),
            csvEscape(c.createdAt),
          ].join(","),
        )
        .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="courses-report.csv"',
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Export Submissions Report (CSV)
 */
exports.exportSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("userId", "name email")
      .populate("problemId", "title")
      .select("userId problemId status runtime memory createdAt");

    const csv =
      "Student,Problem,Status,Runtime,Memory,Submitted Date\n" +
      submissions
        .map((s) =>
          [
            csvEscape(s.userId?.name || "N/A"),
            csvEscape(s.problemId?.title || "N/A"),
            csvEscape(s.status),
            csvEscape(s.runtime || "N/A"),
            csvEscape(s.memory || "N/A"),
            csvEscape(s.createdAt),
          ].join(","),
        )
        .join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="submissions-report.csv"',
    );
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
