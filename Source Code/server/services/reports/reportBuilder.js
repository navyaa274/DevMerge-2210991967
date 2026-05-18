/**
 * Custom Report Builder Service
 * Allows users to create custom reports with various metrics and filters
 */

const Submission = require('../../models/assessment/problems/Submission');
const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const Exam = require('../../models/assessment/exams/Exam');
const Assignment = require('../../models/assessment/assignments/Assignment');

class ReportBuilder {
  /**
   * Build custom report
   */
  static async buildReport(config) {
    const {
      title,
      metrics = [],
      filters = {},
      groupBy = null,
      sortBy = null,
      limit = 100
    } = config;

    const results = {};

    // Apply filters
    const baseFilters = this.buildFilters(filters);

    // Calculate each metric
    for (const metric of metrics) {
      results[metric] = await this.calculateMetric(metric, baseFilters, groupBy);
    }

    // Apply sorting and limiting
    let finalData = this.formatResults(results, groupBy);

    if (sortBy) {
      finalData = this.sortResults(finalData, sortBy);
    }

    if (limit) {
      finalData = finalData.slice(0, limit);
    }

    return {
      title,
      generatedAt: new Date(),
      filters,
      metrics,
      data: finalData,
      summary: this.generateSummary(results)
    };
  }

  /**
   * Build MongoDB filters from config
   */
  static buildFilters(filters) {
    const mongoFilters = {};

    if (filters.startDate) {
      mongoFilters.createdAt = { $gte: new Date(filters.startDate) };
    }

    if (filters.endDate) {
      mongoFilters.createdAt = {
        ...mongoFilters.createdAt,
        $lte: new Date(filters.endDate)
      };
    }

    if (filters.userId) {
      mongoFilters.userId = filters.userId;
    }

    if (filters.courseId) {
      mongoFilters.courseId = filters.courseId;
    }

    if (filters.department) {
      mongoFilters.department = filters.department;
    }

    if (filters.role) {
      mongoFilters.role = filters.role;
    }

    return mongoFilters;
  }

  /**
   * Calculate specific metric
   */
  static async calculateMetric(metric, filters, groupBy) {
    switch (metric) {
      case 'totalSubmissions':
        return await this.getTotalSubmissions(filters, groupBy);

      case 'acceptedSubmissions':
        return await this.getAcceptedSubmissions(filters, groupBy);

      case 'successRate':
        return await this.getSuccessRate(filters, groupBy);

      case 'avgExecutionTime':
        return await this.getAvgExecutionTime(filters, groupBy);

      case 'activeUsers':
        return await this.getActiveUsers(filters, groupBy);

      case 'courseEnrollment':
        return await this.getCourseEnrollment(filters, groupBy);

      case 'examScores':
        return await this.getExamScores(filters, groupBy);

      case 'assignmentCompletion':
        return await this.getAssignmentCompletion(filters, groupBy);

      default:
        return null;
    }
  }

  /**
   * Get total submissions
   */
  static async getTotalSubmissions(filters, groupBy) {
    if (groupBy) {
      return await Submission.aggregate([
        { $match: filters },
        { $group: { _id: `$${groupBy}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
    }
    return await Submission.countDocuments(filters);
  }

  /**
   * Get accepted submissions
   */
  static async getAcceptedSubmissions(filters, groupBy) {
    const acceptedFilters = { ...filters, status: 'accepted' };

    if (groupBy) {
      return await Submission.aggregate([
        { $match: acceptedFilters },
        { $group: { _id: `$${groupBy}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
    }
    return await Submission.countDocuments(acceptedFilters);
  }

  /**
   * Get success rate
   */
  static async getSuccessRate(filters, groupBy) {
    if (groupBy) {
      return await Submission.aggregate([
        { $match: filters },
        {
          $group: {
            _id: `$${groupBy}`,
            total: { $sum: 1 },
            accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }
          }
        },
        {
          $project: {
            total: 1,
            accepted: 1,
            successRate: {
              $cond: [
                { $gt: ['$total', 0] },
                { $multiply: [{ $divide: ['$accepted', '$total'] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { successRate: -1 } }
      ]);
    }

    const total = await Submission.countDocuments(filters);
    const accepted = await Submission.countDocuments({ ...filters, status: 'accepted' });
    return total > 0 ? (accepted / total) * 100 : 0;
  }

  /**
   * Get average execution time
   */
  static async getAvgExecutionTime(filters, groupBy) {
    const execFilters = { ...filters, executionTime: { $exists: true } };

    if (groupBy) {
      return await Submission.aggregate([
        { $match: execFilters },
        {
          $group: {
            _id: `$${groupBy}`,
            avgTime: { $avg: '$executionTime' },
            count: { $sum: 1 }
          }
        },
        { $sort: { avgTime: 1 } }
      ]);
    }

    const result = await Submission.aggregate([
      { $match: execFilters },
      { $group: { _id: null, avgTime: { $avg: '$executionTime' } } }
    ]);

    return result[0]?.avgTime || 0;
  }

  /**
   * Get active users
   */
  static async getActiveUsers(filters, groupBy) {
    const userFilters = {};
    if (filters.role) userFilters.role = filters.role;
    if (filters.department) userFilters.department = filters.department;

    if (groupBy) {
      return await User.aggregate([
        { $match: userFilters },
        { $group: { _id: `$${groupBy}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
    }

    return await User.countDocuments(userFilters);
  }

  /**
   * Get course enrollment
   */
  static async getCourseEnrollment(filters, groupBy) {
    const courseFilters = {};
    if (filters.department) courseFilters.department = filters.department;

    if (groupBy) {
      return await Course.aggregate([
        { $match: courseFilters },
        {
          $project: {
            [groupBy]: 1,
            enrollmentCount: { $size: { $ifNull: ['$enrolledStudents', []] } }
          }
        },
        {
          $group: {
            _id: `$${groupBy}`,
            totalEnrollment: { $sum: '$enrollmentCount' },
            courseCount: { $sum: 1 }
          }
        },
        { $sort: { totalEnrollment: -1 } }
      ]);
    }

    const courses = await Course.find(courseFilters).lean();
    return courses.reduce((sum, c) => sum + (c.enrolledStudents?.length || 0), 0);
  }

  /**
   * Get exam scores
   */
  static async getExamScores(filters, groupBy) {
    const examFilters = {};
    if (filters.courseId) examFilters.courseId = filters.courseId;

    const exams = await Exam.find(examFilters).lean();
    const allScores = exams.flatMap(e => e.participants?.map(p => p.score) || []);

    if (allScores.length === 0) return 0;

    const avgScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const minScore = Math.min(...allScores);
    const maxScore = Math.max(...allScores);

    return {
      average: avgScore,
      min: minScore,
      max: maxScore,
      count: allScores.length
    };
  }

  /**
   * Get assignment completion
   */
  static async getAssignmentCompletion(filters, groupBy) {
    const assignmentFilters = {};
    if (filters.courseId) assignmentFilters.courseId = filters.courseId;

    const assignments = await Assignment.find(assignmentFilters).lean();

    const totalAssignments = assignments.length;
    const completedCount = assignments.reduce((sum, a) => {
      const completed = a.submissions?.filter(s => s.status === 'submitted').length || 0;
      return sum + completed;
    }, 0);

    const totalPossible = assignments.reduce((sum, a) => {
      return sum + (a.submissions?.length || 0);
    }, 0);

    return {
      totalAssignments,
      completedCount,
      totalPossible,
      completionRate: totalPossible > 0 ? (completedCount / totalPossible) * 100 : 0
    };
  }

  /**
   * Format results
   */
  static formatResults(results, groupBy) {
    if (!groupBy) {
      return [results];
    }

    // Combine grouped results
    const formatted = {};

    Object.entries(results).forEach(([metric, data]) => {
      if (Array.isArray(data)) {
        data.forEach(item => {
          const key = item._id;
          if (!formatted[key]) {
            formatted[key] = { [groupBy]: key };
          }
          formatted[key][metric] = item.count || item.avgTime || item.successRate || item;
        });
      }
    });

    return Object.values(formatted);
  }

  /**
   * Sort results
   */
  static sortResults(data, sortBy) {
    const [field, order = 'desc'] = sortBy.split(':');

    return data.sort((a, b) => {
      const aVal = a[field] || 0;
      const bVal = b[field] || 0;
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  /**
   * Generate summary
   */
  static generateSummary(results) {
    const summary = {};

    Object.entries(results).forEach(([metric, value]) => {
      if (typeof value === 'number') {
        summary[metric] = Math.round(value * 100) / 100;
      } else if (Array.isArray(value)) {
        summary[metric] = {
          count: value.length,
          total: value.reduce((sum, item) => sum + (item.count || 0), 0)
        };
      } else if (typeof value === 'object') {
        summary[metric] = value;
      }
    });

    return summary;
  }

  /**
   * Export report to CSV
   */
  static exportToCSV(report) {
    const { data } = report;
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    );

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Get available metrics
   */
  static getAvailableMetrics() {
    return [
      { id: 'totalSubmissions', name: 'Total Submissions', type: 'count' },
      { id: 'acceptedSubmissions', name: 'Accepted Submissions', type: 'count' },
      { id: 'successRate', name: 'Success Rate', type: 'percentage' },
      { id: 'avgExecutionTime', name: 'Average Execution Time', type: 'time' },
      { id: 'activeUsers', name: 'Active Users', type: 'count' },
      { id: 'courseEnrollment', name: 'Course Enrollment', type: 'count' },
      { id: 'examScores', name: 'Exam Scores', type: 'score' },
      { id: 'assignmentCompletion', name: 'Assignment Completion', type: 'percentage' }
    ];
  }

  /**
   * Get available group by options
   */
  static getGroupByOptions() {
    return [
      { id: 'userId', name: 'User' },
      { id: 'courseId', name: 'Course' },
      { id: 'department', name: 'Department' },
      { id: 'difficulty', name: 'Difficulty' },
      { id: 'category', name: 'Category' },
      { id: 'language', name: 'Programming Language' }
    ];
  }
}

module.exports = ReportBuilder;
