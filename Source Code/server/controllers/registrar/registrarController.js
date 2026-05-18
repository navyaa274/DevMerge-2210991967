const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const Enrollment = require('../../models/learning/enrollments/Enrollment');
const AutomationLog = require('../../models/registrar/AutomationLog');
const EnrollmentBatch = require('../../models/registrar/EnrollmentBatch');
const Timetable = require('../../models/registrar/Timetable');
const { generateCopilotContent } = require('../../services/ai/copilotService');
const registrarAutomationService = require('../../services/registrar/registrarAutomationService');

class RegistrarController {
  /**
   * ✅ AI-Driven Enrollment Management
   */
  async getEnrollmentAnalytics(req, res) {
    try {
      const { semester, program } = req.query;
      
      const analytics = await this.calculateEnrollmentAnalytics(semester, program);
      
      // AI insights for enrollment trends
      const insightsPrompt = `
        Analyze these enrollment analytics and provide strategic insights:
        ${JSON.stringify(analytics)}
        
        Focus on:
        1. Enrollment trends and patterns
        2. Capacity utilization
        3. Dropout risk factors
        4. Resource allocation needs
        
        Return as JSON with insights, recommendations, and risk factors.
      `;
      
      const aiResponse = await generateCopilotContent(insightsPrompt, 'system');
      const aiInsights = JSON.parse(aiResponse.content);
      
      res.json({
        success: true,
        data: {
          analytics,
          aiInsights,
          recommendations: aiInsights.recommendations || []
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * ✅ Smart Prerequisite Validation
   */
  async validateStudentPrerequisites(req, res) {
    try {
      const { studentId, targetProgram, targetSemester } = req.body;
      
      const student = await User.findById(studentId);
      const enrollments = await Enrollment.find({ 
        student: studentId, 
        status: 'completed' 
      }).populate('courses');

      // AI-powered prerequisite analysis
      const analysisPrompt = `
        Analyze this student's academic record for prerequisite validation:
        Student: ${JSON.stringify(student)}
        Completed Courses: ${JSON.stringify(enrollments)}
        Target: ${targetProgram}, Semester ${targetSemester}
        
        Determine:
        1. Which prerequisites are met/not met
        2. Academic readiness score (0-100)
        3. Recommended bridge courses
        4. Success probability for target program
        
        Return as JSON with detailed analysis and recommendations.
      `;
      
      const aiResponse = await generateCopilotContent(analysisPrompt, 'system');
      const validation = JSON.parse(aiResponse.content);
      
      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * ✅ Predictive Capacity Planning
   */
  async getCapacityPlanning(req, res) {
    try {
      const { timeframe = 'semester' } = req.query;
      
      const currentData = await this.getCurrentCapacityData();
      const historicalData = await this.getHistoricalCapacityData();
      
      // AI-driven capacity forecasting
      const forecastPrompt = `
        Using this current and historical capacity data, forecast future needs:
        Current: ${JSON.stringify(currentData)}
        Historical: ${JSON.stringify(historicalData)}
        Timeframe: ${timeframe}
        
        Predict:
        1. Course demand trends
        2. Faculty requirements
        3. Classroom/lab needs
        4. Resource constraints
        5. Optimal scheduling recommendations
        
        Return as JSON with forecasts and action items.
      `;
      
      const aiResponse = await generateCopilotContent(forecastPrompt, 'system');
      const forecast = JSON.parse(aiResponse.content);
      
      res.json({
        success: true,
        data: {
          current: currentData,
          historical: historicalData,
          forecast,
          recommendations: forecast.recommendations || []
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * ✅ Automated Intervention Management
   */
  async getInterventions(req, res) {
    try {
      const { status, severity, type, page = 1, limit = 20 } = req.query;
      
      const filter = {};
      if (status) filter['interventions.status'] = status;
      if (severity) filter['interventions.severity'] = severity;
      if (type) filter['interventions.type'] = type;
      
      const interventions = await EnrollmentBatch.find(filter)
        .populate('interventions.student', 'name email')
        .populate('processedBy', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await EnrollmentBatch.countDocuments(filter);
      
      res.json({
        success: true,
        data: interventions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * ✅ AI-Powered Academic Advising
   */
  async getAcademicAdvising(req, res) {
    try {
      const { studentId } = req.params;
      
      const student = await User.findById(studentId);
      const enrollments = await Enrollment.find({ 
        student: studentId 
      }).populate('courses');
      
      const submissions = await Submission.find({ 
        student: studentId 
      }).populate('problem');
      
      // AI-driven academic advising
      const advisingPrompt = `
        Provide comprehensive academic advising for this student:
        Student Profile: ${JSON.stringify(student)}
        Academic History: ${JSON.stringify(enrollments)}
        Performance Data: ${JSON.stringify(submissions)}
        
        Generate personalized recommendations for:
        1. Course selection for next semester
        2. Academic improvement strategies
        3. Career alignment suggestions
        4. Risk mitigation plans
        5. Success probability optimization
        
        Return as JSON with actionable advice and confidence scores.
      `;
      
      const aiResponse = await generateCopilotContent(advisingPrompt, 'system');
      const advising = JSON.parse(aiResponse.content);
      
      res.json({
        success: true,
        data: advising
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * ✅ Compliance Dashboard
   */
  async getComplianceDashboard(req, res) {
    try {
      const { timeframe = 'month' } = req.query;
      
      const complianceData = await this.generateComplianceData(timeframe);
      
      // AI compliance analysis
      const compliancePrompt = `
        Analyze this compliance data and identify critical issues:
        ${JSON.stringify(complianceData)}
        
        Focus on:
        1. Regulatory compliance gaps
        2. Academic standard adherence
        3. Risk assessment
        4. Improvement priorities
        5. Automated remediation suggestions
        
        Return as JSON with risk levels and action plans.
      `;
      
      const aiResponse = await generateCopilotContent(compliancePrompt, 'system');
      const analysis = JSON.parse(aiResponse.content);
      
      res.json({
        success: true,
        data: {
          compliance: complianceData,
          analysis,
          criticalIssues: analysis.criticalIssues || [],
          actionPlan: analysis.actionPlan || []
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * ✅ Bulk Operations for Efficiency
   */
  async bulkOperations(req, res) {
    try {
      const { operation, data } = req.body;
      
      let result = { success: false, processed: 0, errors: [] };
      
      switch (operation) {
        case 'bulk_enroll':
          result = await this.bulkEnrollStudents(data);
          break;
        case 'bulk_withdraw':
          result = await this.bulkWithdrawStudents(data);
          break;
        case 'bulk_grade':
          result = await this.bulkGradeAssignments(data);
          break;
        case 'bulk_notify':
          result = await this.bulkNotifyStudents(data);
          break;
        default:
          return res.status(400).json({ 
            success: false, 
            message: 'Invalid operation' 
          });
      }
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Helper Methods
  async calculateEnrollmentAnalytics(semester, program) {
    const enrollments = await Enrollment.find({ 
      semester, 
      program,
      status: 'enrolled' 
    }).populate('student courses');

    return {
      totalEnrollments: enrollments.length,
      programCapacity: await this.getProgramCapacity(program),
      utilizationRate: (enrollments.length / await this.getProgramCapacity(program)) * 100,
      demographics: await this.getEnrollmentDemographics(enrollments),
      trends: await this.getEnrollmentTrends(program),
      prerequisites: await this.getPrerequisiteCompliance(enrollments)
    };
  }

  async getCurrentCapacityData() {
    const courses = await Course.find({});
    const enrollments = await Enrollment.find({ status: 'enrolled' });
    
    return {
      courses: courses.length,
      totalCapacity: courses.reduce((sum, course) => sum + course.capacity, 0),
      currentEnrollment: enrollments.length,
      utilizationRate: (enrollments.length / courses.reduce((sum, course) => sum + course.capacity, 0)) * 100,
      facultyLoad: await this.getFacultyLoadData(),
      roomUtilization: await this.getRoomUtilizationData()
    };
  }

  async getHistoricalCapacityData() {
    // Get historical data for trend analysis
    const historical = await Enrollment.aggregate([
      { $group: { _id: '$semester', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    return historical;
  }

  async bulkEnrollStudents(data) {
    const { students, program, semester } = data;
    const results = [];
    
    for (const studentData of students) {
      try {
        const enrollment = new Enrollment({
          student: studentData.studentId,
          program,
          semester,
          courses: studentData.courses,
          status: 'enrolled',
          automated: true
        });
        
        await enrollment.save();
        results.push({ studentId: studentData.studentId, status: 'success' });
      } catch (error) {
        results.push({ 
          studentId: studentData.studentId, 
          status: 'error', 
          message: error.message 
        });
      }
    }
    
    return {
      operation: 'bulk_enroll',
      processed: results.length,
      successful: results.filter(r => r.status === 'success').length,
      errors: results.filter(r => r.status === 'error')
    };
  }

  async generateComplianceData(timeframe) {
    const dateFilter = this.getTimeframeFilter(timeframe);
    
    return {
      enrollmentCompliance: await this.getEnrollmentCompliance(dateFilter),
      gradingCompliance: await this.getGradingCompliance(dateFilter),
      facultyCompliance: await this.getFacultyCompliance(dateFilter),
      resourceCompliance: await this.getResourceCompliance(dateFilter),
      integrityMetrics: await this.getIntegrityMetrics(dateFilter)
    };
  }

  getTimeframeFilter(timeframe) {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        return { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      case 'month':
        return { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      case 'semester':
        return { $gte: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000) };
      default:
        return { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }
  }
}

module.exports = new RegistrarController();
