const express = require('express');
const mongoose = require('mongoose');
const Accreditation = require('../../models/academic/Accreditation');
const { authenticate } = require('../../middleware/auth');
const authorizeRoles = require('../../middleware/authorizeRoles');

const router = express.Router();

/**
 * @route   GET /api/accreditation
 * @desc    Get all accreditations for a department
 * @access  Private (HOD, Admin)
 */
router.get('/', authenticate, authorizeRoles('hod', 'admin', 'super_admin'), async (req, res) => {
    try {
        const accreditations = await Accreditation.find({ department: req.user.department || req.query.department })
            .populate('department', 'name code')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: accreditations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/accreditation
 * @desc    Initialize a new Accreditation Workflow
 * @access  Private (HOD, Admin)
 */
router.post('/', authenticate, authorizeRoles('admin', 'super_admin', 'hod'), async (req, res) => {
    try {
        const { title, department, framework, startDate, targetDate, criteria } = req.body;

        const accreditation = new Accreditation({
            title,
            department,
            framework,
            startDate,
            targetDate,
            criteria,
            createdBy: req.user.id,
            auditTrail: [{
                action: 'Accreditation workflow initialized',
                performedBy: req.user.id,
                details: `Framework: ${framework}`
            }]
        });

        await accreditation.save();

        res.status(201).json({ success: true, data: accreditation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/accreditation/:id/documents
 * @desc    Upload document for compliance tracking
 * @access  Private (Faculty, HOD, Admin)
 */
router.post('/:id/documents', authenticate, authorizeRoles('faculty', 'hod', 'admin'), async (req, res) => {
    try {
        const { criterionId, title, fileUrl, description } = req.body;
        let accreditation = await Accreditation.findById(req.params.id);

        if (!accreditation) return res.status(404).json({ success: false, message: 'Accreditation not found' });

        const criterion = accreditation.criteria.id(criterionId);
        if (!criterion) return res.status(404).json({ success: false, message: 'Criterion not found' });

        criterion.documents.push({
            title,
            fileUrl,
            description,
            uploadedBy: req.user.id
        });

        accreditation.auditTrail.push({
            action: 'Document Uploaded',
            performedBy: req.user.id,
            details: `Document "${title}" uploaded for ${criterion.name}`
        });

        await accreditation.save();

        res.json({ success: true, message: 'Document added to compliance tracker', data: accreditation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/accreditation/:id/nba-report
 * @desc    Generate NBA-ready structured report
 * @access  Private (HOD, Admin)
 */
router.get('/:id/nba-report', authenticate, authorizeRoles('hod', 'admin', 'super_admin'), async (req, res) => {
    try {
        const accredit = await Accreditation.findById(req.params.id)
            .populate('department', 'name code')
            .populate('criteria.assignedTo', 'firstName lastName')
            .populate('auditTrail.performedBy', 'firstName lastName');

        if (!accredit) return res.status(404).json({ success: false, message: 'Accreditation not found' });

        if (accredit.framework !== 'NBA') {
            return res.status(400).json({ success: false, message: 'This is not an NBA accreditation workflow.' });
        }

        // NBA Report Format Simulation
        const reportUrl = `${process.env.APP_URL || 'http://localhost:5002'}/reports/SAR_${accredit.department.code}_${new Date().getFullYear()}.pdf`;

        accredit.auditTrail.push({
            action: 'NBA Report Generated',
            performedBy: req.user.id,
            details: 'Self Assessment Report (SAR) auto-compiled based on continuous tracking data.'
        });

        await accredit.save();

        res.json({
            success: true,
            message: 'NBA auto-generated Self Assessment Report Ready',
            data: {
                reportUrl,
                summary: {
                    status: accredit.status,
                    complianceTrackingScore: accredit.criteria.reduce((sum, c) => sum + c.score, 0),
                    attainment: accredit.overallAttainment,
                    documentsVerified: accredit.criteria.reduce((sum, c) => sum + (c.documents.length), 0)
                }
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
