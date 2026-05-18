/**
 * Predictive Analytics Service
 * Provides machine learning models for predicting student performance, dropout risk, etc.
 */

const mongoose = require('mongoose');

class PredictiveAnalyticsService {
  constructor() {
    this.models = {};
    this.initialized = false;
  }

  /**
   * Initialize predictive models
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // In a real implementation, this would load trained ML models
      // For now, we'll use rule-based predictions
      console.log('Predictive analytics service initialized');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize predictive analytics:', error);
      throw error;
    }
  }

  /**
   * Predict student dropout risk
   * @param {Object} studentData - Student data including academic performance
   * @returns {Object} Risk assessment with score and factors
   */
  async predictDropoutRisk(studentData) {
    await this.initialize();

    const {
      gpa,
      attendanceRate,
      assignmentCompletionRate,
      lastLoginDays,
      courseLoad,
      financialAid,
      demographicFactors = {}
    } = studentData;

    // Calculate risk score (0-100)
    let riskScore = 50; // Base score

    // Academic factors
    if (gpa < 2.0) riskScore += 20;
    else if (gpa < 2.5) riskScore += 10;
    else if (gpa > 3.5) riskScore -= 15;

    if (attendanceRate < 70) riskScore += 15;
    else if (attendanceRate < 80) riskScore += 5;
    else if (attendanceRate > 90) riskScore -= 10;

    if (assignmentCompletionRate < 70) riskScore += 15;
    else if (assignmentCompletionRate < 85) riskScore += 5;
    else if (assignmentCompletionRate > 95) riskScore -= 10;

    // Engagement factors
    if (lastLoginDays > 14) riskScore += 20;
    else if (lastLoginDays > 7) riskScore += 10;
    else if (lastLoginDays <= 2) riskScore -= 5;

    // Course load factor
    if (courseLoad > 18) riskScore += 10;
    else if (courseLoad < 12) riskScore += 5;

    // Financial factors
    if (!financialAid) riskScore += 5;

    // Demographic factors (simplified)
    if (demographicFactors.firstGeneration) riskScore += 5;
    if (demographicFactors.international) riskScore += 3;

    // Clamp score between 0-100
    riskScore = Math.max(0, Math.min(100, riskScore));

    // Determine risk level
    let riskLevel = 'Low';
    if (riskScore >= 70) riskLevel = 'High';
    else if (riskScore >= 40) riskLevel = 'Medium';

    // Identify key risk factors
    const riskFactors = [];
    if (gpa < 2.0) riskFactors.push('Low GPA');
    if (attendanceRate < 70) riskFactors.push('Poor Attendance');
    if (assignmentCompletionRate < 70) riskFactors.push('Low Assignment Completion');
    if (lastLoginDays > 14) riskFactors.push('Low Platform Engagement');
    if (courseLoad > 18) riskFactors.push('High Course Load');
    if (!financialAid) riskFactors.push('No Financial Aid');

    // Generate recommendations
    const recommendations = this.generateRecommendations(riskLevel, riskFactors);

    return {
      riskScore: Math.round(riskScore),
      riskLevel,
      riskFactors,
      recommendations,
      confidence: 0.85, // Simulated confidence score
      lastUpdated: new Date()
    };
  }

  /**
   * Generate personalized recommendations based on risk factors
   */
  generateRecommendations(riskLevel, riskFactors) {
    const recommendations = [];

    if (riskLevel === 'High') {
      recommendations.push('Schedule immediate academic advising session');
      recommendations.push('Consider reducing course load next semester');
      recommendations.push('Connect with student support services');
    }

    if (riskLevel === 'Medium') {
      recommendations.push('Meet with academic advisor within 2 weeks');
      recommendations.push('Utilize tutoring services for struggling courses');
      recommendations.push('Set up study schedule and track progress');
    }

    if (riskFactors.includes('Low GPA')) {
      recommendations.push('Focus on foundational courses');
      recommendations.push('Consider academic probation support program');
      recommendations.push('Utilize writing center and math lab resources');
    }

    if (riskFactors.includes('Poor Attendance')) {
      recommendations.push('Set attendance goals with faculty');
      recommendations.push('Use calendar reminders for classes');
      recommendations.push('Consider time management workshop');
    }

    if (riskFactors.includes('Low Platform Engagement')) {
      recommendations.push('Enable platform notifications');
      recommendations.push('Set daily check-in routine');
      recommendations.push('Participate in online discussions');
    }

    if (riskFactors.includes('High Course Load')) {
      recommendations.push('Consult with advisor about course load');
      recommendations.push('Prioritize core requirements');
      recommendations.push('Consider summer/winter courses for balance');
    }

    return recommendations;
  }

  /**
   * Predict course performance
   * @param {Object} studentData - Student data and course history
   * @param {Object} courseData - Course information and difficulty
   * @returns {Object} Performance prediction
   */
  async predictCoursePerformance(studentData, courseData) {
    await this.initialize();

    const {
      pastPerformance = [],
      studyHoursPerWeek,
      prerequisiteKnowledge,
      learningStyle
    } = studentData;

    const {
      courseDifficulty,
      prerequisiteCourses = [],
      averageGrade,
      passRate
    } = courseData;

    // Calculate predicted grade (0-100)
    let predictedGrade = 75; // Base grade

    // Adjust based on past performance in similar courses
    const similarCourses = pastPerformance.filter(course => 
      course.subject === courseData.subject
    );

    if (similarCourses.length > 0) {
      const avgSimilarGrade = similarCourses.reduce((sum, course) => sum + course.grade, 0) / similarCourses.length;
      predictedGrade = (predictedGrade * 0.3) + (avgSimilarGrade * 0.7);
    }

    // Adjust for course difficulty
    if (courseDifficulty === 'Advanced') predictedGrade -= 10;
    else if (courseDifficulty === 'Intermediate') predictedGrade -= 5;
    else if (courseDifficulty === 'Introductory') predictedGrade += 5;

    // Adjust for study hours
    if (studyHoursPerWeek >= 10) predictedGrade += 5;
    else if (studyHoursPerWeek < 5) predictedGrade -= 10;

    // Adjust for prerequisite knowledge
    if (prerequisiteKnowledge === 'Strong') predictedGrade += 8;
    else if (prerequisiteKnowledge === 'Weak') predictedGrade -= 8;

    // Clamp grade between 0-100
    predictedGrade = Math.max(0, Math.min(100, predictedGrade));

    // Determine letter grade
    const letterGrade = this.calculateLetterGrade(predictedGrade);

    // Calculate success probability
    let successProbability = 0.7; // Base probability
    
    if (predictedGrade >= 80) successProbability = 0.9;
    else if (predictedGrade >= 70) successProbability = 0.8;
    else if (predictedGrade >= 60) successProbability = 0.6;
    else if (predictedGrade >= 50) successProbability = 0.4;
    else successProbability = 0.2;

    // Adjust based on course pass rate
    if (passRate) {
      successProbability = (successProbability * 0.6) + (passRate * 0.4);
    }

    return {
      predictedGrade: Math.round(predictedGrade),
      letterGrade,
      successProbability: Math.round(successProbability * 100),
      confidence: 0.78,
      keyFactors: this.identifyPerformanceFactors(studentData, courseData),
      recommendations: this.generatePerformanceRecommendations(predictedGrade, studentData)
    };
  }

  /**
   * Calculate letter grade from numeric grade
   */
  calculateLetterGrade(grade) {
    if (grade >= 90) return 'A';
    if (grade >= 80) return 'B';
    if (grade >= 70) return 'C';
    if (grade >= 60) return 'D';
    return 'F';
  }

  /**
   * Identify key factors affecting performance
   */
  identifyPerformanceFactors(studentData, courseData) {
    const factors = [];

    if (studentData.studyHoursPerWeek < 5) {
      factors.push('Insufficient study time');
    }

    if (courseData.courseDifficulty === 'Advanced' && studentData.pastPerformance.length < 3) {
      factors.push('Limited experience with advanced courses');
    }

    if (studentData.prerequisiteKnowledge === 'Weak') {
      factors.push('Weak prerequisite knowledge');
    }

    if (courseData.averageGrade && courseData.averageGrade < 70) {
      factors.push('Historically challenging course');
    }

    return factors;
  }

  /**
   * Generate performance improvement recommendations
   */
  generatePerformanceRecommendations(predictedGrade, studentData) {
    const recommendations = [];

    if (predictedGrade < 70) {
      recommendations.push('Enroll in tutoring sessions for this course');
      recommendations.push('Form study group with classmates');
      recommendations.push('Meet with professor during office hours');
    }

    if (studentData.studyHoursPerWeek < 5) {
      recommendations.push('Increase study time to at least 8 hours per week');
      recommendations.push('Create structured study schedule');
    }

    if (predictedGrade < 60) {
      recommendations.push('Consider dropping course if before deadline');
      recommendations.push('Explore alternative course options');
      recommendations.push('Request academic support services');
    }

    return recommendations;
  }

  /**
   * Analyze learning patterns
   * @param {Array} activityData - Student learning activity data
   * @returns {Object} Learning pattern analysis
   */
  async analyzeLearningPatterns(activityData) {
    await this.initialize();

    if (!activityData || activityData.length === 0) {
      return {
        learningStyle: 'Unknown',
        engagementLevel: 'Low',
        studyPattern: 'Irregular',
        peakHours: [],
        recommendations: ['Insufficient data for analysis']
      };
    }

    // Analyze study times
    const studyHours = activityData.map(a => new Date(a.timestamp).getHours());
    const hourCounts = Array(24).fill(0);
    studyHours.forEach(hour => hourCounts[hour]++);
    
    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour)
      .sort((a, b) => a - b);

    // Determine learning style based on activity types
    const activityTypes = activityData.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {});

    let learningStyle = 'Balanced';
    if (activityTypes.video && activityTypes.video > activityTypes.reading * 2) {
      learningStyle = 'Visual';
    } else if (activityTypes.reading && activityTypes.reading > activityTypes.video * 2) {
      learningStyle = 'Reading/Writing';
    } else if (activityTypes.practice && activityTypes.practice > (activityTypes.video + activityTypes.reading)) {
      learningStyle = 'Kinesthetic';
    }

    // Calculate engagement level
    const totalActivities = activityData.length;
    const days = [...new Set(activityData.map(a => new Date(a.timestamp).toDateString()))].length;
    const avgDailyActivities = totalActivities / Math.max(days, 1);

    let engagementLevel = 'Low';
    if (avgDailyActivities >= 10) engagementLevel = 'High';
    else if (avgDailyActivities >= 5) engagementLevel = 'Medium';

    // Determine study pattern
    const activitiesByDay = activityData.reduce((acc, activity) => {
      const day = new Date(activity.timestamp).getDay();
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, Array(7).fill(0));

    const variance = this.calculateVariance(activitiesByDay);
    let studyPattern = 'Regular';
    if (variance > 0.5) studyPattern = 'Irregular';
    else if (variance > 0.3) studyPattern = 'Moderately Regular';

    // Generate recommendations
    const recommendations = this.generateLearningRecommendations(
      learningStyle,
      engagementLevel,
      studyPattern,
      peakHours
    );

    return {
      learningStyle,
      engagementLevel,
      studyPattern,
      peakHours,
      totalActivities,
      daysActive: days,
      avgDailyActivities: Math.round(avgDailyActivities * 10) / 10,
      recommendations,
      analysisDate: new Date()
    };
  }

  /**
   * Calculate variance of an array
   */
  calculateVariance(array) {
    const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
    const squaredDiffs = array.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / array.length;
    return variance / (mean || 1); // Normalize
  }

  /**
   * Generate learning recommendations
   */
  generateLearningRecommendations(learningStyle, engagementLevel, studyPattern, peakHours) {
    const recommendations = [];

    if (engagementLevel === 'Low') {
      recommendations.push('Increase platform engagement to at least 5 activities daily');
      recommendations.push('Set daily learning goals');
      recommendations.push('Enable notifications for course updates');
    }

    if (studyPattern === 'Irregular') {
      recommendations.push('Establish consistent study schedule');
      recommendations.push('Use calendar reminders for study sessions');
      recommendations.push('Aim for at least 30 minutes of study daily');
    }

    if (learningStyle === 'Visual') {
      recommendations.push('Focus on video lectures and diagrams');
      recommendations.push('Use mind mapping tools for note-taking');
      recommendations.push('Create visual summaries of key concepts');
    } else if (learningStyle === 'Reading/Writing') {
      recommendations.push('Take detailed written notes');
      recommendations.push('Rewrite concepts in your own words');
      recommendations.push('Create flashcards for key terms');
    } else if (learningStyle === 'Kinesthetic') {
      recommendations.push('Engage in hands-on practice problems');
      recommendations.push('Use physical models or simulations when possible');
      recommendations.push('Take frequent short breaks during study sessions');
    }

    if (peakHours.length > 0) {
      const formattedHours = peakHours.map(h => `${h}:00`).join(', ');
      recommendations.push(`Schedule study sessions during peak productivity hours (${formattedHours})`);
    }

    return recommendations;
  }

  /**
   * Batch prediction for multiple students
   */
  async batchPredictDropoutRisk(studentsData) {
    const results = [];
    
    for (const studentData of studentsData) {
      try {
        const prediction = await this.predictDropoutRisk(studentData);
        results.push({
          studentId: studentData.studentId,
          ...prediction
        });
      } catch (error) {
        results.push({
          studentId: studentData.studentId,
          error: error.message,
          riskScore: null,
          riskLevel: 'Unknown'
        });
      }
    }

    return {
      total: results.length,
      highRisk: results.filter(r => r.riskLevel === 'High').length,
      mediumRisk: results.filter(r => r.riskLevel === 'Medium').length,
      lowRisk: results.filter(r => r.riskLevel === 'Low').length,
      results
    };
  }
}

module.exports = new PredictiveAnalyticsService();