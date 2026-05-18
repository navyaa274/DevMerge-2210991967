const express = require('express');
const router = express.Router();

// Import controllers
const researchProjectController = require('../../controllers/research/researchProjectController');
const publicationController = require('../../controllers/research/publicationController');
const conferenceController = require('../../controllers/research/conferenceController');
const grantController = require('../../controllers/research/grantController');

// Import middleware
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');
const validateRequest = require('../../middleware/validateRequest');

// Import validators
const researchValidators = require('../../validators/research/researchValidators');

// Research Projects Routes
router.route('/projects')
  .get(
    authenticate,
    researchProjectController.getAllProjects
  )
  .post(
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    validateRequest(researchValidators.createProject),
    researchProjectController.createProject
  );

router.route('/projects/stats')
  .get(
    authenticate,
    researchProjectController.getProjectStats
  );

router.route('/projects/:id')
  .get(
    authenticate,
    researchProjectController.getProject
  )
  .put(
    authenticate,
    validateRequest(researchValidators.updateProject),
    researchProjectController.updateProject
  )
  .delete(
    authenticate,
    researchProjectController.deleteProject
  );

router.route('/projects/:id/students')
  .post(
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    validateRequest(researchValidators.addStudentResearcher),
    researchProjectController.addStudentResearcher
  );

router.route('/projects/:id/milestones/:milestoneId')
  .put(
    authenticate,
    validateRequest(researchValidators.updateMilestone),
    researchProjectController.updateMilestone
  );

// Publications Routes
router.route('/publications')
  .get(
    authenticate,
    publicationController.getAllPublications
  )
  .post(
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin', 'student'),
    validateRequest(researchValidators.createPublication),
    publicationController.createPublication
  );

router.route('/publications/stats')
  .get(
    authenticate,
    publicationController.getPublicationStats
  );

router.route('/publications/:id')
  .get(
    authenticate,
    publicationController.getPublication
  )
  .put(
    authenticate,
    validateRequest(researchValidators.updatePublication),
    publicationController.updatePublication
  )
  .delete(
    authenticate,
    publicationController.deletePublication
  );

router.route('/publications/:id/cite')
  .post(
    authenticate,
    publicationController.addCitation
  );

router.route('/publications/:id/authors')
  .post(
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    validateRequest(researchValidators.addAuthor),
    publicationController.addAuthor
  );

// Conferences Routes
router.route('/conferences')
  .get(
    authenticate,
    conferenceController.getAllConferences
  )
  .post(
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    validateRequest(researchValidators.createConference),
    conferenceController.createConference
  );

router.route('/conferences/upcoming')
  .get(
    authenticate,
    conferenceController.getUpcomingConferences
  );

router.route('/conferences/:id')
  .get(
    authenticate,
    conferenceController.getConference
  )
  .put(
    authenticate,
    validateRequest(researchValidators.updateConference),
    conferenceController.updateConference
  )
  .delete(
    authenticate,
    conferenceController.deleteConference
  );

router.route('/conferences/:id/submissions')
  .post(
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin', 'student'),
    validateRequest(researchValidators.createSubmission),
    conferenceController.createSubmission
  );

// Grants Routes
router.route('/grants')
  .get(
    authenticate,
    grantController.getAllGrants
  )
  .post(
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    validateRequest(researchValidators.createGrant),
    grantController.createGrant
  );

router.route('/grants/stats')
  .get(
    authenticate,
    grantController.getGrantStats
  );

router.route('/grants/:id')
  .get(
    authenticate,
    grantController.getGrant
  )
  .put(
    authenticate,
    validateRequest(researchValidators.updateGrant),
    grantController.updateGrant
  )
  .delete(
    authenticate,
    grantController.deleteGrant
  );

router.route('/grants/:id/reports')
  .post(
    authenticate,
    authorizeRoles('faculty', 'admin', 'super_admin'),
    validateRequest(researchValidators.createReport),
    grantController.createReport
  );

// Research Dashboard
router.route('/dashboard')
  .get(
    authenticate,
    async (req, res) => {
      // This would aggregate data from all research modules
      // For now, return a placeholder
      res.status(200).json({
        success: true,
        data: {
          totalProjects: 0,
          totalPublications: 0,
          totalGrants: 0,
          upcomingConferences: 0,
          recentActivity: []
        }
      });
    }
  );

// Search across all research entities
router.route('/search')
  .get(
    authenticate,
    async (req, res) => {
      const { q, type } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      // This would search across projects, publications, conferences, grants
      // For now, return a placeholder
      res.status(200).json({
        success: true,
        data: {
          query: q,
          type: type || 'all',
          results: []
        }
      });
    }
  );

module.exports = router;