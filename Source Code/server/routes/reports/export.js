const express = require('express');
const router = express.Router();
const { authorize } = require('../../middleware/rbac');
const asyncHandler = require('../../errors/asyncHandler');

router.post('/submissions/:courseId', authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const { format } = req.body;
  res.json({ message: `Submissions export initiated in ${format} format`, courseId: req.params.courseId });
}));

router.post('/grades/:courseId', authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const { format } = req.body;
  res.json({ message: `Grades export initiated in ${format} format`, courseId: req.params.courseId });
}));

router.post('/analytics/:courseId', authorize(['faculty', 'admin', 'hod']), asyncHandler(async (req, res) => {
  const { format } = req.body;
  res.json({ message: `Analytics export initiated in ${format} format`, courseId: req.params.courseId });
}));

router.post('/attendance/:courseId', authorize(['faculty', 'admin']), asyncHandler(async (req, res) => {
  const { format } = req.body;
  res.json({ message: `Attendance export initiated in ${format} format`, courseId: req.params.courseId });
}));

module.exports = router;
