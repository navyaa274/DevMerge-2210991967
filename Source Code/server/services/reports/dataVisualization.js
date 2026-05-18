/**
 * Advanced Data Visualization Service
 * Generates data for various chart types and visualizations
 */

const Submission = require('../../models/assessment/problems/Submission');
const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const Exam = require('../../models/assessment/exams/Exam');

class DataVisualization {
  /**
   * Generate time series data
   */
  static async generateTimeSeries(metric, timeRange = '7d', granularity = 'day') {
    const ranges = {
      '24h': 86400000,
      '7d': 604800000,
      '30d': 2592000000,
      '90d': 7776000000
    };

    const startDate = new Date(Date.now() - (ranges[timeRange] || ranges['7d']));

    const dateFormat = {
      hour: '%Y-%m-%d %H:00',
      day: '%Y-%m-%d',
      week: '%Y-W%V',
      month: '%Y-%m'
    };

    let data = [];

    switch (metric) {
      case 'submissions':
        data = await this.getSubmissionTimeSeries(startDate, dateFormat[granularity]);
        break;
      case 'users':
        data = await this.getUserTimeSeries(startDate, dateFormat[granularity]);
        break;
      case 'performance':
        data = await this.getPerformanceTimeSeries(startDate, dateFormat[granularity]);
        break;
      default:
        throw new Error('Invalid metric type');
    }

    return {
      metric,
      timeRange,
      granularity,
      data
    };
  }

  /**
   * Get submission time series
   */
  static async getSubmissionTimeSeries(startDate, dateFormat) {
    return await Submission.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          timestamp: '$_id',
          total: 1,
          accepted: 1,
          rejected: 1,
          pending: 1,
          successRate: {
            $cond: [
              { $gt: ['$total', 0] },
              { $multiply: [{ $divide: ['$accepted', '$total'] }, 100] },
              0
            ]
          }
        }
      }
    ]);
  }

  /**
   * Get user time series
   */
  static async getUserTimeSeries(startDate, dateFormat) {
    return await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          newUsers: { $sum: 1 },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          faculty: { $sum: { $cond: [{ $eq: ['$role', 'faculty'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          timestamp: '$_id',
          newUsers: 1,
          students: 1,
          faculty: 1
        }
      }
    ]);
  }

  /**
   * Get performance time series
   */
  static async getPerformanceTimeSeries(startDate, dateFormat) {
    return await Submission.aggregate([
      { $match: { createdAt: { $gte: startDate }, executionTime: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: '$createdAt' } },
          avgExecutionTime: { $avg: '$executionTime' },
          minExecutionTime: { $min: '$executionTime' },
          maxExecutionTime: { $max: '$executionTime' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          timestamp: '$_id',
          avgExecutionTime: { $round: ['$avgExecutionTime', 2] },
          minExecutionTime: 1,
          maxExecutionTime: 1,
          count: 1
        }
      }
    ]);
  }

  /**
   * Generate distribution chart data
   */
  static async generateDistribution(metric, filters = {}) {
    let data = [];

    switch (metric) {
      case 'difficulty':
        data = await this.getDifficultyDistribution(filters);
        break;
      case 'scores':
        data = await this.getScoreDistribution(filters);
        break;
      case 'categories':
        data = await this.getCategoryDistribution(filters);
        break;
      case 'languages':
        data = await this.getLanguageDistribution(filters);
        break;
      default:
        throw new Error('Invalid distribution metric');
    }

    return {
      metric,
      filters,
      data
    };
  }

  /**
   * Get difficulty distribution
   */
  static async getDifficultyDistribution(filters) {
    const match = {};
    if (filters.userId) match.userId = filters.userId;
    if (filters.startDate) match.createdAt = { $gte: new Date(filters.startDate) };

    return await Submission.aggregate([
      { $match: match },
      { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'problem' } },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.difficulty',
          count: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }
        }
      },
      {
        $project: {
          difficulty: '$_id',
          count: 1,
          accepted: 1,
          successRate: {
            $cond: [
              { $gt: ['$count', 0] },
              { $multiply: [{ $divide: ['$accepted', '$count'] }, 100] },
              0
            ]
          }
        }
      }
    ]);
  }

  /**
   * Get score distribution
   */
  static async getScoreDistribution(filters) {
    const match = {};
    if (filters.examId) match._id = filters.examId;

    const exams = await Exam.find(match).lean();
    const allScores = exams.flatMap(e => e.participants?.map(p => p.score) || []);

    // Create buckets
    const buckets = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '21-40', min: 21, max: 40, count: 0 },
      { range: '41-60', min: 41, max: 60, count: 0 },
      { range: '61-80', min: 61, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 }
    ];

    allScores.forEach(score => {
      const bucket = buckets.find(b => score >= b.min && score <= b.max);
      if (bucket) bucket.count++;
    });

    return buckets;
  }

  /**
   * Get category distribution
   */
  static async getCategoryDistribution(filters) {
    const match = {};
    if (filters.userId) match.userId = filters.userId;

    return await Submission.aggregate([
      { $match: match },
      { $lookup: { from: 'problems', localField: 'problemId', foreignField: '_id', as: 'problem' } },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.category',
          count: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          category: '$_id',
          count: 1,
          accepted: 1,
          percentage: { $multiply: [{ $divide: ['$count', { $sum: '$count' }] }, 100] }
        }
      }
    ]);
  }

  /**
   * Get language distribution
   */
  static async getLanguageDistribution(filters) {
    const match = {};
    if (filters.userId) match.userId = filters.userId;

    return await Submission.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$language',
          count: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          language: '$_id',
          count: 1,
          accepted: 1
        }
      }
    ]);
  }

  /**
   * Generate heatmap data
   */
  static async generateHeatmap(metric, filters = {}) {
    let data = [];

    switch (metric) {
      case 'activity':
        data = await this.getActivityHeatmap(filters);
        break;
      case 'performance':
        data = await this.getPerformanceHeatmap(filters);
        break;
      default:
        throw new Error('Invalid heatmap metric');
    }

    return {
      metric,
      filters,
      data
    };
  }

  /**
   * Get activity heatmap (day of week vs hour)
   */
  static async getActivityHeatmap(filters) {
    const match = {};
    if (filters.userId) match.userId = filters.userId;
    if (filters.startDate) match.createdAt = { $gte: new Date(filters.startDate) };

    const submissions = await Submission.find(match).lean();

    const heatmap = Array(7).fill(0).map(() => Array(24).fill(0));

    submissions.forEach(sub => {
      const date = new Date(sub.createdAt);
      const day = date.getDay();
      const hour = date.getHours();
      heatmap[day][hour]++;
    });

    return heatmap.map((hours, day) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
      hours: hours.map((count, hour) => ({ hour, count }))
    }));
  }

  /**
   * Get performance heatmap
   */
  static async getPerformanceHeatmap(filters) {
    // Similar to activity but with success rates
    const match = {};
    if (filters.userId) match.userId = filters.userId;

    const submissions = await Submission.find(match).lean();

    const heatmap = Array(7).fill(0).map(() =>
      Array(24).fill(0).map(() => ({ total: 0, accepted: 0 }))
    );

    submissions.forEach(sub => {
      const date = new Date(sub.createdAt);
      const day = date.getDay();
      const hour = date.getHours();
      heatmap[day][hour].total++;
      if (sub.status === 'accepted') heatmap[day][hour].accepted++;
    });

    return heatmap.map((hours, day) => ({
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
      hours: hours.map((data, hour) => ({
        hour,
        successRate: data.total > 0 ? Math.round((data.accepted / data.total) * 100) : 0
      }))
    }));
  }

  /**
   * Generate comparison chart data
   */
  static async generateComparison(entities, metric) {
    const data = [];

    for (const entity of entities) {
      let value;

      switch (metric) {
        case 'submissions':
          value = await Submission.countDocuments({ userId: entity.id });
          break;
        case 'successRate':
          const submissions = await Submission.find({ userId: entity.id }).lean();
          const accepted = submissions.filter(s => s.status === 'accepted').length;
          value = submissions.length > 0 ? (accepted / submissions.length) * 100 : 0;
          break;
        case 'avgScore':
          const exams = await Exam.find({ 'participants.userId': entity.id }).lean();
          const scores = exams.flatMap(e =>
            e.participants?.filter(p => p.userId.toString() === entity.id).map(p => p.score) || []
          );
          value = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
          break;
        default:
          value = 0;
      }

      data.push({
        id: entity.id,
        name: entity.name,
        value: Math.round(value * 100) / 100
      });
    }

    return {
      metric,
      data
    };
  }
}

module.exports = DataVisualization;
