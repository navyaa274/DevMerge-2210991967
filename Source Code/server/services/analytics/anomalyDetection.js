/**
 * Anomaly Detection Service
 * Detects unusual patterns in student behavior and system metrics
 */

const Submission = require('../../models/assessment/problems/Submission');
const User = require('../../models/auth/User');
const Exam = require('../../models/assessment/exams/Exam');

class AnomalyDetection {
  /**
   * Detect anomalies in student submission patterns
   */
  static async detectSubmissionAnomalies(userId, timeWindow = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeWindow);

      const submissions = await Submission.find({
        userId,
        createdAt: { $gte: startDate }
      }).sort({ createdAt: 1 }).lean();

      const anomalies = [];

      // Check for unusual submission frequency
      const frequencyAnomaly = this.detectFrequencyAnomaly(submissions);
      if (frequencyAnomaly) anomalies.push(frequencyAnomaly);

      // Check for unusual success rate changes
      const successRateAnomaly = this.detectSuccessRateAnomaly(submissions);
      if (successRateAnomaly) anomalies.push(successRateAnomaly);

      // Check for unusual time patterns
      const timeAnomaly = this.detectTimePatternAnomaly(submissions);
      if (timeAnomaly) anomalies.push(timeAnomaly);

      // Check for difficulty spike
      const difficultyAnomaly = this.detectDifficultyAnomaly(submissions);
      if (difficultyAnomaly) anomalies.push(difficultyAnomaly);

      return {
        success: true,
        userId,
        timeWindow,
        anomaliesDetected: anomalies.length,
        anomalies,
        riskLevel: this.calculateRiskLevel(anomalies)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detect frequency anomalies using standard deviation Z-scores
   */
  static detectFrequencyAnomaly(submissions) {
    // Need at least few days of data to establish a baseline
    if (submissions.length < 3) return null;

    // Calculate daily submission counts
    const dailyCounts = {};
    submissions.forEach(sub => {
      const date = new Date(sub.createdAt).toDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const dates = Object.keys(dailyCounts);
    if (dates.length < 2) return null;

    const counts = Object.values(dailyCounts);
    const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
    const squaredDiffs = counts.map(count => Math.pow(count - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    // Filter today/most recent day activity
    const lastDate = dates.sort((a, b) => new Date(b) - new Date(a))[0];
    const lastCount = dailyCounts[lastDate];

    // Z-score calculation for the most recent day
    const z = stdDev > 0 ? (lastCount - mean) / stdDev : 0;

    // Threshold: Z > 3 is a clear outlier (> 99th percentile)
    if (z > 3 && lastCount > 5) { // Minimum 5 to ignore tiny fluctuations
      return {
        type: 'frequency',
        severity: z > 5 ? 'high' : 'medium',
        message: `Unusual activity burst detected (Z-score: ${z.toFixed(2)})`,
        details: {
          recentCount: lastCount,
          averageCount: Math.round(mean),
          zScore: z.toFixed(2)
        }
      };
    }

    return null;
  }

  /**
   * Detect success rate anomalies using binomial confidence intervals
   */
  static detectSuccessRateAnomaly(submissions) {
    // We need at least 5 submissions to perform even basic statistics
    if (submissions.length < 5) return null;

    const total = submissions.length;
    const acceptedCount = submissions.filter(s => s.status === 'accepted').length;
    const successRate = acceptedCount / total;

    // Split into historical vs window
    const windowSize = Math.min(10, Math.floor(total / 2));
    const recent = submissions.slice(-windowSize);
    const historical = submissions.slice(0, total - windowSize);

    if (historical.length < 5) return null;

    const histRate = historical.filter(s => s.status === 'accepted').length / historical.length;
    const recentRate = recent.filter(s => s.status === 'accepted').length / recent.length;

    // Using Standard Error for Proportion: SE = sqrt( p*(1-p) / n )
    const seHist = Math.sqrt((histRate * (1 - histRate)) / historical.length);
    const seRecent = Math.sqrt((recentRate * (1 - recentRate)) / recent.length);

    // Combined Standard Error
    const seDiff = Math.sqrt(Math.pow(seHist, 2) + Math.pow(seRecent, 2));

    // Z-score for the difference
    const z = seDiff > 0 ? (histRate - recentRate) / seDiff : 0;

    // If Z > 1.96, we are 95% confident the drop is statistically significant
    if (z > 1.645) { // 90% confidence used for proactive intervention
      return {
        type: 'success_rate_drop',
        severity: z > 2.57 ? 'high' : 'medium', // 99% vs 95%
        message: `Statistically significant performance drop detected (Z-score: ${z.toFixed(2)})`,
        details: {
          previousRate: (histRate * 100).toFixed(1),
          currentRate: (recentRate * 100).toFixed(1),
          confidenceInterval: '90%+',
          zScore: z.toFixed(2)
        }
      };
    }

    // Suspiciously high improvement (e.g. possible cheating or sudden mastery)
    if (z < -2.326) { // 99% confidence for spike
      return {
        type: 'success_rate_spike',
        severity: 'medium',
        message: 'Unusual success rate improvement detected',
        details: {
          improvement: (Math.abs(z)).toFixed(2),
          currentRate: (recentRate * 100).toFixed(1)
        }
      };
    }

    return null;
  }

  /**
   * Detect time pattern anomalies
   */
  static detectTimePatternAnomaly(submissions) {
    if (submissions.length < 10) return null;

    // Check for submissions at unusual hours (2 AM - 5 AM)
    const unusualHourSubmissions = submissions.filter(sub => {
      const hour = new Date(sub.createdAt).getHours();
      return hour >= 2 && hour <= 5;
    });

    const unusualHourPercentage = unusualHourSubmissions.length / submissions.length;

    if (unusualHourPercentage > 0.3) {
      return {
        type: 'unusual_hours',
        severity: 'medium',
        message: 'High percentage of submissions during unusual hours',
        details: {
          unusualHourSubmissions: unusualHourSubmissions.length,
          totalSubmissions: submissions.length,
          percentage: Math.round(unusualHourPercentage * 100)
        }
      };
    }

    return null;
  }

  /**
   * Detect difficulty anomalies
   */
  static detectDifficultyAnomaly(submissions) {
    if (submissions.length < 15) return null;

    const difficultyScores = { easy: 1, medium: 2, hard: 3 };

    // Calculate average difficulty for first and second half
    const midpoint = Math.floor(submissions.length / 2);
    const firstHalf = submissions.slice(0, midpoint);
    const secondHalf = submissions.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, s) => sum + (difficultyScores[s.difficulty] || 1), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + (difficultyScores[s.difficulty] || 1), 0) / secondHalf.length;

    // Check for sudden difficulty spike
    const spike = secondAvg - firstAvg;
    if (spike > 1) {
      return {
        type: 'difficulty_spike',
        severity: 'low',
        message: 'Sudden increase in problem difficulty',
        details: {
          previousAvg: firstAvg.toFixed(2),
          currentAvg: secondAvg.toFixed(2),
          spike: spike.toFixed(2)
        }
      };
    }

    return null;
  }

  /**
   * Calculate overall risk level
   */
  static calculateRiskLevel(anomalies) {
    if (anomalies.length === 0) return 'low';

    const severityScores = { high: 3, medium: 2, low: 1 };
    const totalScore = anomalies.reduce((sum, a) => sum + severityScores[a.severity], 0);

    if (totalScore >= 6) return 'critical';
    if (totalScore >= 4) return 'high';
    if (totalScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Detect exam anomalies
   */
  static async detectExamAnomalies(examId) {
    try {
      const exam = await Exam.findById(examId).lean();
      if (!exam) {
        return { success: false, error: 'Exam not found' };
      }

      const anomalies = [];

      // Check for unusual score distribution
      const scores = exam.participants?.map(p => p.score || 0) || [];
      if (scores.length > 10) {
        const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
        const stdDev = Math.sqrt(
          scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
        );

        // Check for bimodal distribution (possible cheating)
        const highScores = scores.filter(s => s > 80).length;
        const lowScores = scores.filter(s => s < 40).length;
        const midScores = scores.filter(s => s >= 40 && s <= 80).length;

        if (highScores > midScores && lowScores > midScores) {
          anomalies.push({
            type: 'bimodal_distribution',
            severity: 'high',
            message: 'Unusual score distribution detected (possible cheating)',
            details: {
              highScores,
              midScores,
              lowScores
            }
          });
        }

        // Check for suspiciously similar scores
        const scoreCounts = {};
        scores.forEach(score => {
          scoreCounts[score] = (scoreCounts[score] || 0) + 1;
        });

        const duplicateScores = Object.entries(scoreCounts).filter(
          ([score, count]) => count > scores.length * 0.2
        );

        if (duplicateScores.length > 0) {
          anomalies.push({
            type: 'duplicate_scores',
            severity: 'medium',
            message: 'Multiple students with identical scores',
            details: {
              duplicateScores: duplicateScores.map(([score, count]) => ({ score, count }))
            }
          });
        }
      }

      return {
        success: true,
        examId,
        anomaliesDetected: anomalies.length,
        anomalies,
        riskLevel: this.calculateRiskLevel(anomalies)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Detect system-wide anomalies
   */
  static async detectSystemAnomalies() {
    try {
      const anomalies = [];

      // Check submission rate
      const recentSubmissions = await Submission.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 3600000) } // Last hour
      });

      const historicalAvg = await this.getHistoricalSubmissionRate();

      if (recentSubmissions > historicalAvg * 3) {
        anomalies.push({
          type: 'high_submission_rate',
          severity: 'medium',
          message: 'Unusually high submission rate',
          details: {
            current: recentSubmissions,
            average: Math.round(historicalAvg),
            threshold: Math.round(historicalAvg * 3)
          }
        });
      }

      // Check for inactive users
      const inactiveUsers = await User.countDocuments({
        lastActive: { $lt: new Date(Date.now() - 30 * 24 * 3600000) }, // 30 days
        role: 'student'
      });

      const totalStudents = await User.countDocuments({ role: 'student' });
      const inactivePercentage = inactiveUsers / totalStudents;

      if (inactivePercentage > 0.3) {
        anomalies.push({
          type: 'high_inactivity',
          severity: 'low',
          message: 'High percentage of inactive students',
          details: {
            inactiveUsers,
            totalStudents,
            percentage: Math.round(inactivePercentage * 100)
          }
        });
      }

      return {
        success: true,
        timestamp: new Date(),
        anomaliesDetected: anomalies.length,
        anomalies,
        systemHealth: anomalies.length === 0 ? 'healthy' : 'needs_attention'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get historical submission rate
   */
  static async getHistoricalSubmissionRate() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600000);
    const totalSubmissions = await Submission.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Average per hour over 30 days
    return totalSubmissions / (30 * 24);
  }

  /**
   * Monitor real-time anomalies
   */
  static async monitorRealTime() {
    const results = {
      timestamp: new Date(),
      checks: []
    };

    // Check last 5 minutes of activity
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);

    const recentSubmissions = await Submission.countDocuments({
      createdAt: { $gte: fiveMinutesAgo }
    });

    results.checks.push({
      type: 'submission_rate',
      value: recentSubmissions,
      status: recentSubmissions > 100 ? 'warning' : 'normal'
    });

    return results;
  }
}

module.exports = AnomalyDetection;
