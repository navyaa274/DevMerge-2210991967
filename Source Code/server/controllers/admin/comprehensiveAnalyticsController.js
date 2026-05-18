const mongoose = require('mongoose');
const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const Submission = require('../../models/assessment/problems/Submission');
const Enrollment = require('../../models/learning/enrollments/Enrollment');
const QuizAttempt = require('../../models/assessment/quizAttempts');
const Attendance = require('../../models/academic/Attendance');
const PredictiveAnalytics = require('../../models/assessment/predictiveAnalytics');

/**
 * Comprehensive Analytics Controller
 * Provides advanced analytics and reporting features for the university platform
 */

class ComprehensiveAnalyticsController {
  // 📊 Student Performance Analytics
  async getStudentPerformanceAnalytics(req, res) {
    try {
      const { timeRange = '30', department, course } = req.query;
      const days = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Build match conditions
      const matchConditions = {
        role: 'student',
        createdAt: { $gte: startDate }
      };

      if (department) matchConditions.department = new mongoose.Types.ObjectId(department);

      // Student performance metrics
      const performanceMetrics = await User.aggregate([
        { $match: matchConditions },
        {
          $lookup: {
            from: 'submissions',
            localField: '_id',
            foreignField: 'student',
            as: 'submissions'
          }
        },
        {
          $lookup: {
            from: 'quizattempts',
            localField: '_id',
            foreignField: 'student',
            as: 'quizAttempts'
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            department: 1,
            submissionCount: { $size: '$submissions' },
            acceptedSubmissions: {
              $size: {
                $filter: {
                  input: '$submissions',
                  cond: { $eq: ['$$this.status', 'Accepted'] }
                }
              }
            },
            quizAttemptsCount: { $size: '$quizAttempts' },
            averageQuizScore: {
              $avg: '$quizAttempts.score'
            }
          }
        },
        {
          $addFields: {
            acceptanceRate: {
              $cond: [
                { $eq: ['$submissionCount', 0] },
                0,
                { $multiply: [{ $divide: ['$acceptedSubmissions', '$submissionCount'] }, 100] }
              ]
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: performanceMetrics,
        summary: {
          totalStudents: performanceMetrics.length,
          averageAcceptanceRate: performanceMetrics.reduce((sum, s) => sum + s.acceptanceRate, 0) / performanceMetrics.length || 0,
          averageQuizScore: performanceMetrics.reduce((sum, s) => sum + (s.averageQuizScore || 0), 0) / performanceMetrics.length || 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch student performance analytics',
        error: error.message
      });
    }
  }

  // 📈 Course Engagement Analytics
  async getCourseEngagementAnalytics(req, res) {
    try {
      const { timeRange = '30' } = req.query;
      const days = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const courseEngagement = await Course.aggregate([
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'course',
            as: 'enrollments'
          }
        },
        {
          $lookup: {
            from: 'submissions',
            localField: '_id',
            foreignField: 'course',
            as: 'submissions'
          }
        },
        {
          $lookup: {
            from: 'quizattempts',
            localField: '_id',
            foreignField: 'course',
            as: 'quizAttempts'
          }
        },
        {
          $project: {
            title: 1,
            code: 1,
            department: 1,
            enrollmentCount: { $size: '$enrollments' },
            submissionCount: { $size: '$submissions' },
            quizAttemptCount: { $size: '$quizAttempts' },
            activeStudents: {
              $size: {
                $filter: {
                  input: '$enrollments',
                  cond: { $gte: ['$$this.lastActive', startDate] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            engagementRate: {
              $cond: [
                { $eq: ['$enrollmentCount', 0] },
                0,
                { $multiply: [{ $divide: ['$activeStudents', '$enrollmentCount'] }, 100] }
              ]
            },
            submissionPerStudent: {
              $cond: [
                { $eq: ['$enrollmentCount', 0] },
                0,
                { $divide: ['$submissionCount', '$enrollmentCount'] }
              ]
            }
          }
        },
        { $sort: { engagementRate: -1 } }
      ]);

      res.json({
        success: true,
        data: courseEngagement,
        summary: {
          totalCourses: courseEngagement.length,
          averageEngagementRate: courseEngagement.reduce((sum, c) => sum + c.engagementRate, 0) / courseEngagement.length || 0,
          totalEnrollments: courseEngagement.reduce((sum, c) => sum + c.enrollmentCount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch course engagement analytics',
        error: error.message
      });
    }
  }

  // 🎯 Learning Outcomes Analytics
  async getLearningOutcomesAnalytics(req, res) {
    try {
      const { courseIds } = req.body; // Array of course IDs
      const { timeRange = '30' } = req.query;
      const days = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const matchStage = courseIds && courseIds.length > 0 
        ? { course: { $in: courseIds.map(id => new mongoose.Types.ObjectId(id)) } }
        : {};

      // Learning outcomes by course and department
      const learningOutcomes = await Submission.aggregate([
        { $match: { ...matchStage, submittedAt: { $gte: startDate } } },
        {
          $lookup: {
            from: 'courses',
            localField: 'course',
            foreignField: '_id',
            as: 'courseInfo'
          }
        },
        { $unwind: '$courseInfo' },
        {
          $group: {
            _id: {
              course: '$courseInfo._id',
              department: '$courseInfo.department',
              difficulty: '$difficulty'
            },
            totalSubmissions: { $sum: 1 },
            acceptedSubmissions: {
              $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] }
            },
            averageRuntime: { $avg: '$runtime' },
            averageMemory: { $avg: '$memory' }
          }
        },
        {
          $addFields: {
            successRate: {
              $multiply: [{ $divide: ['$acceptedSubmissions', '$totalSubmissions'] }, 100]
            }
          }
        },
        {
          $group: {
            _id: '$_id.department',
            courses: {
              $push: {
                courseId: '$_id.course',
                difficulty: '$_id.difficulty',
                totalSubmissions: '$totalSubmissions',
                successRate: '$successRate',
                averageRuntime: '$averageRuntime',
                averageMemory: '$averageMemory'
              }
            },
            departmentSuccessRate: { $avg: '$successRate' },
            totalSubmissions: { $sum: '$totalSubmissions' }
          }
        }
      ]);

      res.json({
        success: true,
        data: learningOutcomes,
        summary: {
          departmentsCount: learningOutcomes.length,
          overallSuccessRate: learningOutcomes.reduce((sum, d) => sum + d.departmentSuccessRate, 0) / learningOutcomes.length || 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch learning outcomes analytics',
        error: error.message
      });
    }
  }

  // 🔍 Predictive Analytics Dashboard
  async getPredictiveAnalyticsDashboard(req, res) {
    try {
      const { predictionType, timeRange = '30' } = req.query;
      const days = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const matchConditions = { created_at: { $gte: startDate } };
      if (predictionType) matchConditions.prediction_type = predictionType;

      const predictiveData = await PredictiveAnalytics.aggregate([
        { $match: matchConditions },
        {
          $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'course_id',
            foreignField: '_id',
            as: 'courseInfo'
          }
        },
        { $unwind: '$userInfo' },
        { $unwind: '$courseInfo' },
        {
          $group: {
            _id: {
              predictionType: '$prediction_type',
              department: '$courseInfo.department'
            },
            count: { $sum: 1 },
            averagePredictionValue: { $avg: '$prediction_value' },
            averageConfidence: { $avg: '$confidence_score' },
            highRiskCount: {
              $sum: {
                $cond: [
                  {
                    $or: [
                      { $eq: ['$prediction_type', 'dropout_risk'] },
                      { $lt: ['$prediction_value', 0.5] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $group: {
            _id: '$_id.predictionType',
            departments: {
              $push: {
                department: '$_id.department',
                count: '$count',
                averagePredictionValue: '$averagePredictionValue',
                averageConfidence: '$averageConfidence',
                highRiskCount: '$highRiskCount'
              }
            },
            totalCount: { $sum: '$count' },
            overallAverageValue: { $avg: '$averagePredictionValue' },
            overallHighRiskCount: { $sum: '$highRiskCount' }
          }
        }
      ]);

      res.json({
        success: true,
        data: predictiveData,
        summary: {
          totalPredictions: predictiveData.reduce((sum, p) => sum + p.totalCount, 0),
          totalHighRiskCases: predictiveData.reduce((sum, p) => sum + p.overallHighRiskCount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch predictive analytics dashboard',
        error: error.message
      });
    }
  }

  // 📊 System Health & Performance Analytics
  async getSystemHealthAnalytics(req, res) {
    try {
      const { timeRange = '24' } = req.query;
      const hours = parseInt(timeRange);
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - hours);

      // System metrics
      const [
        totalUsers,
        activeUsers,
        totalCourses,
        totalSubmissions,
        recentSubmissions,
        errorLogs
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ lastActive: { $gte: startDate } }),
        Course.countDocuments(),
        Submission.countDocuments(),
        Submission.countDocuments({ submittedAt: { $gte: startDate } }),
        // This would require error logs collection - placeholder
        0
      ]);

      // Performance metrics
      const performanceMetrics = await Submission.aggregate([
        { $match: { submittedAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            averageRuntime: { $avg: '$runtime' },
            maxRuntime: { $max: '$runtime' },
            averageMemory: { $avg: '$memory' },
            maxMemory: { $max: '$memory' },
            totalSubmissions: { $sum: 1 }
          }
        }
      ]);

      const metrics = performanceMetrics[0] || {};

      res.json({
        success: true,
        data: {
          userMetrics: {
            totalUsers,
            activeUsers,
            userActivityRate: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0
          },
          contentMetrics: {
            totalCourses,
            totalSubmissions,
            recentActivity: recentSubmissions
          },
          performanceMetrics: {
            averageRuntime: metrics.averageRuntime || 0,
            maxRuntime: metrics.maxRuntime || 0,
            averageMemory: metrics.averageMemory || 0,
            maxMemory: metrics.maxMemory || 0
          },
          systemHealth: {
            errorCount: errorLogs,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage()
          }
        },
        timestamp: new Date()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system health analytics',
        error: error.message
      });
    }
  }

  // 📋 Custom Report Builder
  async generateCustomReport(req, res) {
    try {
      const { 
        reportType, 
        filters, 
        metrics, 
        format = 'json',
        timeRange = '30' 
      } = req.body;

      const days = parseInt(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let reportData = {};

      switch (reportType) {
        case 'student_performance':
          reportData = await this.generateStudentPerformanceReport(filters, metrics, startDate);
          break;
        case 'course_engagement':
          reportData = await this.generateCourseEngagementReport(filters, metrics, startDate);
          break;
        case 'learning_outcomes':
          reportData = await this.generateLearningOutcomesReport(filters, metrics, startDate);
          break;
        case 'predictive_insights':
          reportData = await this.generatePredictiveInsightsReport(filters, metrics, startDate);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid report type'
          });
      }

      // Format response based on requested format
      if (format === 'csv') {
        const csv = this.convertToCSV(reportData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="report-${Date.now()}.csv"`);
        return res.send(csv);
      }

      res.json({
        success: true,
        data: reportData,
        metadata: {
          reportType,
          filters,
          metrics,
          generatedAt: new Date(),
          timeRange
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to generate custom report',
        error: error.message
      });
    }
  }

  // Helper methods for report generation
  async generateStudentPerformanceReport(filters, metrics, startDate) {
    // Implementation for student performance report
    const matchConditions = { role: 'student', createdAt: { $gte: startDate } };
    if (filters.department) matchConditions.department = new mongoose.Types.ObjectId(filters.department);

    return await User.aggregate([
      { $match: matchConditions },
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'student',
          as: 'submissions'
        }
      },
      {
        $project: this.buildProjection(metrics)
      }
    ]);
  }

  async generateCourseEngagementReport(filters, metrics, startDate) {
    // Implementation for course engagement report
    return await Course.aggregate([
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $project: this.buildProjection(metrics)
      }
    ]);
  }

  async generateLearningOutcomesReport(filters, metrics, startDate) {
    // Implementation for learning outcomes report
    return await Submission.aggregate([
      { $match: { submittedAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$course',
          ...this.buildGrouping(metrics)
        }
      }
    ]);
  }

  async generatePredictiveInsightsReport(filters, metrics, startDate) {
    // Implementation for predictive insights report
    return await PredictiveAnalytics.find({
      created_at: { $gte: startDate },
      ...filters
    });
  }

  buildProjection(metrics) {
    // Build MongoDB projection based on requested metrics
    const projection = {};
    metrics.forEach(metric => {
      projection[metric] = 1;
    });
    return projection;
  }

  buildGrouping(metrics) {
    // Build MongoDB grouping based on requested metrics
    const grouping = {};
    metrics.forEach(metric => {
      if (metric.includes('Count')) {
        grouping[metric] = { $sum: 1 };
      } else if (metric.includes('Average')) {
        const field = metric.replace('Average', '').toLowerCase();
        grouping[metric] = { $avg: `$${field}` };
      }
    });
    return grouping;
  }

  convertToCSV(data) {
    // Convert data to CSV format
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
  }
}

module.exports = new ComprehensiveAnalyticsController();
