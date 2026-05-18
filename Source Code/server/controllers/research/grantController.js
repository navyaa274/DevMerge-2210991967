const Grant = require('../../models/research/Grant');
const asyncHandler = require('../../errors/asyncHandler');
const AppError = require('../../errors/AppError');

// @desc    Get all grants
// @route   GET /api/research/grants
// @access  Private (Admin/Department)
exports.getAllGrants = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    fundingAgency,
    pi,
    sort = '-timeline.startDate'
  } = req.query;

  // Build query
  const query = {};

  // Apply filters
  if (status) query.status = status;
  if (fundingAgency) query.fundingAgency = { $regex: fundingAgency, $options: 'i' };
  if (pi) query.principalInvestigator = pi;

  // Check permissions
  if (req.user.role === 'faculty') {
    // Faculty can only see their own grants or grants they're involved in
    query.$or = [
      { principalInvestigator: req.user._id },
      { 'coInvestigators.user': req.user._id }
    ];
  } else if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    // Admins can see all grants
  } else {
    // Regular users can only see public grants
    query.visibility = 'Public';
  }

  const grants = await Grant.find(query)
    .populate('principalInvestigator', 'firstName lastName email')
    .populate('coInvestigators.user', 'firstName lastName email')
    .populate('department', 'name code')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  const total = await Grant.countDocuments(query);

  res.status(200).json({
    success: true,
    count: grants.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: grants
  });
});

// @desc    Get single grant
// @route   GET /api/research/grants/:id
// @access  Private (Admin/PI/Co-Investigator)
exports.getGrant = asyncHandler(async (req, res, next) => {
  const grant = await Grant.findById(req.params.id)
    .populate('principalInvestigator', 'firstName lastName email designation department')
    .populate('coInvestigators.user', 'firstName lastName email')
    .populate('department', 'name code')
    .populate('deliverables', 'type description status');

  if (!grant) {
    return next(new AppError('Grant not found', 404));
  }

  // Check authorization
  const isAuthorized = 
    grant.principalInvestigator.equals(req.user._id) ||
    grant.coInvestigators.some(ci => ci.user.equals(req.user._id)) ||
    req.user.role === 'admin' ||
    req.user.role === 'super_admin' ||
    (req.user.role === 'faculty' && grant.department.equals(req.user.department));

  if (!isAuthorized) {
    return next(new AppError('Not authorized to access this grant', 403));
  }

  res.status(200).json({
    success: true,
    data: grant
  });
});

// @desc    Create new grant
// @route   POST /api/research/grants
// @access  Private (Faculty/Admin)
exports.createGrant = asyncHandler(async (req, res, next) => {
  // Only faculty and admins can create grants
  if (!['faculty', 'admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Only faculty and admins can create grants', 403));
  }

  // Set PI to current user if not specified
  if (!req.body.principalInvestigator) {
    req.body.principalInvestigator = req.user._id;
  }

  // Set createdBy
  req.body.createdBy = req.user._id;

  const grant = await Grant.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Grant created successfully',
    data: grant
  });
});

// @desc    Update grant
// @route   PUT /api/research/grants/:id
// @access  Private (PI/Admin)
exports.updateGrant = asyncHandler(async (req, res, next) => {
  let grant = await Grant.findById(req.params.id);

  if (!grant) {
    return next(new AppError('Grant not found', 404));
  }

  // Check authorization
  const isAuthorized = 
    grant.principalInvestigator.equals(req.user._id) ||
    grant.coInvestigators.some(ci => ci.user.equals(req.user._id)) ||
    req.user.role === 'admin' ||
    req.user.role === 'super_admin';

  if (!isAuthorized) {
    return next(new AppError('Not authorized to update this grant', 403));
  }

  // Prevent updating certain fields
  const allowedUpdates = [
    'title', 'description', 'status', 'timeline', 'deliverables',
    'budget', 'compliance', 'notes'
  ];
  
  const updateData = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  grant = await Grant.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true
    }
  ).populate('principalInvestigator', 'firstName lastName email');

  res.status(200).json({
    success: true,
    message: 'Grant updated successfully',
    data: grant
  });
});

// @desc    Delete grant
// @route   DELETE /api/research/grants/:id
// @access  Private (PI/Admin)
exports.deleteGrant = asyncHandler(async (req, res, next) => {
  const grant = await Grant.findById(req.params.id);

  if (!grant) {
    return next(new AppError('Grant not found', 404));
  }

  // Check authorization
  if (!grant.principalInvestigator.equals(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to delete this grant', 403));
  }

  await grant.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Grant deleted successfully'
  });
});

// @desc    Get grant statistics
// @route   GET /api/research/grants/stats
// @access  Private (Admin/Department)
exports.getGrantStats = asyncHandler(async (req, res, next) => {
  const { department, year } = req.query;
  
  const matchStage = {};
  
  if (department) {
    matchStage.department = department;
  } else if (req.user.department && !['admin', 'super_admin'].includes(req.user.role)) {
    // Regular users can only see stats for their department
    matchStage.department = req.user.department;
  }

  if (year) {
    matchStage['timeline.startDate'] = {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${parseInt(year) + 1}-01-01`)
    };
  }

  const stats = await Grant.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalGrants: { $sum: 1 },
        totalFunding: { $sum: '$budget.totalAmount' },
        activeGrants: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        completedGrants: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        byStatus: {
          $push: {
            status: '$status',
            amount: '$budget.totalAmount'
          }
        },
        byAgency: {
          $push: {
            agency: '$fundingAgency',
            amount: '$budget.totalAmount'
          }
        }
      }
    },
    {
      $project: {
        totalGrants: 1,
        totalFunding: 1,
        activeGrants: 1,
        completedGrants: 1,
        statusBreakdown: {
          $arrayToObject: {
            $map: {
              input: '$byStatus',
              as: 'item',
              in: {
                k: '$$item.status',
                v: '$$item.amount'
              }
            }
          }
        },
        agencyBreakdown: {
          $arrayToObject: {
            $map: {
              input: '$byAgency',
              as: 'item',
              in: {
                k: '$$item.agency',
                v: '$$item.amount'
              }
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalGrants: 0,
      totalFunding: 0,
      activeGrants: 0,
      completedGrants: 0,
      statusBreakdown: {},
      agencyBreakdown: {}
    }
  });
});

// @desc    Create grant report
// @route   POST /api/research/grants/:id/reports
// @access  Private (PI/Co-Investigator/Admin)
exports.createReport = asyncHandler(async (req, res, next) => {
  const grant = await Grant.findById(req.params.id);

  if (!grant) {
    return next(new AppError('Grant not found', 404));
  }

  // Check authorization
  const isAuthorized = 
    grant.principalInvestigator.equals(req.user._id) ||
    grant.coInvestigators.some(ci => ci.user.equals(req.user._id)) ||
    req.user.role === 'admin' ||
    req.user.role === 'super_admin';

  if (!isAuthorized) {
    return next(new AppError('Not authorized to create reports for this grant', 403));
  }

  // Add report to timeline
  if (!grant.timeline.reportingDates) {
    grant.timeline.reportingDates = [];
  }

  const report = {
    reportType: req.body.reportType,
    periodStart: req.body.periodStart,
    periodEnd: req.body.periodEnd,
    summary: req.body.summary,
    achievements: req.body.achievements,
    challenges: req.body.challenges,
    nextSteps: req.body.nextSteps,
    budgetUtilization: req.body.budgetUtilization,
    submittedBy: req.user._id,
    submittedAt: new Date()
  };

  grant.timeline.reportingDates.push(report);
  await grant.save();

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully',
    data: report
  });
});