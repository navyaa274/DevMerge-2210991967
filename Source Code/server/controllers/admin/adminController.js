const User = require("../../models/auth/User");
const Problem = require("../../models/assessment/problems/Problem");
const Exam = require("../../models/assessment/exams/Exam");
const bcrypt = require("bcryptjs");

/**
 * Approve Problem
 */
exports.approveProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true },
    );
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Approve Exam
 */
exports.approveExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true },
    );
    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Bulk Upload Students
 */
exports.bulkUploadStudents = async (req, res) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students)) {
      return res.status(400).json({ error: "Students must be an array" });
    }

    const docs = await Promise.all(
      students.map(async (s) => ({
        name: s.name,
        email: s.email,
        password: await bcrypt.hash(s.password, 12),
        role: "student",
        department: s.department,
      })),
    );

    const created = await User.insertMany(docs, { ordered: false });
    res.json({
      message: `${created.length} students uploaded successfully`,
      students: created,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
