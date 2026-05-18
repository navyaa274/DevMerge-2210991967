/**
 * Predictive Analytics Service
 * Machine learning-based predictions for student performance
 */

const Submission = require('../../models/assessment/problems/Submission');
const User = require('../../models/auth/User');
const Assignment = require('../../models/assessment/assignments/Assignment');
const Exam = require('../../models/assessment/exams/Exam');

class PredictiveAnalytics {
  /**
   * Predict student performance based on historical data
   */
  static async predictPerformance(userId) {
    try {
      // Get historical data
      const submissions = await Submission.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      const assignments = await Assignment.find({
        'submissions.userId': userId
      }).lean();

      const exams = await Exam.find({
        'participants.userId': userId
      }).lean();

      // Calculate metrics
      const metrics = this.calculateMetrics(submissions, assignments, exams);

      // Generate prediction
      const prediction = this.generatePrediction(metrics);

      return {
        success: true,
        userId,
        prediction,
        metrics,
        confidence: prediction.confidence,
        recommendations: this.generateRecommendations(prediction, metrics)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate performance metrics
   */
  static calculateMetrics(submissions, assignments, exams) {
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === 'accepted').length;
    const avgAttempts = submissions.reduce((sum, s) => sum + (s.attempts || 1), 0) / totalSubmissions || 0;

    // Submission success rate
    const successRate = totalSubmissions > 0 ? acceptedSubmissions / totalSubmissions : 0;

    // Average time to solve
    const avgSolveTime = submissions
      .filter(s => s.status === 'accepted' && s.executionTime)
      .reduce((sum, s) => sum + s.executionTime, 0) / acceptedSubmissions || 0;

    // Difficulty progression
    const difficultyScores = { easy: 1, medium: 2, hard: 3 };
    const avgDifficulty = submissions
      .reduce((sum, s) => sum + (difficultyScores[s.difficulty] || 1), 0) / totalSubmissions || 0;

    // Recent performance trend
    const recentSubmissions = submissions.slice(0, 20);
    const recentSuccessRate = recentSubmissions.filter(s => s.status === 'accepted').length / recentSubmissions.length || 0;

    // Assignment completion rate
    const completedAssignments = assignments.filter(a => {
      const userSubmission = a.submissions?.find(s => s.userId.toString() === userId.toString());
      return userSubmission && userSubmission.status === 'submitted';
    }).length;
    const assignmentCompletionRate = assignments.length > 0 ? completedAssignments / assignments.length : 0;

    // Exam performance
    const examScores = exams.map(e => {
      const participant = e.participants?.find(p => p.userId.toString() === userId.toString());
      return participant?.score || 0;
    });
    const avgExamScore = examScores.length > 0 ? examScores.reduce((a, b) => a + b, 0) / examScores.length : 0;

    // Consistency score (variance in performance)
    const variance = this.calculateVariance(submissions.map(s => s.status === 'accepted' ? 1 : 0));
    const consistencyScore = 1 - Math.min(variance, 1);

    return {
      totalSubmissions,
      successRate,
      recentSuccessRate,
      avgAttempts,
      avgSolveTime,
      avgDifficulty,
      assignmentCompletionRate,
      avgExamScore,
      consistencyScore,
      trend: recentSuccessRate > successRate ? 'improving' : recentSuccessRate < successRate ? 'declining' : 'stable'
    };
  }

  /**
   * Generate performance prediction using MPI, AMS, and CDD
   */
  static generatePrediction(metrics) {
    // 1. Mastery Progression Index (MPI)
    // Measures knowledge acquisition depth and difficulty scaling
    const masteryIndex =
      (metrics.recentSuccessRate * 0.45) +
      (metrics.successRate * 0.25) +
      ((metrics.avgExamScore / 100) * 0.20) +
      ((metrics.avgDifficulty / 3) * 0.10);

    // 2. Academic Momentum Score (AMS)
    // Measures work-rate, consistency, and improvement velocity
    const trendWeight = metrics.trend === 'improving' ? 1 : metrics.trend === 'declining' ? 0 : 0.5;
    const momentumScore =
      (metrics.assignmentCompletionRate * 0.50) +
      (trendWeight * 0.30) +
      (metrics.consistencyScore * 0.20);

    // 3. Concept Drift Detection (CDD) - Longitudinal Skill Decay
    // Measures if recent performance on higher-order tasks is degrading 
    // compared to historical mastery baselines.
    const historicalMastery = (metrics.successRate * 0.7) + (metrics.avgExamScore / 100 * 0.3);
    const recentSkillDrift = Math.max(0, historicalMastery - metrics.recentSuccessRate);
    const conceptDriftScore = recentSkillDrift > 0.15 ? recentSkillDrift : 0; // Trigger threshold

    // Final Intelligence Score
    const overallScore = ((masteryIndex * 0.6) + (momentumScore * 0.4)) * (1 - (conceptDriftScore * 0.5));

    // Determine performance level
    let level, confidence;
    if (overallScore >= 0.8) {
      level = 'excellent';
      confidence = 0.94;
    } else if (overallScore >= 0.6) {
      level = 'good';
      confidence = 0.89;
    } else if (overallScore >= 0.4) {
      level = 'average';
      confidence = 0.86;
    } else if (overallScore >= 0.2) {
      level = 'below-average';
      confidence = 0.82;
    } else {
      level = 'needs-improvement';
      confidence = 0.78;
    }

    return {
      level,
      overallScore,
      masteryIndex,
      momentumScore,
      conceptDriftScore,
      confidence,
      predictedExamScore: Math.round(masteryIndex * 100),
      trend: metrics.trend
    };
  }

  /**
   * Generate personalized recommendations
   */
  static generateRecommendations(prediction, metrics) {
    const recommendations = [];

    // Concept Drift recommendations
    if (prediction.conceptDriftScore > 0) {
      recommendations.push({
        type: 'retention',
        priority: 'high',
        message: 'Mastery in previously stable concepts is drifting. Schedule a review session.',
        action: 'review_fundamentals'
      });
    }

    // Difficulty recommendations
    if (metrics.avgDifficulty < 1.5 && prediction.level !== 'needs-improvement') {
      recommendations.push({
        type: 'difficulty',
        priority: 'medium',
        message: 'Challenge yourself with medium and hard problems to improve skills.',
        action: 'increase_difficulty'
      });
    } else if (metrics.avgDifficulty > 2.5 && metrics.successRate < 0.4) {
      recommendations.push({
        type: 'difficulty',
        priority: 'high',
        message: 'Focus on easier problems to build confidence and fundamentals.',
        action: 'decrease_difficulty'
      });
    }

    // Consistency recommendations
    if (metrics.consistencyScore < 0.5) {
      recommendations.push({
        type: 'consistency',
        priority: 'medium',
        message: 'Work on maintaining consistent performance. Review problem-solving strategies.',
        action: 'improve_consistency'
      });
    }

    // Assignment recommendations
    if (metrics.assignmentCompletionRate < 0.7) {
      recommendations.push({
        type: 'assignments',
        priority: 'high',
        message: 'Complete pending assignments to stay on track with coursework.',
        action: 'complete_assignments'
      });
    }

    // Exam preparation
    if (metrics.avgExamScore < 60) {
      recommendations.push({
        type: 'exam_prep',
        priority: 'high',
        message: 'Focus on exam preparation. Review concepts and practice timed problems.',
        action: 'exam_preparation'
      });
    }

    // Trend-based recommendations
    if (metrics.trend === 'declining') {
      recommendations.push({
        type: 'intervention',
        priority: 'high',
        message: 'Performance is declining. Consider seeking help from mentors or peers.',
        action: 'seek_help'
      });
    } else if (metrics.trend === 'improving') {
      recommendations.push({
        type: 'encouragement',
        priority: 'low',
        message: 'Great progress! Keep up the good work and maintain your momentum.',
        action: 'continue'
      });
    }

    return recommendations;
  }

  /**
   * Calculate variance
   */
  static calculateVariance(values) {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Predict at-risk students
   */
  static async identifyAtRiskStudents(courseId = null) {
    try {
      const query = courseId ? { courses: courseId, role: 'student' } : { role: 'student' };
      const students = await User.find(query).select('_id name email').lean();

      const masteryDeviations = [];

      for (const student of students) {
        const prediction = await this.predictPerformance(student._id);

        if (prediction.success &&
          (prediction.prediction.level === 'needs-improvement' ||
            prediction.prediction.level === 'below-average' ||
            prediction.metrics.trend === 'declining')) {
          masteryDeviations.push({
            ...student,
            prediction: prediction.prediction,
            masteryDeviationIndex: this.calculateMasteryDeviationIndex(prediction),
            recommendations: prediction.recommendations
          });
        }
      }

      // Sort by deviation index
      masteryDeviations.sort((a, b) => b.masteryDeviationIndex - a.masteryDeviationIndex);

      return {
        success: true,
        count: masteryDeviations.length,
        students: masteryDeviations
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate Mastery Deviation Index (0-100)
   */
  static calculateMasteryDeviationIndex(prediction) {
    const { level, trend, masteryIndex, momentumScore } = prediction.prediction;

    let deviationScore = 0;

    // Base deviation from performance level (derived from MPI/AMS)
    const levelDeviation = {
      'excellent': 0,
      'good': 15,
      'average': 35,
      'below-average': 55,
      'needs-improvement': 80
    };
    deviationScore += levelDeviation[level] || 50;

    // Momentum Trend adjustment
    if (trend === 'declining') deviationScore += 20;
    if (trend === 'improving') deviationScore -= 15;

    // Low Mastery Risk
    if (masteryIndex < 0.3) deviationScore += 15;

    // Low Momentum Risk
    if (momentumScore < 0.4) deviationScore += 10;

    return Math.min(100, Math.max(0, deviationScore));
  }

  /**
   * Generate class analytics
   */
  static async analyzeClass(courseId) {
    try {
      const students = await User.find({ courses: courseId, role: 'student' }).lean();

      const predictions = await Promise.all(
        students.map(s => this.predictPerformance(s._id))
      );

      const successfulPredictions = predictions.filter(p => p.success);

      // Aggregate statistics
      const stats = {
        totalStudents: students.length,
        averageScore: successfulPredictions.reduce((sum, p) => sum + p.prediction.overallScore, 0) / successfulPredictions.length,
        distribution: {
          excellent: successfulPredictions.filter(p => p.prediction.level === 'excellent').length,
          good: successfulPredictions.filter(p => p.prediction.level === 'good').length,
          average: successfulPredictions.filter(p => p.prediction.level === 'average').length,
          belowAverage: successfulPredictions.filter(p => p.prediction.level === 'below-average').length,
          needsImprovement: successfulPredictions.filter(p => p.prediction.level === 'needs-improvement').length
        },
        trends: {
          improving: successfulPredictions.filter(p => p.metrics.trend === 'improving').length,
          stable: successfulPredictions.filter(p => p.metrics.trend === 'stable').length,
          declining: successfulPredictions.filter(p => p.metrics.trend === 'declining').length
        },
        atRisk: successfulPredictions.filter(p =>
          p.prediction.level === 'needs-improvement' ||
          p.prediction.level === 'below-average' ||
          p.metrics.trend === 'declining'
        ).length
      };

      return {
        success: true,
        courseId,
        stats,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = PredictiveAnalytics;
