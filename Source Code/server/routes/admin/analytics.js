const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const comprehensiveAnalyticsController = require('../../controllers/admin/comprehensiveAnalyticsController');

// 📊 Student Performance Analytics
router.get('/analytics/student-performance', 
  authenticate, 
  authorize(['admin', 'super_admin', 'hod', 'faculty']), 
  comprehensiveAnalyticsController.getStudentPerformanceAnalytics
);

// 📈 Course Engagement Analytics
router.get('/analytics/course-engagement', 
  authenticate, 
  authorize(['admin', 'super_admin', 'hod', 'faculty']), 
  comprehensiveAnalyticsController.getCourseEngagementAnalytics
);

// 🎯 Learning Outcomes Analytics
router.post('/analytics/learning-outcomes', 
  authenticate, 
  authorize(['admin', 'super_admin', 'hod', 'faculty']), 
  comprehensiveAnalyticsController.getLearningOutcomesAnalytics
);

// 🔍 Predictive Analytics Dashboard
router.get('/analytics/predictive-dashboard', 
  authenticate, 
  authorize(['admin', 'super_admin']), 
  comprehensiveAnalyticsController.getPredictiveAnalyticsDashboard
);

// 📊 System Health & Performance Analytics
router.get('/analytics/system-health', 
  authenticate, 
  authorize(['admin', 'super_admin']), 
  comprehensiveAnalyticsController.getSystemHealthAnalytics
);

// 📋 Custom Report Builder
router.post('/analytics/generate-report', 
  authenticate, 
  authorize(['admin', 'super_admin']), 
  comprehensiveAnalyticsController.generateCustomReport
);

module.exports = router;
