/**
 * Registrar/Admin Automation Service
 * AI-driven automation for enrollment, scheduling, grading, and compliance
 */

const User = require("../../models/auth/User");
const Course = require("../../models/academic/Course");
const Enrollment = require("../../models/learning/enrollments/Enrollment");
const Problem = require("../../models/assessment/problems/Problem");
const Submission = require("../../models/assessment/problems/Submission");
const Exam = require("../../models/assessment/exams/Exam");
const { generateCopilotContent } = require("../ai/copilotService");

class RegistrarAutomationService {
  constructor() {
    this.automationLogs = [];
    this.isRunning = false;
  }

  /**
   * ✅ 1. Automated Enrollment & Prerequisite Checks
   */
  async automateEnrollment(programData, semester) {
    try {
      const mongoose = require("mongoose");

      // Check database connection before making queries
      if (mongoose.connection.readyState !== 1) {
        console.error(
          "❌ Database not connected, skipping enrollment automation",
        );
        throw new Error("Database not connected");
      }

      console.log(
        `🎓 Starting automated enrollment for ${programData.program}, Semester ${semester}`,
      );

      const students = await User.find({
        program: programData.program,
        currentSemester: semester - 1,
        status: "active",
      });

      const enrollments = [];
      const interventions = [];

      for (const student of students) {
        // AI-driven prerequisite validation
        const prerequisitesMet = await this.validatePrerequisites(
          student,
          programData,
          semester,
        );

        if (prerequisitesMet.valid) {
          // Career-driven elective suggestions (simplified for now)
          const recommendedElectives = this.getRecommendedElectives(
            programData,
            student,
          );

          const enrollment = new Enrollment({
            student: student._id,
            program: programData.program,
            semester,
            courses: programData.coreCourses,
            electives: recommendedElectives,
            status: "enrolled",
            enrollmentDate: new Date(),
            automated: true,
          });

          enrollments.push(enrollment);
        } else {
          interventions.push({
            student: student._id,
            type: "prerequisite_intervention",
            message: prerequisitesMet.message,
            recommendedActions: prerequisitesMet.actions,
          });
        }
      }

      // Bulk save enrollments
      const savedEnrollments = await Enrollment.insertMany(enrollments);

      // Process interventions
      await this.processInterventions(interventions);

      this.logAutomation("enrollment", {
        processed: students.length,
        enrolled: savedEnrollments.length,
        interventions: interventions.length,
        semester,
      });

      return {
        success: true,
        enrolled: savedEnrollments.length,
        interventions: interventions.length,
        data: savedEnrollments,
      };
    } catch (error) {
      console.error("❌ Enrollment automation failed:", error);
      throw error;
    }
  }

  /**
   * ✅ 2. Dynamic Timetable & Resource Allocation
   */
  async generateTimetable(semester, constraints = {}) {
    try {
      const mongoose = require("mongoose");

      // Check database connection before making queries
      if (mongoose.connection.readyState !== 1) {
        console.error(
          "❌ Database not connected, skipping timetable generation",
        );
        throw new Error("Database not connected");
      }

      console.log(
        `📅 Generating AI-optimized timetable for Semester ${semester}`,
      );

      const courses = await Course.find({ semester });
      const faculty = await User.find({ role: "faculty", status: "active" });
      const labs = await this.getLabResources();
      const classrooms = await this.getClassroomResources();

      // AI optimization prompt
      const promptPayload = {
        system: "You are an academic schedule optimization system",
        context: "",
        instruction: `Generate an optimal timetable for ${courses.length} courses with the following constraints:
         - Faculty availability: ${JSON.stringify(faculty.map((f) => ({ id: f._id, name: f.name, maxHours: f.maxTeachingHours || 20 })))}
         - Lab resources: ${JSON.stringify(labs)}
         - Classroom capacity: ${JSON.stringify(classrooms)}
         - Time constraints: ${JSON.stringify(constraints)}

         Optimize for:
         1. Faculty load balancing
         2. Lab utilization efficiency
         3. Student convenience (no back-to-back labs)
         4. Resource availability

         Return as JSON with schedule, assignments, and resource utilization metrics.`,
      };

      const timetable = await generateCopilotContent(
        "system",
        "timetable",
        promptPayload,
        "rubric_gen",
      );

      // Save timetable
      const savedTimetable = await this.saveTimetable(timetable, semester);

      this.logAutomation("timetable", {
        semester,
        coursesScheduled: timetable.schedule.length,
        facultyUtilization: timetable.metrics.facultyUtilization,
        labUtilization: timetable.metrics.labUtilization,
      });

      return savedTimetable;
    } catch (error) {
      console.error("❌ Timetable generation failed:", error);
      throw error;
    }
  }

  /**
   * ✅ 3. Grading & Assessment Automation
   */
  async automateGrading(semester, assessmentType = "all") {
    try {
      const mongoose = require("mongoose");

      // Check database connection before making queries
      if (mongoose.connection.readyState !== 1) {
        console.error("❌ Database not connected, skipping grading automation");
        throw new Error("Database not connected");
      }

      console.log(`📊 Starting automated grading for Semester ${semester}`);

      const enrollments = await Enrollment.find({
        semester,
        status: "enrolled",
      })
        .populate("student")
        .populate("courses");

      const gradeReports = [];
      const anomalies = [];

      for (const enrollment of enrollments) {
        const studentGrades = await this.calculateStudentGrades(
          enrollment,
          assessmentType,
        );

        // AI-driven anomaly detection
        const anomalyCheck = await this.detectGradeAnomalies(
          studentGrades,
          enrollment.student,
        );

        if (anomalyCheck.hasAnomaly) {
          anomalies.push({
            student: enrollment.student._id,
            type: anomalyCheck.type,
            severity: anomalyCheck.severity,
            details: anomalyCheck.details,
            recommendation: anomalyCheck.recommendation,
          });
        }

        gradeReports.push({
          student: enrollment.student._id,
          semester,
          gpa: studentGrades.gpa,
          totalCredits: studentGrades.totalCredits,
          courseGrades: studentGrades.courseGrades,
          automated: true,
          generatedAt: new Date(),
        });
      }

      // Save grade reports
      await this.saveGradeReports(gradeReports);

      // Process anomalies
      await this.processGradeAnomalies(anomalies);

      this.logAutomation("grading", {
        semester,
        studentsProcessed: gradeReports.length,
        anomaliesDetected: anomalies.length,
        assessmentType,
      });

      return {
        success: true,
        gradeReports: gradeReports.length,
        anomalies: anomalies.length,
        data: gradeReports,
      };
    } catch (error) {
      console.error("❌ Grading automation failed:", error);
      throw error;
    }
  }

  /**
   * ✅ 4. Compliance & Audit Trail
   */
  async generateComplianceReport(timeframe = "semester") {
    try {
      const mongoose = require("mongoose");

      // Check database connection before making queries
      if (mongoose.connection.readyState !== 1) {
        console.error(
          "❌ Database not connected, skipping compliance report generation",
        );
        throw new Error("Database not connected");
      }

      console.log(`🔍 Generating compliance report for ${timeframe}`);

      const report = {
        timeframe,
        generatedAt: new Date(),
        enrollmentStats: await this.getEnrollmentStats(),
        gradingCompliance: await this.getGradingCompliance(),
        resourceUtilization: await this.getResourceUtilization(),
        integrityMetrics: await this.getIntegrityMetrics(),
        automationLogs: this.getRecentAutomationLogs(),
        recommendations: [],
      };

      // AI-driven recommendations
      const promptPayload = {
        system: "You are an academic compliance and policy analysis system",
        context: "",
        instruction: `Based on this compliance report data:
         ${JSON.stringify(report)}

         Generate 3-5 actionable recommendations for improving:
         1. Academic efficiency
         2. Student success rates
         3. Resource utilization
         4. Compliance adherence

         Return as JSON array of recommendations with priority and implementation steps.`,
      };

      report.recommendations = await generateCopilotContent(
        "system",
        "compliance",
        promptPayload,
        "insight_analysis",
      );

      // Save compliance report
      await this.saveComplianceReport(report);

      this.logAutomation("compliance", {
        timeframe,
        recommendations: report.recommendations.length,
        complianceScore: this.calculateComplianceScore(report),
      });

      return report;
    } catch (error) {
      console.error("❌ Compliance report generation failed:", error);
      throw error;
    }
  }

  /**
   * ✅ 5. Faculty & Admin Dashboards Data
   */
  async getDashboardData(role, userId, timeframe = "month") {
    try {
      const mongoose = require("mongoose");

      // Check database connection before making queries
      if (mongoose.connection.readyState !== 1) {
        console.error(
          "❌ Database not connected, skipping dashboard data generation",
        );
        throw new Error("Database not connected");
      }

      const dashboardData = {
        role,
        userId,
        timeframe,
        generatedAt: new Date(),
        metrics: {},
        alerts: [],
        aiInsights: [],
      };

      switch (role) {
        case "registrar":
          dashboardData.metrics = await this.getRegistrarMetrics(timeframe);
          dashboardData.alerts = await this.getRegistrarAlerts();
          break;
        case "admin":
          dashboardData.metrics = await this.getAdminMetrics(timeframe);
          dashboardData.alerts = await this.getAdminAlerts();
          break;
        case "faculty":
          dashboardData.metrics = await this.getFacultyMetrics(
            userId,
            timeframe,
          );
          dashboardData.alerts = await this.getFacultyAlerts(userId);
          break;
      }

      // AI-driven insights
      const promptPayload = {
        system: "You are an academic analytics and insights system",
        context: "",
        instruction: `Analyze these dashboard metrics and provide 3 key insights:
         ${JSON.stringify(dashboardData.metrics)}

         Focus on:
         1. Performance trends
         2. Risk factors
         3. Improvement opportunities

         Return as JSON array with insight type, description, and suggested actions.`,
      };

      dashboardData.aiInsights = await generateCopilotContent(
        "system",
        "dashboard",
        promptPayload,
        "insight_analysis",
      );

      return dashboardData;
    } catch (error) {
      console.error("❌ Dashboard data generation failed:", error);
      throw error;
    }
  }

  // Helper Methods
  async validatePrerequisites(student, programData, semester) {
    // Check completed courses, grades, and readiness
    const completedCourses = await Enrollment.find({
      student: student._id,
      status: "completed",
    }).populate("courses");

    const prerequisites = programData.prerequisites[semester] || [];
    const met = [];
    const missing = [];

    for (const prereq of prerequisites) {
      const isCompleted = completedCourses.some((enrollment) =>
        enrollment.courses.some((course) => course.code === prereq.courseCode),
      );

      if (isCompleted) {
        met.push(prereq);
      } else {
        missing.push(prereq);
      }
    }

    return {
      valid: missing.length === 0,
      message:
        missing.length > 0
          ? `Missing prerequisites: ${missing.map((m) => m.courseCode).join(", ")}`
          : "All prerequisites met",
      met,
      missing,
      actions:
        missing.length > 0
          ? [
              "Complete prerequisite courses",
              "Consider summer bridge program",
              "Meet with academic advisor",
            ]
          : [],
    };
  }

  getRecommendedElectives(programData, student) {
    const electives = programData.electives || [];

    // Simplified elective selection based on student performance
    return electives.slice(0, 2); // Limit to 2 electives per semester
  }

  async detectGradeAnomalies(grades, student) {
    const anomalies = [];

    // Check for suspiciously high grades
    const averageGrade =
      grades.courseGrades.reduce((sum, course) => sum + course.grade, 0) /
      grades.courseGrades.length;
    if (averageGrade > 95) {
      anomalies.push({
        type: "suspicious_high_grades",
        severity: "medium",
        details: `Average grade: ${averageGrade}%, significantly above class average`,
      });
    }

    // Check for plagiarism flags
    const submissions = await Submission.find({
      student: student._id,
      plagiarismFlag: true,
    });
    if (submissions.length > 0) {
      anomalies.push({
        type: "plagiarism_detected",
        severity: "high",
        details: `${submissions.length} submissions flagged for plagiarism`,
      });
    }

    return {
      hasAnomaly: anomalies.length > 0,
      anomalies,
      recommendation:
        anomalies.length > 0
          ? "Review student performance and integrity"
          : null,
    };
  }

  async calculateStudentGrades(enrollment, assessmentType) {
    // Pull grades from various sources
    const courseGrades = [];
    let totalCredits = 0;
    let totalGradePoints = 0;

    for (const course of enrollment.courses) {
      const submissions = await Submission.find({
        student: enrollment.student._id,
        problem: { $in: course.problems },
      });

      const examGrades = await Exam.find({
        course: course._id,
        "submissions.student": enrollment.student._id,
      });

      // Calculate course grade
      const courseGrade = this.calculateCourseGrade(
        submissions,
        examGrades,
        assessmentType,
      );

      courseGrades.push({
        course: course._id,
        courseCode: course.code,
        grade: courseGrade,
        credits: course.credits,
      });

      totalCredits += course.credits;
      totalGradePoints += courseGrade * course.credits;
    }

    const gpa = totalGradePoints / totalCredits;

    return {
      gpa,
      totalCredits,
      courseGrades,
    };
  }

  calculateCourseGrade(submissions, exams, assessmentType) {
    // Weighted calculation based on assessment type
    const submissionGrades = submissions.map((s) =>
      s.status === "accepted" ? 100 : 0,
    );
    const examGrades = exams.map((e) => e.averageScore || 0);

    let grade = 0;
    if (assessmentType === "all" || assessmentType === "assignments") {
      grade +=
        (submissionGrades.reduce((sum, g) => sum + g, 0) /
          submissionGrades.length) *
        0.6;
    }
    if (assessmentType === "all" || assessmentType === "exams") {
      grade +=
        (examGrades.reduce((sum, g) => sum + g, 0) / examGrades.length) * 0.4;
    }

    return Math.round(grade);
  }

  logAutomation(type, data) {
    const log = {
      type,
      timestamp: new Date(),
      data,
      id: Date.now(),
    };

    this.automationLogs.push(log);
    console.log(`🤖 Automation Log: ${type}`, data);
  }

  getRecentAutomationLogs(limit = 50) {
    return this.automationLogs
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  calculateComplianceScore(report) {
    // Calculate overall compliance score based on various metrics
    let score = 100;

    // Deduct points for issues
    if (
      report.enrollmentStats.droppedStudents >
      0.1 * report.enrollmentStats.totalStudents
    )
      score -= 10;
    if (
      report.gradingCompliance.pendingGrades >
      0.05 * report.gradingCompliance.totalGrades
    )
      score -= 15;
    if (report.integrityMetrics.plagiarismRate > 0.05) score -= 20;

    return Math.max(0, score);
  }
}

module.exports = new RegistrarAutomationService();
