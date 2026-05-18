/**
 * Trend Analysis Service
 * Analyzes trends and patterns in student performance and system metrics
 */

const Submission = require('../../models/assessment/problems/Submission');
const User = require('../../models/auth/User');
const Exam = require('../../models/assessment/exams/Exam');

class TrendAnalysis {
  /**
   * Analyze performance trends over time
   */
  static async analyzePerformanceTrend(userId, timeWindow = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeWindow);

      const submissions = await Submission.find({
        userId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 }).lean();

      if (submissions.length < 5) {
        return {
          success: false,
          message: 'Insufficient data for trend analysis'
        };
      }

      // Split into time periods
      const periods = this.splitIntoPeriods(submissions, 5);

      // Calculate metrics for each period
      const periodMetrics = periods.map(period => ({
        startDate: period[0]?.createdAt,
        endDate: period[period.length - 1]?.createdAt,
        totalSubmissions: period.length,
        acceptedSubmissions: period.filter(s => s.status === 'accepted').length,
        successRate: period.length > 0
          ? (period.filter(s => s.status === 'accepted').length / period.length) * 100
          : 0,
        avgAttempts: period.reduce((sum, s) => sum + (s.attempts || 1), 0) / period.length
      }));

      // Calculate trend direction
      const trend = this.calculateTrendDirection(periodMetrics);

      // Detect patterns
      const patterns = this.detectPatterns(periodMetrics);

      // Generate forecast
      const forecast = this.generateForecast(periodMetrics);

      return {
        success: true,
        userId,
        timeWindow,
        periodMetrics,
        trend,
        patterns,
        forecast,
        insights: this.generateInsights(trend, patterns)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Split submissions into time periods
   */
  static splitIntoPeriods(submissions, numPeriods) {
    const periodSize = Math.ceil(submissions.length / numPeriods);
    const periods = [];

    for (let i = 0; i < numPeriods; i++) {
      const start = i * periodSize;
      const end = Math.min(start + periodSize, submissions.length);
      periods.push(submissions.slice(start, end));
    }

    return periods.filter(p => p.length > 0);
  }

  /**
   * Calculate trend direction using linear regression
   */
  static calculateTrendDirection(periodMetrics) {
    const n = periodMetrics.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = periodMetrics.map(p => p.successRate);

    // Calculate linear regression
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R-squared
    const yMean = sumY / n;
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0);
    const ssResidual = y.reduce((sum, yi, i) => {
      const predicted = slope * x[i] + intercept;
      return sum + Math.pow(yi - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    return {
      direction: slope > 0.5 ? 'improving' : slope < -0.5 ? 'declining' : 'stable',
      slope: Math.round(slope * 100) / 100,
      strength: Math.abs(slope),
      confidence: Math.round(rSquared * 100),
      equation: `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`
    };
  }

  /**
   * Detect patterns in performance
   */
  static detectPatterns(periodMetrics) {
    const patterns = [];

    // Check for volatility
    const successRates = periodMetrics.map(p => p.successRate);
    const variance = this.calculateVariance(successRates);

    if (variance > 400) {
      patterns.push({
        type: 'high_volatility',
        severity: 'medium',
        description: 'Performance shows high variability',
        variance: Math.round(variance)
      });
    }

    // Check for plateau
    const recentRates = successRates.slice(-3);
    const avgRecent = recentRates.reduce((a, b) => a + b, 0) / recentRates.length;
    const isPlateaued = recentRates.every(r => Math.abs(r - avgRecent) < 5);

    if (isPlateaued) {
      patterns.push({
        type: 'plateau',
        severity: 'low',
        description: 'Performance has plateaued',
        level: Math.round(avgRecent)
      });
    }

    // Check for sudden drop
    for (let i = 1; i < successRates.length; i++) {
      const drop = successRates[i - 1] - successRates[i];
      if (drop > 20) {
        patterns.push({
          type: 'sudden_drop',
          severity: 'high',
          description: `Sudden drop detected between period ${i} and ${i + 1}`,
          drop: Math.round(drop)
        });
      }
    }

    // Check for consistent improvement
    const improvements = successRates.slice(1).map((rate, i) => rate - successRates[i]);
    const allImproving = improvements.every(imp => imp > 0);

    if (allImproving) {
      patterns.push({
        type: 'consistent_improvement',
        severity: 'positive',
        description: 'Consistent improvement across all periods',
        avgImprovement: Math.round(improvements.reduce((a, b) => a + b, 0) / improvements.length)
      });
    }

    return patterns;
  }

  /**
   * Generate forecast for next period
   */
  static generateForecast(periodMetrics) {
    const recentMetrics = periodMetrics.slice(-3);
    const avgSuccessRate = recentMetrics.reduce((sum, p) => sum + p.successRate, 0) / recentMetrics.length;
    const avgSubmissions = recentMetrics.reduce((sum, p) => sum + p.totalSubmissions, 0) / recentMetrics.length;

    // Simple moving average forecast
    const trend = periodMetrics[periodMetrics.length - 1].successRate - periodMetrics[0].successRate;
    const trendPerPeriod = trend / periodMetrics.length;

    return {
      nextPeriod: {
        predictedSuccessRate: Math.max(0, Math.min(100, avgSuccessRate + trendPerPeriod)),
        predictedSubmissions: Math.round(avgSubmissions),
        confidence: 70
      },
      recommendation: this.getRecommendation(avgSuccessRate, trendPerPeriod)
    };
  }

  /**
   * Get recommendation based on forecast
   */
  static getRecommendation(currentRate, trend) {
    if (currentRate < 40) {
      return 'Focus on fundamentals and easier problems';
    } else if (currentRate < 60) {
      return 'Practice consistently and review mistakes';
    } else if (trend < 0) {
      return 'Maintain current pace and avoid burnout';
    } else {
      return 'Challenge yourself with harder problems';
    }
  }

  /**
   * Generate insights
   */
  static generateInsights(trend, patterns) {
    const insights = [];

    if (trend.direction === 'improving') {
      insights.push({
        type: 'positive',
        message: `Performance is improving with ${trend.confidence}% confidence`,
        action: 'Keep up the good work!'
      });
    } else if (trend.direction === 'declining') {
      insights.push({
        type: 'warning',
        message: `Performance is declining with ${trend.confidence}% confidence`,
        action: 'Consider seeking help or adjusting study strategy'
      });
    }

    patterns.forEach(pattern => {
      if (pattern.type === 'high_volatility') {
        insights.push({
          type: 'info',
          message: 'Performance is inconsistent',
          action: 'Work on maintaining steady progress'
        });
      } else if (pattern.type === 'sudden_drop') {
        insights.push({
          type: 'alert',
          message: 'Sudden performance drop detected',
          action: 'Review recent changes in study habits'
        });
      }
    });

    return insights;
  }

  /**
   * Calculate variance
   */
  static calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  /**
   * Analyze class-wide trends
   */
  static async analyzeClassTrends(courseId, timeWindow = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeWindow);

      // Get all students in course
      const students = await User.find({
        courses: courseId,
        role: 'student'
      }).select('_id').lean();

      const studentIds = students.map(s => s._id);

      // Get submissions
      const submissions = await Submission.find({
        userId: { $in: studentIds },
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 }).lean();

      // Group by week
      const weeklyData = this.groupByWeek(submissions);

      // Calculate metrics
      const weeklyMetrics = weeklyData.map(week => ({
        week: week.weekNumber,
        totalSubmissions: week.submissions.length,
        uniqueStudents: new Set(week.submissions.map(s => s.userId.toString())).size,
        successRate: week.submissions.length > 0
          ? (week.submissions.filter(s => s.status === 'accepted').length / week.submissions.length) * 100
          : 0,
        avgAttempts: week.submissions.reduce((sum, s) => sum + (s.attempts || 1), 0) / week.submissions.length || 0
      }));

      return {
        success: true,
        courseId,
        timeWindow,
        weeklyMetrics,
        summary: {
          totalStudents: studentIds.length,
          activeStudents: new Set(submissions.map(s => s.userId.toString())).size,
          totalSubmissions: submissions.length,
          overallSuccessRate: submissions.length > 0
            ? (submissions.filter(s => s.status === 'accepted').length / submissions.length) * 100
            : 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Group submissions by week
   */
  static groupByWeek(submissions) {
    const weeks = {};

    submissions.forEach(sub => {
      const date = new Date(sub.createdAt);
      const weekNumber = this.getWeekNumber(date);

      if (!weeks[weekNumber]) {
        weeks[weekNumber] = {
          weekNumber,
          submissions: []
        };
      }

      weeks[weekNumber].submissions.push(sub);
    });

    return Object.values(weeks).sort((a, b) => a.weekNumber - b.weekNumber);
  }

  /**
   * Get week number of year
   */
  static getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Compare trends between students
   */
  static async compareTrends(userIds, timeWindow = 30) {
    const comparisons = [];

    for (const userId of userIds) {
      const trend = await this.analyzePerformanceTrend(userId, timeWindow);
      if (trend.success) {
        comparisons.push({
          userId,
          trend: trend.trend,
          currentPerformance: trend.periodMetrics[trend.periodMetrics.length - 1]?.successRate || 0,
          forecast: trend.forecast
        });
      }
    }

    return {
      success: true,
      comparisons,
      summary: {
        improving: comparisons.filter(c => c.trend.direction === 'improving').length,
        declining: comparisons.filter(c => c.trend.direction === 'declining').length,
        stable: comparisons.filter(c => c.trend.direction === 'stable').length
      }
    };
  }
}

module.exports = TrendAnalysis;
