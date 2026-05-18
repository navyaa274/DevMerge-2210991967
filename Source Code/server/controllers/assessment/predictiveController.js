const PredictiveAnalytics = require('../../models/assessment/predictiveAnalytics');
const User = require('../../models/auth/User');
const Course = require('../../models/academic/Course');

class PredictiveController {
  // Get all predictions for a user
  async getUserPredictions(req, res) {
    try {
      const { userId } = req.params;
      const { prediction_type, course_id } = req.query;

      // Build filter
      const filter = { user_id: userId };
      if (prediction_type) filter.prediction_type = prediction_type;
      if (course_id) filter.course_id = course_id;

      const predictions = await PredictiveAnalytics.find(filter)
        .populate('course_id', 'title code')
        .sort({ created_at: -1 });

      res.json({
        success: true,
        data: predictions,
        count: predictions.length
      });
    } catch (error) {
      console.error('Error fetching user predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch predictions',
        error: error.message
      });
    }
  }

  // Get predictions for a course
  async getCoursePredictions(req, res) {
    try {
      const { courseId } = req.params;
      const { prediction_type } = req.query;

      // Build filter
      const filter = { course_id: courseId };
      if (prediction_type) filter.prediction_type = prediction_type;

      const predictions = await PredictiveAnalytics.find(filter)
        .populate('user_id', 'name email')
        .sort({ created_at: -1 });

      res.json({
        success: true,
        data: predictions,
        count: predictions.length
      });
    } catch (error) {
      console.error('Error fetching course predictions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch predictions',
        error: error.message
      });
    }
  }

  // Generate new prediction
  async generatePrediction(req, res) {
    try {
      const { user_id, course_id, prediction_type } = req.body;

      // Validate input
      if (!user_id || !course_id || !prediction_type) {
        return res.status(400).json({
          success: false,
          message: 'user_id, course_id, and prediction_type are required'
        });
      }

      // Check if user and course exist
      const user = await User.findById(user_id);
      const course = await Course.findById(course_id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Generate mock prediction value (replace with actual ML model)
      let prediction_value;
      switch (prediction_type) {
        case 'completion_probability':
          prediction_value = Math.random() * 0.4 + 0.6; // 0.6 to 1.0
          break;
        case 'grade_prediction':
          prediction_value = Math.floor(Math.random() * 30) + 70; // 70 to 100
          break;
        case 'dropout_risk':
          prediction_value = Math.random() * 0.3; // 0 to 0.3
          break;
        case 'time_to_completion':
          prediction_value = Math.floor(Math.random() * 60) + 30; // 30 to 90 days
          break;
        case 'skill_mastery':
          prediction_value = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
          break;
        case 'engagement_level':
          prediction_value = Math.floor(Math.random() * 3) + 3; // 3 to 5
          break;
        default:
          prediction_value = Math.random();
      }

      // Create prediction
      const prediction = new PredictiveAnalytics({
        user_id,
        course_id,
        prediction_type,
        prediction_value,
        confidence_score: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        model_version: '1.0',
        features: {
          attendance_rate: Math.random() * 0.3 + 0.7,
          assignment_completion_rate: Math.random() * 0.3 + 0.7,
          forum_participation: Math.random(),
          average_grade: Math.random() * 30 + 70,
          time_spent_on_platform: Math.random() * 100 + 50
        }
      });

      await prediction.save();

      res.status(201).json({
        success: true,
        data: prediction,
        message: 'Prediction generated successfully'
      });
    } catch (error) {
      console.error('Error generating prediction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate prediction',
        error: error.message
      });
    }
  }

  // Delete a prediction
  async deletePrediction(req, res) {
    try {
      const { predictionId } = req.params;

      const prediction = await PredictiveAnalytics.findByIdAndDelete(predictionId);

      if (!prediction) {
        return res.status(404).json({
          success: false,
          message: 'Prediction not found'
        });
      }

      res.json({
        success: true,
        message: 'Prediction deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting prediction:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete prediction',
        error: error.message
      });
    }
  }

  // Get prediction analytics
  async getPredictionAnalytics(req, res) {
    try {
      const { courseId } = req.params;

      // Get all predictions for the course
      const predictions = await PredictiveAnalytics.find({ course_id: courseId });

      // Calculate analytics
      const analytics = {
        total_predictions: predictions.length,
        prediction_types: {},
        average_completion_probability: 0,
        average_grade_prediction: 0,
        high_dropout_risk_count: 0,
        average_confidence: 0
      };

      let completion_prob_sum = 0;
      let grade_pred_sum = 0;
      let confidence_sum = 0;
      let completion_prob_count = 0;
      let grade_pred_count = 0;
      let confidence_count = 0;

      predictions.forEach(pred => {
        // Count prediction types
        if (!analytics.prediction_types[pred.prediction_type]) {
          analytics.prediction_types[pred.prediction_type] = 0;
        }
        analytics.prediction_types[pred.prediction_type]++;

        // Sum values for averaging
        if (pred.prediction_type === 'completion_probability') {
          completion_prob_sum += pred.prediction_value;
          completion_prob_count++;
        }
        if (pred.prediction_type === 'grade_prediction') {
          grade_pred_sum += pred.prediction_value;
          grade_pred_count++;
        }
        if (pred.prediction_type === 'dropout_risk' && pred.prediction_value > 0.5) {
          analytics.high_dropout_risk_count++;
        }
        if (pred.confidence_score) {
          confidence_sum += pred.confidence_score;
          confidence_count++;
        }
      });

      // Calculate averages
      if (completion_prob_count > 0) {
        analytics.average_completion_probability = completion_prob_sum / completion_prob_count;
      }
      if (grade_pred_count > 0) {
        analytics.average_grade_prediction = grade_pred_sum / grade_pred_count;
      }
      if (confidence_count > 0) {
        analytics.average_confidence = confidence_sum / confidence_count;
      }

      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error fetching prediction analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch prediction analytics',
        error: error.message
      });
    }
  }
}

module.exports = new PredictiveController();
