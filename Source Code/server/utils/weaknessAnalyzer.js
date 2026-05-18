const WeaknessAnalysis = require('../models/analytics/WeaknessAnalysis');
const StudentWeakness = require('../models/analytics/StudentWeakness');

class WeaknessAnalyzer {
  /**
   * Analyze student performance and identify weak topics
   */
  static async analyzeStudent(studentId, courseId, performanceData) {
    try {
      // Get existing weaknesses
      const existingWeaknesses = await StudentWeakness.find({ 
        student: studentId,
        course: courseId 
      });
      
      // Analyze performance data
      const weakTopics = this.identifyWeakTopics(performanceData, existingWeaknesses);
      
      // Calculate overall metrics
      const overallWeaknessScore = this.calculateOverallWeakness(weakTopics);
      const performanceSummary = this.calculatePerformanceSummary(performanceData);
      
      // Determine if intervention is needed
      const interventionRequired = this.needsIntervention(weakTopics, overallWeaknessScore);
      const interventionType = this.determineInterventionType(overallWeaknessScore, weakTopics);
      
      // Generate AI recommendations
      const aiRecommendations = await this.generateAIRecommendations(
        weakTopics,
        performanceSummary,
        studentId
      );
      
      // Create or update weakness analysis
      const analysis = await WeaknessAnalysis.findOneAndUpdate(
        { student: studentId, course: courseId, isActive: true },
        {
          student: studentId,
          course: courseId,
          analysisDate: new Date(),
          periodStart: performanceData.periodStart,
          periodEnd: performanceData.periodEnd,
          weakTopics,
          overallWeaknessScore,
          totalTopicsAnalyzed: performanceData.topics.length,
          weakTopicsCount: weakTopics.length,
          criticalTopicsCount: weakTopics.filter(t => t.severity === 'Critical').length,
          performanceSummary,
          interventionRequired,
          interventionType,
          aiRecommendations,
          nextAnalysisDate: this.calculateNextAnalysisDate(overallWeaknessScore)
        },
        { upsert: true, new: true }
      );
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing student weakness:', error);
      throw error;
    }
  }
  
  /**
   * Identify weak topics from performance data
   */
  static identifyWeakTopics(performanceData, existingWeaknesses) {
    const weakTopics = [];
    const threshold = 60; // Weakness threshold percentage
    
    performanceData.topics.forEach(topic => {
      const correctRate = (topic.correct / topic.attempted) * 100;
      
      if (correctRate < threshold) {
        const weaknessScore = 100 - correctRate;
        const severity = this.calculateSeverity(weaknessScore, topic.attempted);
        
        // Find existing weakness for trend analysis
        const existing = existingWeaknesses.find(w => w.topic === topic.name);
        const trend = this.calculateTrend(existing, correctRate);
        
        weakTopics.push({
          topic: topic.name,
          category: topic.category,
          weaknessScore,
          severity,
          questionsAttempted: topic.attempted,
          questionsCorrect: topic.correct,
          questionsIncorrect: topic.incorrect,
          averageScore: correctRate,
          commonMistakes: topic.mistakes || [],
          errorPatterns: this.identifyErrorPatterns(topic.errors || []),
          bloomsLevelWeakness: topic.bloomsAnalysis || [],
          averageTimeSpent: topic.averageTime,
          timeoutRate: topic.timeouts ? (topic.timeouts / topic.attempted) * 100 : 0,
          initialScore: existing ? existing.initialScore : correctRate,
          currentScore: correctRate,
          improvement: existing ? correctRate - existing.currentScore : 0,
          trend,
          recommendations: this.generateRecommendations(topic, weaknessScore),
          suggestedResources: this.suggestResources(topic.name, severity),
          practicePlan: this.createPracticePlan(weaknessScore, severity),
          status: 'Identified',
          practiceCount: existing ? existing.practiceCount : 0
        });
      }
    });
    
    return weakTopics.sort((a, b) => b.weaknessScore - a.weaknessScore);
  }
  
  /**
   * Calculate severity based on weakness score and attempts
   */
  static calculateSeverity(weaknessScore, attempts) {
    if (weaknessScore >= 70 || (weaknessScore >= 50 && attempts >= 10)) {
      return 'Critical';
    } else if (weaknessScore >= 50 || (weaknessScore >= 30 && attempts >= 10)) {
      return 'High';
    } else if (weaknessScore >= 30) {
      return 'Medium';
    }
    return 'Low';
  }
  
  /**
   * Calculate trend (Improving, Stable, Declining)
   */
  static calculateTrend(existing, currentScore) {
    if (!existing) return 'Stable';
    
    const improvement = currentScore - existing.currentScore;
    
    if (improvement > 10) return 'Improving';
    if (improvement < -10) return 'Declining';
    return 'Stable';
  }
  
  /**
   * Identify error patterns
   */
  static identifyErrorPatterns(errors) {
    const patterns = [];
    const errorTypes = {};
    
    errors.forEach(error => {
      const type = error.type || 'Unknown';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
    });
    
    // Find common patterns
    Object.keys(errorTypes).forEach(type => {
      if (errorTypes[type] >= 3) {
        patterns.push(`Frequent ${type} errors (${errorTypes[type]} occurrences)`);
      }
    });
    
    return patterns;
  }
  
  /**
   * Generate recommendations for a weak topic
   */
  static generateRecommendations(topic, weaknessScore) {
    const recommendations = [];
    
    if (weaknessScore >= 70) {
      recommendations.push('Start with basic concepts and fundamentals');
      recommendations.push('Watch tutorial videos before attempting problems');
      recommendations.push('Practice easy problems first (at least 10)');
    } else if (weaknessScore >= 50) {
      recommendations.push('Review theory and examples');
      recommendations.push('Practice medium difficulty problems');
      recommendations.push('Focus on understanding common patterns');
    } else {
      recommendations.push('Practice more problems of varying difficulty');
      recommendations.push('Analyze mistakes and learn from them');
      recommendations.push('Try to solve problems without hints');
    }
    
    if (topic.timeoutRate > 30) {
      recommendations.push('Work on time management and problem-solving speed');
    }
    
    if (topic.commonMistakes && topic.commonMistakes.length > 0) {
      recommendations.push('Pay special attention to: ' + topic.commonMistakes.slice(0, 2).join(', '));
    }
    
    return recommendations;
  }
  
  /**
   * Suggest learning resources
   */
  static suggestResources(topicName, severity) {
    const resources = [];
    
    // Add video resources
    resources.push({
      type: 'Video',
      title: `${topicName} - Complete Tutorial`,
      url: `#/learning-paths?topic=${encodeURIComponent(topicName)}`,
      resourceType: 'Video'
    });
    
    // Add practice resources
    resources.push({
      type: 'Practice',
      title: `${topicName} - Practice Problems`,
      url: `#/problems?topic=${encodeURIComponent(topicName)}`,
      resourceType: 'Practice'
    });
    
    // Add article resources
    resources.push({
      type: 'Article',
      title: `${topicName} - Detailed Guide`,
      url: `#/resources?topic=${encodeURIComponent(topicName)}`,
      resourceType: 'Article'
    });
    
    return resources;
  }
  
  /**
   * Create practice plan based on weakness
   */
  static createPracticePlan(weaknessScore, severity) {
    let plan = {
      easyProblems: 0,
      mediumProblems: 0,
      hardProblems: 0,
      estimatedHours: 0
    };
    
    if (severity === 'Critical') {
      plan = {
        easyProblems: 15,
        mediumProblems: 5,
        hardProblems: 0,
        estimatedHours: 10
      };
    } else if (severity === 'High') {
      plan = {
        easyProblems: 10,
        mediumProblems: 10,
        hardProblems: 3,
        estimatedHours: 8
      };
    } else if (severity === 'Medium') {
      plan = {
        easyProblems: 5,
        mediumProblems: 10,
        hardProblems: 5,
        estimatedHours: 6
      };
    } else {
      plan = {
        easyProblems: 3,
        mediumProblems: 7,
        hardProblems: 5,
        estimatedHours: 4
      };
    }
    
    return plan;
  }
  
  /**
   * Calculate overall weakness score
   */
  static calculateOverallWeakness(weakTopics) {
    if (weakTopics.length === 0) return 0;
    
    const totalScore = weakTopics.reduce((sum, topic) => sum + topic.weaknessScore, 0);
    return totalScore / weakTopics.length;
  }
  
  /**
   * Calculate performance summary
   */
  static calculatePerformanceSummary(performanceData) {
    const total = performanceData.topics.reduce((sum, t) => sum + t.attempted, 0);
    const correct = performanceData.topics.reduce((sum, t) => sum + t.correct, 0);
    const incorrect = performanceData.topics.reduce((sum, t) => sum + t.incorrect, 0);
    const skipped = performanceData.topics.reduce((sum, t) => sum + (t.skipped || 0), 0);
    
    return {
      totalQuestions: total,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      skippedQuestions: skipped,
      averageScore: total > 0 ? (correct / total) * 100 : 0,
      averageTime: performanceData.averageTime || 0
    };
  }
  
  /**
   * Determine if intervention is needed
   */
  static needsIntervention(weakTopics, overallWeaknessScore) {
    const criticalCount = weakTopics.filter(t => t.severity === 'Critical').length;
    const highCount = weakTopics.filter(t => t.severity === 'High').length;
    
    return criticalCount >= 2 || highCount >= 4 || overallWeaknessScore > 60;
  }
  
  /**
   * Determine intervention type
   */
  static determineInterventionType(overallWeaknessScore, weakTopics) {
    const criticalCount = weakTopics.filter(t => t.severity === 'Critical').length;
    
    if (criticalCount >= 3 || overallWeaknessScore > 70) {
      return 'Intensive Support';
    } else if (criticalCount >= 2 || overallWeaknessScore > 60) {
      return 'Faculty Guidance';
    } else if (overallWeaknessScore > 50) {
      return 'Peer Tutoring';
    } else if (overallWeaknessScore > 40) {
      return 'Self-Study';
    }
    return 'None';
  }
  
  /**
   * Generate AI recommendations
   */
  static async generateAIRecommendations(weakTopics, performanceSummary, studentId) {
    const focusAreas = weakTopics
      .filter(t => t.severity === 'Critical' || t.severity === 'High')
      .map(t => t.topic)
      .slice(0, 5);
    
    const totalHours = weakTopics.reduce((sum, t) => sum + t.practicePlan.estimatedHours, 0);
    
    return {
      studyPlan: this.generateStudyPlanText(weakTopics),
      focusAreas,
      practiceStrategy: this.generatePracticeStrategy(weakTopics, performanceSummary),
      estimatedTimeToImprove: Math.ceil(totalHours * 0.7), // 70% of total estimated time
      confidenceLevel: this.calculateConfidenceLevel(weakTopics, performanceSummary)
    };
  }
  
  /**
   * Generate study plan text
   */
  static generateStudyPlanText(weakTopics) {
    const critical = weakTopics.filter(t => t.severity === 'Critical');
    const high = weakTopics.filter(t => t.severity === 'High');
    
    let plan = 'Recommended Study Plan:\n\n';
    
    if (critical.length > 0) {
      plan += `Week 1-2: Focus on critical topics (${critical.map(t => t.topic).join(', ')})\n`;
      plan += '- Start with fundamentals and basic concepts\n';
      plan += '- Practice easy problems daily\n';
      plan += '- Watch tutorial videos\n\n';
    }
    
    if (high.length > 0) {
      plan += `Week 3-4: Address high-priority topics (${high.map(t => t.topic).join(', ')})\n`;
      plan += '- Review theory and examples\n';
      plan += '- Practice medium difficulty problems\n';
      plan += '- Analyze common patterns\n\n';
    }
    
    plan += 'Ongoing: Regular practice and revision of all weak topics';
    
    return plan;
  }
  
  /**
   * Generate practice strategy
   */
  static generatePracticeStrategy(weakTopics, performanceSummary) {
    const avgScore = performanceSummary.averageScore;
    
    if (avgScore < 40) {
      return 'Focus on fundamentals. Start with easy problems and gradually increase difficulty. Aim for 80%+ accuracy before moving to harder problems.';
    } else if (avgScore < 60) {
      return 'Mix of easy and medium problems. Focus on understanding concepts deeply. Practice 5-7 problems daily across weak topics.';
    } else {
      return 'Focus on medium and hard problems. Work on speed and accuracy. Try to solve problems without hints.';
    }
  }
  
  /**
   * Calculate confidence level for improvement
   */
  static calculateConfidenceLevel(weakTopics, performanceSummary) {
    let confidence = 70; // Base confidence
    
    // Adjust based on number of weak topics
    if (weakTopics.length > 10) confidence -= 20;
    else if (weakTopics.length > 5) confidence -= 10;
    
    // Adjust based on severity
    const criticalCount = weakTopics.filter(t => t.severity === 'Critical').length;
    confidence -= criticalCount * 5;
    
    // Adjust based on current performance
    if (performanceSummary.averageScore > 50) confidence += 10;
    if (performanceSummary.averageScore < 30) confidence -= 15;
    
    // Adjust based on trends
    const improvingCount = weakTopics.filter(t => t.trend === 'Improving').length;
    const decliningCount = weakTopics.filter(t => t.trend === 'Declining').length;
    confidence += improvingCount * 3;
    confidence -= decliningCount * 5;
    
    return Math.max(20, Math.min(95, confidence));
  }
  
  /**
   * Calculate next analysis date
   */
  static calculateNextAnalysisDate(overallWeaknessScore) {
    const daysToAdd = overallWeaknessScore > 60 ? 7 : 14; // Weekly for high weakness, bi-weekly otherwise
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    return nextDate;
  }
  
  /**
   * Track improvement over time
   */
  static async trackImprovement(studentId, courseId) {
    const analyses = await WeaknessAnalysis.find({
      student: studentId,
      course: courseId,
      isActive: true
    }).sort({ analysisDate: 1 }).limit(10);
    
    if (analyses.length < 2) {
      return { hasImprovement: false, message: 'Not enough data for trend analysis' };
    }
    
    const first = analyses[0];
    const latest = analyses[analyses.length - 1];
    
    const improvement = first.overallWeaknessScore - latest.overallWeaknessScore;
    const improvementPercentage = (improvement / first.overallWeaknessScore) * 100;
    
    return {
      hasImprovement: improvement > 0,
      improvement,
      improvementPercentage,
      initialScore: first.overallWeaknessScore,
      currentScore: latest.overallWeaknessScore,
      topicsImproved: this.getImprovedTopics(first, latest),
      topicsDeclined: this.getDeclinedTopics(first, latest)
    };
  }
  
  /**
   * Get improved topics
   */
  static getImprovedTopics(firstAnalysis, latestAnalysis) {
    const improved = [];
    
    firstAnalysis.weakTopics.forEach(firstTopic => {
      const latestTopic = latestAnalysis.weakTopics.find(t => t.topic === firstTopic.topic);
      
      if (latestTopic && latestTopic.weaknessScore < firstTopic.weaknessScore) {
        improved.push({
          topic: firstTopic.topic,
          improvement: firstTopic.weaknessScore - latestTopic.weaknessScore
        });
      } else if (!latestTopic) {
        // Topic no longer weak
        improved.push({
          topic: firstTopic.topic,
          improvement: firstTopic.weaknessScore,
          resolved: true
        });
      }
    });
    
    return improved.sort((a, b) => b.improvement - a.improvement);
  }
  
  /**
   * Get declined topics
   */
  static getDeclinedTopics(firstAnalysis, latestAnalysis) {
    const declined = [];
    
    firstAnalysis.weakTopics.forEach(firstTopic => {
      const latestTopic = latestAnalysis.weakTopics.find(t => t.topic === firstTopic.topic);
      
      if (latestTopic && latestTopic.weaknessScore > firstTopic.weaknessScore) {
        declined.push({
          topic: firstTopic.topic,
          decline: latestTopic.weaknessScore - firstTopic.weaknessScore
        });
      }
    });
    
    // Check for new weak topics
    latestAnalysis.weakTopics.forEach(latestTopic => {
      const firstTopic = firstAnalysis.weakTopics.find(t => t.topic === latestTopic.topic);
      
      if (!firstTopic) {
        declined.push({
          topic: latestTopic.topic,
          decline: latestTopic.weaknessScore,
          isNew: true
        });
      }
    });
    
    return declined.sort((a, b) => b.decline - a.decline);
  }
}

module.exports = WeaknessAnalyzer;
