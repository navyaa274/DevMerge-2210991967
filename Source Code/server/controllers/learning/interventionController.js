const Intervention = require("../../models/learning/pathway/Intervention");
const User = require("../../models/auth/User");
const Submission = require("../../models/assessment/problems/Submission");
const Course = require("../../models/academic/Course");
const aiService = require("../../utils/aiService");

/**
 * Intervention Controller
 * Drives predictive at-risk analysis and triggers automated support pathways.
 */
class InterventionController {
  /**
   * Run predictive analysis for a student in a course
   */
  async runAnalysis(req, res) {
    try {
      const { studentId, courseId } = req.body;

      // 1. Gather student context: labs, submissions, activity
      const [submissions, student] = await Promise.all([
        Submission.find({ student: studentId, problem: { $exists: true } })
          .limit(20)
          .sort({ submittedAt: -1 }),
        User.findById(studentId).select("academicInfo displayName email"),
      ]);

      if (!student)
        return res
          .status(404)
          .json({ success: false, message: "Student not found" });

      const analysisData = {
        submissions: submissions.map((s) => ({
          status: s.status,
          runtime: s.runtime,
          testsPassed: s.testsPassed,
          totalTests: s.totalTests,
          submittedAt: s.submittedAt,
        })),
        academicInfo: student.academicInfo,
      };

      // 2. AI Inference for risk vector
      const riskVector = await aiService.analyzeRiskVector(analysisData);

      // 3. Automated trigger if "At-Risk"
      let intervention = null;
      if (riskVector.isAtRisk) {
        // Find an active intervention for this topic/course
        const existing = await Intervention.findOne({
          studentId,
          courseId,
          status: "Pending",
        });

        if (!existing) {
          intervention = await Intervention.create({
            studentId,
            courseId,
            topic: riskVector.primaryTriggers[0] || "Academic Engagement",
            triggerTrend: "Critical",
            recommendationType: "extra_practice",
            message: riskVector.explanation,
            severityLevel: riskVector.riskLevel,
            status: "Pending",
          });
        }
      }

      res.json({
        success: true,
        riskLevel: riskVector.riskLevel,
        isAtRisk: riskVector.isAtRisk,
        analysis: riskVector,
        intervention: intervention,
      });
    } catch (error) {
      console.error("Risk Analysis Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to complete risk analysis" });
    }
  }

  /**
   * Get active interventions for a student
   */
  async getStudentInterventions(req, res) {
    try {
      const interventions = await Intervention.find({ studentId: req.user.id })
        .populate("courseId", "name code")
        .sort({ createdAt: -1 });
      res.json({ success: true, data: interventions });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch interventions" });
    }
  }

  /**
   * Faculty: Resolve an intervention
   */
  async resolveIntervention(req, res) {
    try {
      const { id } = req.params;
      const { facultyNotes, status } = req.body;

      const intervention = await Intervention.findByIdAndUpdate(
        id,
        {
          status: status || "Resolved",
          facultyNotes: facultyNotes,
          updatedAt: new Date(),
        },
        { new: true },
      );

      if (!intervention)
        return res
          .status(404)
          .json({ success: false, message: "Intervention not found" });

      res.json({ success: true, data: intervention });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Failed to resolve intervention" });
    }
  }

  /**
   * Get interventions by department for HOD
   */
  async getDepartmentInterventions(req, res) {
    try {
      const { deptId } = req.params;
      const studentIds = await User.find({
        department: deptId,
        role: "student",
      }).distinct("_id");

      const interventions = await Intervention.find({
        studentId: { $in: studentIds },
      })
        .populate("studentId", "firstName lastName studentId")
        .populate("courseId", "name code")
        .sort({ severityLevel: -1, createdAt: -1 });

      res.json({ success: true, data: interventions });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch department interventions",
        });
    }
  }

  /**
   * Generate personalized study path (Item 17)
   */
  async generateStudyPath(req, res) {
    try {
      const studentId = req.user.id;

      // 1. Get student performance by topic
      const submissions = await Submission.find({
        student: studentId,
        status: { $ne: "Accepted" },
      })
        .populate("problem", "topics title difficulty")
        .limit(50);

      const topicFailures = {};
      submissions.forEach((s) => {
        if (s.problem && s.problem.topics) {
          s.problem.topics.forEach((t) => {
            topicFailures[t] = (topicFailures[t] || 0) + 1;
          });
        }
      });

      // 2. Identify top weak topics
      const weakTopics = Object.entries(topicFailures)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((t) => t[0]);

      // 3. Recommend problems for these topics
      const Problem = require("../../models/assessment/problems/Problem");
      const recommendations = await Problem.find({
        topics: { $in: weakTopics },
        isApproved: true,
      })
        .limit(5)
        .select("title slug difficulty topics");

      res.json({
        success: true,
        weakTopics,
        recommendations: recommendations.map((r) => ({
          title: r.title,
          slug: r.slug,
          difficulty: r.difficulty,
          primaryTopic: r.topics[0],
        })),
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new InterventionController();
