const express = require('express');
const router = express.Router();
const Report = require('../../models/admin/Report');
const { authorize } = require('../../middleware/rbac');
const asyncHandler = require('../../errors/asyncHandler');

// Generate report
router.post('/', authorize(['admin', 'faculty', 'hod']), asyncHandler(async (req, res) => {
  const { title, type, filters, format } = req.body;

  const report = new Report({
    title,
    type,
    filters,
    format,
    generatedBy: req.user.id,
    status: 'pending'
  });

  await report.save();
  res.status(201).json(report);
}));

// Get user reports
router.get('/user/:userId', asyncHandler(async (req, res) => {
  const reports = await Report.find({ generatedBy: req.params.userId })
    .sort({ createdAt: -1 });

  res.json(reports);
}));

// Get report details
router.get('/:reportId', asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.reportId)
    .populate('generatedBy', 'name email');

  if (!report) return res.status(404).json({ error: 'Report not found' });

  res.json(report);
}));

// Download report
router.get('/:reportId/download', asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.reportId);

  if (!report) return res.status(404).json({ error: 'Report not found' });
  if (report.status !== 'completed') return res.status(400).json({ error: 'Report not ready' });

  res.download(report.fileUrl);
}));

// Delete report
router.delete('/:reportId', authorize(['admin']), asyncHandler(async (req, res) => {
  await Report.findByIdAndDelete(req.params.reportId);
  res.json({ message: 'Report deleted' });
}));

module.exports = router;
