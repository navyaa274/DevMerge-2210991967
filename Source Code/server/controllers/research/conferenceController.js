const Conference = require('../../models/research/Conference');
const asyncHandler = require('../../errors/asyncHandler');
const AppError = require('../../errors/AppError');

// @desc    Get all conferences
// @route   GET /api/research/conferences
// @access  Public/Private based on visibility
exports.getAllConferences = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    country,
    city,
    search,
    sort = '-dates.startDate'
  } = req.query;

  // Build query
  const query = {};

  // Visibility filter
  if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
    // Admins can see all conferences
  } else {
    // Regular users can see public conferences
    query.visibility = 'Public';
  }

  // Apply filters
  if (status) query.status = status;
  if (country) query['location.country'] = country;
  if (city) query['location.city'] = city;

  // Search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { acronym: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const conferences = await Conference.find(query)
    .populate('createdBy', 'firstName lastName email')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Get total count for pagination
  const total = await Conference.countDocuments(query);

  res.status(200).json({
    success: true,
    count: conferences.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: conferences
  });
});

// @desc    Get upcoming conferences
// @route   GET /api/research/conferences/upcoming
// @access  Public
exports.getUpcomingConferences = asyncHandler(async (req, res, next) => {
  const conferences = await Conference.findUpcoming()
    .populate('createdBy', 'firstName lastName email')
    .limit(20)
    .lean();

  res.status(200).json({
    success: true,
    count: conferences.length,
    data: conferences
  });
});

// @desc    Get single conference
// @route   GET /api/research/conferences/:id
// @access  Public/Private based on visibility
exports.getConference = asyncHandler(async (req, res, next) => {
  const conference = await Conference.findById(req.params.id)
    .populate('createdBy', 'firstName lastName email designation department');

  if (!conference) {
    return next(new AppError('Conference not found', 404));
  }

  // Check visibility
  if (conference.visibility === 'Private' && 
      !conference.createdBy._id.equals(req.user?._id) && 
      !['admin', 'super_admin'].includes(req.user?.role)) {
    return next(new AppError('Not authorized to access this conference', 403));
  }

  res.status(200).json({
    success: true,
    data: conference
  });
});

// @desc    Create new conference
// @route   POST /api/research/conferences
// @access  Private (Faculty/Admin)
exports.createConference = asyncHandler(async (req, res, next) => {
  // Only faculty and admins can create conferences
  if (!['faculty', 'admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Only faculty members can create conferences', 403));
  }

  // Set createdBy to current user
  req.body.createdBy = req.user._id;

  const conference = await Conference.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Conference created successfully',
    data: conference
  });
});

// @desc    Update conference
// @route   PUT /api/research/conferences/:id
// @access  Private (Creator/Admin)
exports.updateConference = asyncHandler(async (req, res, next) => {
  let conference = await Conference.findById(req.params.id);

  if (!conference) {
    return next(new AppError('Conference not found', 404));
  }

  // Check authorization
  if (!conference.createdBy.equals(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to update this conference', 403));
  }

  // Update conference
  conference = await Conference.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('createdBy', 'firstName lastName email');

  res.status(200).json({
    success: true,
    message: 'Conference updated successfully',
    data: conference
  });
});

// @desc    Delete conference
// @route   DELETE /api/research/conferences/:id
// @access  Private (Creator/Admin)
exports.deleteConference = asyncHandler(async (req, res, next) => {
  const conference = await Conference.findById(req.params.id);

  if (!conference) {
    return next(new AppError('Conference not found', 404));
  }

  // Check authorization
  if (!conference.createdBy.equals(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to delete this conference', 403));
  }

  await conference.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Conference deleted successfully'
  });
});

// @desc    Create conference submission
// @route   POST /api/research/conferences/:id/submissions
// @access  Private (Faculty/Student/Admin)
exports.createSubmission = asyncHandler(async (req, res, next) => {
  const conference = await Conference.findById(req.params.id);

  if (!conference) {
    return next(new AppError('Conference not found', 404));
  }

  // Check if conference is accepting submissions
  if (!conference.isAcceptingSubmissions()) {
    return next(new AppError('Conference is not accepting submissions at this time', 400));
  }

  // Check if user is author
  const isAuthor = req.body.authors?.some(author => 
    author.user && author.user.toString() === req.user._id.toString()
  );

  if (!isAuthor && !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You must be listed as an author to create a submission', 403));
  }

  // In a real implementation, this would create a Submission document
  // For now, return a success response
  res.status(201).json({
    success: true,
    message: 'Submission created successfully',
    data: {
      conference: conference.name,
      submission: req.body,
      submissionDeadline: conference.dates.submissionDeadline
    }
  });
});