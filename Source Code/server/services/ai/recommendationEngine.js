/**
 * Recommendation Engine
 * ML-based recommendations for problems, courses, and learning paths
 */

const Problem = require('../../models/assessment/problems/Problem');
const Submission = require('../../models/assessment/problems/Submission');
const Course = require('../../models/academic/Course');
const User = require('../../models/auth/User');

class RecommendationEngine {
  /**
   * Recommend problems based on user history
   */
  static async recommendProblems(userId, limit = 10) {
    try {
      // Get user's submission history
      const submissions = await Submission.find({ userId })
        .populate('problemId')
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

      // Analyze user's skill level
      const userProfile = this.analyzeUserProfile(submissions);

      // Get candidate problems
      const candidates = await this.getCandidateProblems(userId, userProfile);

      // Score and rank problems
      const scored = candidates.map(problem => ({
        problem,
        score: this.scoreProblem(problem, userProfile)
      }));

      // Sort by score and return top N
      scored.sort((a, b) => b.score - a.score);

      return {
        success: true,
        recommendations: scored.slice(0, limit).map(s => ({
          ...s.problem,
          recommendationScore: s.score,
          reason: this.getRecommendationReason(s.problem, userProfile)
        })),
        userProfile
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Analyze user's skill profile
   */
  static analyzeUserProfile(submissions) {
    const profile = {
      totalSubmissions: submissions.length,
      solvedProblems: new Set(),
      attemptedProblems: new Set(),
      categories: {},
      tags: {},
      difficulty: { easy: 0, medium: 0, hard: 0 },
      successRate: 0,
      averageAttempts: 0,
      preferredLanguages: {},
      recentActivity: []
    };

    submissions.forEach(sub => {
      if (!sub.problemId) return;

      const problem = sub.problemId;
      profile.attemptedProblems.add(problem._id.toString());

      if (sub.status === 'accepted') {
        profile.solvedProblems.add(problem._id.toString());
      }

      // Track categories
      if (problem.category) {
        profile.categories[problem.category] = (profile.categories[problem.category] || 0) + 1;
      }

      // Track tags
      if (problem.tags) {
        problem.tags.forEach(tag => {
          profile.tags[tag] = (profile.tags[tag] || 0) + 1;
        });
      }

      // Track difficulty
      if (problem.difficulty) {
        profile.difficulty[problem.difficulty]++;
      }

      // Track languages
      if (sub.language) {
        profile.preferredLanguages[sub.language] = (profile.preferredLanguages[sub.language] || 0) + 1;
      }

      // Recent activity (last 20)
      if (profile.recentActivity.length < 20) {
        profile.recentActivity.push({
          problemId: problem._id,
          status: sub.status,
          difficulty: problem.difficulty,
          category: problem.category
        });
      }
    });

    // Calculate success rate
    profile.successRate = profile.attemptedProblems.size > 0
      ? profile.solvedProblems.size / profile.attemptedProblems.size
      : 0;

    // Determine skill level
    profile.skillLevel = this.determineSkillLevel(profile);

    return profile;
  }

  /**
   * Determine user's skill level
   */
  static determineSkillLevel(profile) {
    const { difficulty, successRate, solvedProblems } = profile;
    const totalSolved = solvedProblems.size;

    // Calculate weighted difficulty score
    const difficultyScore =
      (difficulty.easy * 1 + difficulty.medium * 2 + difficulty.hard * 3) /
      (difficulty.easy + difficulty.medium + difficulty.hard || 1);

    if (totalSolved < 10) return 'beginner';
    if (totalSolved < 50 && successRate < 0.5) return 'beginner';
    if (totalSolved < 50 && successRate >= 0.5) return 'intermediate';
    if (totalSolved >= 50 && difficultyScore < 1.5) return 'intermediate';
    if (totalSolved >= 100 && difficultyScore >= 2) return 'advanced';
    if (totalSolved >= 200 && successRate >= 0.7) return 'expert';

    return 'intermediate';
  }

  /**
   * Get candidate problems for recommendation
   */
  static async getCandidateProblems(userId, userProfile) {
    const { solvedProblems, skillLevel, categories, tags } = userProfile;

    // Build query
    const query = {
      _id: { $nin: Array.from(solvedProblems) },
      isActive: true
    };

    // Adjust difficulty based on skill level
    const difficultyMap = {
      beginner: ['easy'],
      intermediate: ['easy', 'medium'],
      advanced: ['medium', 'hard'],
      expert: ['hard']
    };
    query.difficulty = { $in: difficultyMap[skillLevel] || ['easy', 'medium'] };

    // Get problems
    const problems = await Problem.find(query).limit(100).lean();

    return problems;
  }

  /**
   * Score a problem for recommendation
   */
  static scoreProblem(problem, userProfile) {
    let score = 0;

    // Category match (30%)
    if (problem.category && userProfile.categories[problem.category]) {
      const categoryFrequency = userProfile.categories[problem.category] / userProfile.totalSubmissions;
      score += categoryFrequency * 30;
    }

    // Tag match (25%)
    if (problem.tags && problem.tags.length > 0) {
      const tagMatches = problem.tags.filter(tag => userProfile.tags[tag]).length;
      score += (tagMatches / problem.tags.length) * 25;
    }

    // Difficulty appropriateness (20%)
    const difficultyScore = {
      beginner: { easy: 20, medium: 10, hard: 0 },
      intermediate: { easy: 10, medium: 20, hard: 10 },
      advanced: { easy: 5, medium: 15, hard: 20 },
      expert: { easy: 0, medium: 10, hard: 20 }
    };
    score += difficultyScore[userProfile.skillLevel]?.[problem.difficulty] || 10;

    // Popularity (15%)
    const submissionCount = problem.submissionCount || 0;
    score += Math.min(submissionCount / 100, 1) * 15;

    // Acceptance rate (10%)
    const acceptanceRate = problem.acceptanceRate || 0.5;
    score += acceptanceRate * 10;

    return score;
  }

  /**
   * Get recommendation reason
   */
  static getRecommendationReason(problem, userProfile) {
    const reasons = [];

    // Category match
    if (problem.category && userProfile.categories[problem.category]) {
      reasons.push(`You've shown interest in ${problem.category}`);
    }

    // Difficulty match
    const difficultyReasons = {
      beginner: 'Good for building fundamentals',
      intermediate: 'Matches your current skill level',
      advanced: 'Challenging problem to advance your skills',
      expert: 'Expert-level challenge'
    };
    reasons.push(difficultyReasons[userProfile.skillLevel]);

    // Tag match
    const matchingTags = problem.tags?.filter(tag => userProfile.tags[tag]) || [];
    if (matchingTags.length > 0) {
      reasons.push(`Related to: ${matchingTags.slice(0, 2).join(', ')}`);
    }

    return reasons.join(' • ');
  }

  /**
   * Recommend courses
   */
  static async recommendCourses(userId, limit = 5) {
    try {
      const user = await User.findById(userId).lean();
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Get user's current courses
      const enrolledCourses = user.courses || [];

      // Get candidate courses
      const candidates = await Course.find({
        _id: { $nin: enrolledCourses },
        isActive: true,
        department: user.department
      }).limit(50).lean();

      // Score courses
      const scored = candidates.map(course => ({
        course,
        score: this.scoreCourse(course, user)
      }));

      // Sort and return
      scored.sort((a, b) => b.score - a.score);

      return {
        success: true,
        recommendations: scored.slice(0, limit).map(s => ({
          ...s.course,
          recommendationScore: s.score
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Score a course for recommendation
   */
  static scoreCourse(course, user) {
    let score = 0;

    // Department match (40%)
    if (course.department === user.department) {
      score += 40;
    }

    // Semester appropriateness (30%)
    if (course.semester === user.semester) {
      score += 30;
    } else if (Math.abs(course.semester - user.semester) === 1) {
      score += 15;
    }

    // Enrollment count (20%)
    const enrollmentCount = course.enrolledStudents?.length || 0;
    score += Math.min(enrollmentCount / 50, 1) * 20;

    // Rating (10%)
    const rating = course.rating || 3;
    score += (rating / 5) * 10;

    return score;
  }

  /**
   * Recommend learning paths
   */
  static async recommendLearningPaths(userId) {
    try {
      const submissions = await Submission.find({ userId })
        .populate('problemId')
        .lean();

      const userProfile = this.analyzeUserProfile(submissions);

      // Identify weak areas
      const weakAreas = this.identifyWeakAreas(userProfile);

      // Generate learning paths
      const paths = weakAreas.map(area => ({
        category: area.category,
        currentLevel: area.level,
        targetLevel: area.targetLevel,
        recommendedProblems: area.problems,
        estimatedTime: area.estimatedTime,
        priority: area.priority
      }));

      return {
        success: true,
        learningPaths: paths,
        userProfile
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Identify weak areas
   */
  static identifyWeakAreas(userProfile) {
    const weakAreas = [];

    // Analyze categories
    const allCategories = ['arrays', 'strings', 'trees', 'graphs', 'dynamic-programming', 'sorting', 'searching'];

    allCategories.forEach(category => {
      const solved = userProfile.categories[category] || 0;
      const total = userProfile.totalSubmissions;
      const percentage = total > 0 ? solved / total : 0;

      if (percentage < 0.15) {
        weakAreas.push({
          category,
          level: 'beginner',
          targetLevel: 'intermediate',
          problems: [],
          estimatedTime: '2-3 weeks',
          priority: 'high'
        });
      }
    });

    return weakAreas;
  }

  /**
   * Get similar users (collaborative filtering)
   */
  static async findSimilarUsers(userId, limit = 10) {
    try {
      const userSubmissions = await Submission.find({ userId }).lean();
      const userProblems = new Set(userSubmissions.map(s => s.problemId.toString()));

      // Get all users with submissions
      const allUsers = await User.find({ role: 'student', _id: { $ne: userId } })
        .select('_id')
        .lean();

      const similarities = [];

      for (const user of allUsers) {
        const otherSubmissions = await Submission.find({ userId: user._id }).lean();
        const otherProblems = new Set(otherSubmissions.map(s => s.problemId.toString()));

        // Calculate Jaccard similarity
        const intersection = new Set([...userProblems].filter(p => otherProblems.has(p)));
        const union = new Set([...userProblems, ...otherProblems]);
        const similarity = intersection.size / union.size;

        if (similarity > 0.1) {
          similarities.push({
            userId: user._id,
            similarity
          });
        }
      }

      // Sort by similarity
      similarities.sort((a, b) => b.similarity - a.similarity);

      return {
        success: true,
        similarUsers: similarities.slice(0, limit)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = RecommendationEngine;
