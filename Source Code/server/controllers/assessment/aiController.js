const AITutor = require('../../models/assessment/aiTutors');
const AIConversation = require('../../models/assessment/aiConversations');
const LearningRecommendation = require('../../models/assessment/learningRecommendations');
const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');
const Problem = require('../../models/assessment/problems/Problem');
const aiServiceManager = require('../../services/ai/aiServiceManager');
const { v4: uuidv4 } = require('uuid');

class AIController {
  // Create a new AI tutor
  async createTutor(req, res) {
    try {
      const tutorData = {
        ...req.body,
        created_by: req.user._id
      };

      const tutor = new AITutor(tutorData);
      await tutor.save();

      res.json({
        success: true,
        message: 'AI Tutor created successfully',
        data: tutor
      });
    } catch (error) {
      console.error('Error creating AI tutor:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get all AI tutors
  async getTutors(req, res) {
    try {
      const {
        subject,
        course_id,
        capabilities,
        page = 1,
        limit = 10
      } = req.query;

      let filter = { is_active: true };

      if (subject) filter.subject = subject;
      if (course_id) filter.course_id = course_id;
      if (capabilities) filter.capabilities = { $in: capabilities.split(',') };

      const tutors = await AITutor.find(filter)
        .populate('course_id', 'title')
        .populate('created_by', 'name')
        .sort({ usage_stats: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AITutor.countDocuments(filter);

      res.json({
        success: true,
        data: {
          tutors,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching AI tutors:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get a specific AI tutor
  async getTutorById(req, res) {
    try {
      const { tutorId } = req.params;

      const tutor = await AITutor.findById(tutorId)
        .populate('course_id', 'title')
        .populate('created_by', 'name');

      if (!tutor) {
        return res.status(404).json({
          success: false,
          message: 'AI Tutor not found'
        });
      }

      res.json({
        success: true,
        data: tutor
      });
    } catch (error) {
      console.error('Error fetching AI tutor:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Ask AI tutor a question
  async askQuestion(req, res) {
    try {
      const { tutorId } = req.params;
      const { message, context = {}, session_id } = req.body;
      const userId = req.user._id;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Get the AI tutor
      const tutor = await AITutor.findById(tutorId);
      if (!tutor) {
        return res.status(404).json({
          success: false,
          message: 'AI Tutor not found'
        });
      }

      // Find or create conversation
      let conversation;
      if (session_id) {
        conversation = await AIConversation.findOne({ session_id, user_id: userId });
      }

      if (!conversation) {
        conversation = new AIConversation({
          user_id: userId,
          ai_tutor_id: tutorId,
          course_id: context.course_id,
          problem_id: context.problem_id,
          session_id: session_id || uuidv4(),
          title: context.title || `Chat with ${tutor.name}`,
          context: context.type || 'general_learning'
        });
      }

      // Add user message to conversation
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Generate AI response
      const aiResponse = await mockAIService.generateResponse(message, context, tutor);

      // Add AI response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
        metadata: {
          confidence: aiResponse.confidence,
          tokens_used: aiResponse.tokens_used,
          suggestions: aiResponse.suggestions
        }
      });

      // Update conversation stats
      conversation.tokens_used += aiResponse.tokens_used;
      conversation.duration_seconds = (Date.now() - conversation.created_at.getTime()) / 1000;

      // Update tutor usage stats
      await AITutor.findByIdAndUpdate(tutorId, {
        $inc: {
          'usage_stats.total_conversations': 1,
          'usage_stats.total_messages': 1
        },
        'usage_stats.last_used': new Date()
      });

      await conversation.save();

      res.json({
        success: true,
        data: {
          response: aiResponse.response,
          session_id: conversation.session_id,
          confidence: aiResponse.confidence,
          suggestions: aiResponse.suggestions,
          tutor_name: tutor.name
        }
      });

    } catch (error) {
      console.error('Error asking AI question:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get conversation history
  async getConversationHistory(req, res) {
    try {
      const userId = req.user._id;
      const { tutorId, session_id, page = 1, limit = 20 } = req.query;

      let filter = { user_id: userId };

      if (tutorId) filter.ai_tutor_id = tutorId;
      if (session_id) filter.session_id = session_id;

      const conversations = await AIConversation.find(filter)
        .populate('ai_tutor_id', 'name subject avatar_url')
        .populate('course_id', 'title')
        .populate('problem_id', 'title')
        .sort({ last_activity: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await AIConversation.countDocuments(filter);

      res.json({
        success: true,
        data: {
          conversations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get specific conversation
  async getConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const userId = req.user._id;

      const conversation = await AIConversation.findOne({
        _id: conversationId,
        user_id: userId
      })
        .populate('ai_tutor_id', 'name subject avatar_url capabilities')
        .populate('course_id', 'title')
        .populate('problem_id', 'title');

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Rate conversation
  async rateConversation(req, res) {
    try {
      const { conversationId } = req.params;
      const { rating, feedback } = req.body;
      const userId = req.user._id;

      const conversation = await AIConversation.findOne({
        _id: conversationId,
        user_id: userId
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      conversation.user_rating = rating;
      conversation.user_feedback = feedback;
      await conversation.save();

      // Update tutor rating
      if (rating) {
        await AITutor.findByIdAndUpdate(conversation.ai_tutor_id, [
          {
            $set: {
              'usage_stats.average_rating': {
                $avg: ['$usage_stats.average_rating', rating]
              }
            }
          }
        ]);
      }

      res.json({
        success: true,
        message: 'Conversation rated successfully'
      });
    } catch (error) {
      console.error('Error rating conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Generate learning recommendations
  async generateRecommendations(req, res) {
    try {
      const userId = req.user._id;
      const { course_id, trigger_event, context } = req.body;

      // Analyze user's learning data
      const userData = await this._analyzeUserLearningData(userId, course_id);

      // Generate recommendations based on analysis
      const recommendations = await this._generateRecommendationsFromAnalysis(userData, trigger_event, context);

      // Save recommendations
      const savedRecommendations = [];
      for (const rec of recommendations) {
        const recommendation = new LearningRecommendation({
          user_id: userId,
          course_id,
          ...rec
        });
        await recommendation.save();
        savedRecommendations.push(recommendation);
      }

      res.json({
        success: true,
        message: 'Learning recommendations generated',
        data: savedRecommendations
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Helper method to analyze user learning data
  async _analyzeUserLearningData(userId, courseId) {
    // Get user's performance data, submission history, etc.
    const userData = {
      user_id: userId,
      course_id: courseId,
      // Fetch real data from database
      performance_score: 0.75,
      consistency_score: 0.8,
      time_spent_hours: 45,
      problems_attempted: 120,
      problems_solved: 95,
      average_time_per_problem: 22.5,
      weak_topics: ['recursion', 'dynamic_programming'],
      strong_topics: ['arrays', 'strings']
    };

    // Use AI to analyze patterns
    const aiAnalysis = await aiServiceManager.analyzeLearningPatterns(userData, []);

    return {
      ...userData,
      ai_insights: aiAnalysis
    };
  }

  // Helper method to generate recommendations
  async _generateRecommendationsFromAnalysis(userData, triggerEvent, context) {
    const recommendations = [];

    // Generate different types of recommendations based on analysis
    if (userData.performance_score < 0.7) {
      recommendations.push({
        recommendation_type: 'practice_exercise',
        title: 'Practice Weak Topics',
        description: `Focus on improving ${userData.weak_topics.join(' and ')} with targeted exercises.`,
        trigger_event: triggerEvent,
        priority: 'high',
        content: {
          topics: userData.weak_topics,
          suggested_problems: ['problem1', 'problem2', 'problem3']
        }
      });
    }

    if (userData.consistency_score < 0.8) {
      recommendations.push({
        recommendation_type: 'learning_path',
        title: 'Create Study Schedule',
        description: 'Establish a consistent study routine to improve learning outcomes.',
        trigger_event: triggerEvent,
        priority: 'medium',
        content: {
          suggested_schedule: {
            daily_study_time: 2,
            weekly_sessions: 5,
            focus_topics: userData.weak_topics
          }
        }
      });
    }

    recommendations.push({
      recommendation_type: 'concept_review',
      title: 'Review Key Concepts',
      description: 'Regular review of fundamental concepts helps reinforce learning.',
      trigger_event: triggerEvent,
      priority: 'low',
      content: {
        concepts_to_review: ['data structures', 'algorithms', 'problem solving'],
        review_frequency: 'weekly'
      }
    });

    return recommendations;
  }

  // Get user's recommendations
  async getUserRecommendations(req, res) {
    try {
      const userId = req.user._id;
      const { status, type, page = 1, limit = 10 } = req.query;

      let filter = { user_id: userId };

      if (status) filter.status = status;
      if (type) filter.recommendation_type = type;
      filter.expires_at = { $gt: new Date() }; // Only active recommendations

      const recommendations = await LearningRecommendation.find(filter)
        .populate('course_id', 'title')
        .sort({ priority: -1, created_at: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await LearningRecommendation.countDocuments(filter);

      res.json({
        success: true,
        data: {
          recommendations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update recommendation status
  async updateRecommendation(req, res) {
    try {
      const { recommendationId } = req.params;
      const { status, feedback_rating } = req.body;
      const userId = req.user._id;

      const recommendation = await LearningRecommendation.findOne({
        _id: recommendationId,
        user_id: userId
      });

      if (!recommendation) {
        return res.status(404).json({
          success: false,
          message: 'Recommendation not found'
        });
      }

      if (status) recommendation.status = status;
      if (feedback_rating) recommendation.feedback_rating = feedback_rating;

      if (status === 'accepted' || status === 'completed') {
        recommendation.action_taken_at = new Date();
      }

      await recommendation.save();

      res.json({
        success: true,
        message: 'Recommendation updated successfully',
        data: recommendation
      });
    } catch (error) {
      console.error('Error updating recommendation:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new AIController();
