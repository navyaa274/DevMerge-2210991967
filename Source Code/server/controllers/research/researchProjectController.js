const ResearchProject = require('../../models/research/ResearchProject');
const Publication = require('../../models/research/Publication');
const asyncHandler = require('../../errors/asyncHandler');
const AppError = require('../../errors/AppError');

// @desc    Get all research projects
// @route   GET /api/research/projects
// @access  Public/Private based on visibility
exports.getAllProjects = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    department, 
    researchArea,
    faculty,
    search,
    sort = '-createdAt'
  } = req.query;

  // Build query
  const query = {};

  // Visibility filter
  if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
    // Admins can see all projects
  } else if (req.user) {
    // Regular users can see public and department projects they're involved in
    query.$or = [
      { visibility: 'Public' },
      { 
        visibility: 'Department Only',
        department: req.user.department 
      },
      { facultyLead: req.user._id },
      { coInvestigators: req.user._id },
      { 'studentResearchers.student': req.user._id }
    ];
  } else {
    // Public users can only see public projects
    query.visibility = 'Public';
  }

  // Apply filters
  if (status) query.status = status;
  if (department) query.department = department;
  if (researchArea) query.researchArea = researchArea;
  if (faculty) query.facultyLead = faculty;

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  // Execute query with pagination
  const projects = await ResearchProject.find(query)
    .populate('facultyLead', 'firstName lastName email avatar')
    .populate('coInvestigators', 'firstName lastName email')
    .populate('department', 'name code')
    .populate('studentResearchers.student', 'firstName lastName studentId')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Get total count for pagination
  const total = await ResearchProject.countDocuments(query);

  res.status(200).json({
    success: true,
    count: projects.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: projects
  });
});

// @desc    Get single research project
// @route   GET /api/research/projects/:id
// @access  Public/Private based on visibility
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await ResearchProject.findById(req.params.id)
    .populate('facultyLead', 'firstName lastName email avatar designation department')
    .populate('coInvestigators', 'firstName lastName email designation department')
    .populate('department', 'name code hod')
    .populate('studentResearchers.student', 'firstName lastName studentId email program')
    .populate('publications', 'title publicationType publicationDate doi metrics.citations');

  if (!project) {
    return next(new AppError('Research project not found', 404));
  }

  // Check visibility
  if (project.visibility === 'Private' && 
      !project.isUserInvolved(req.user?._id) && 
      !['admin', 'super_admin'].includes(req.user?.role)) {
    return next(new AppError('Not authorized to access this project', 403));
  }

  if (project.visibility === 'Department Only' && 
      !project.department._id.equals(req.user?.department) &&
      !project.isUserInvolved(req.user?._id) &&
      !['admin', 'super_admin'].includes(req.user?.role)) {
    return next(new AppError('Not authorized to access this project', 403));
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Create new research project
// @route   POST /api/research/projects
// @access  Private (Faculty/Admin)
exports.createProject = asyncHandler(async (req, res, next) => {
  // Only faculty and admins can create projects
  if (!['faculty', 'admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Only faculty members can create research projects', 403));
  }

  // Set faculty lead to current user if not specified
  if (!req.body.facultyLead) {
    req.body.facultyLead = req.user._id;
  }

  // Ensure current user is either faculty lead or admin
  if (!req.body.facultyLead.equals(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You can only create projects where you are the faculty lead', 403));
  }

  const project = await ResearchProject.create(req.body);

  res.status(201).json({
    success: true,
    message: 'Research project created successfully',
    data: project
  });
});

// @desc    Update research project
// @route   PUT /api/research/projects/:id
// @access  Private (Project members/Admin)
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await ResearchProject.findById(req.params.id);

  if (!project) {
    return next(new AppError('Research project not found', 404));
  }

  // Check authorization
  if (!project.isUserInvolved(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to update this project', 403));
  }

  // Faculty can only update their own projects unless admin
  if (project.facultyLead.toString() !== req.user._id.toString() && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Only the faculty lead or admin can update this project', 403));
  }

  // Update project
  project = await ResearchProject.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('facultyLead', 'firstName lastName email');

  res.status(200).json({
    success: true,
    message: 'Research project updated successfully',
    data: project
  });
});

// @desc    Delete research project
// @route   DELETE /api/research/projects/:id
// @access  Private (Faculty lead/Admin)
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await ResearchProject.findById(req.params.id);

  if (!project) {
    return next(new AppError('Research project not found', 404));
  }

  // Check authorization
  if (project.facultyLead.toString() !== req.user._id.toString() && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to delete this project', 403));
  }

  // Check if project has publications
  const publicationCount = await Publication.countDocuments({ projects: project._id });
  if (publicationCount > 0) {
    return next(new AppError('Cannot delete project with associated publications. Archive instead.', 400));
  }

  await project.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Research project deleted successfully'
  });
});

// @desc    Get project statistics
// @route   GET /api/research/projects/stats
// @access  Private (Admin/Department)
exports.getProjectStats = asyncHandler(async (req, res, next) => {
  const { department } = req.query;
  
  const matchStage = {};
  
  // Filter by department if specified
  if (department) {
    matchStage.department = department;
  } else if (req.user?.department && !['admin', 'super_admin'].includes(req.user.role)) {
    // Regular users see only their department stats
    matchStage.department = req.user.department;
  }

  const stats = await ResearchProject.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalProjects: { $sum: 1 },
        activeProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
        },
        completedProjects: {
          $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
        },
        totalFunding: { $sum: '$funding.amount' },
        avgProjectDuration: { $avg: '$duration' },
        byResearchArea: {
          $push: {
            area: '$researchArea',
            count: 1
          }
        },
        byStatus: {
          $push: {
            status: '$status',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        totalProjects: 1,
        activeProjects: 1,
        completedProjects: 1,
        totalFunding: { $ifNull: ['$totalFunding', 0] },
        avgProjectDuration: { $ifNull: ['$avgProjectDuration', 0] },
        researchAreas: {
          $reduce: {
            input: '$byResearchArea',
            initialValue: [],
            in: {
              $concatArrays: [
                '$$value',
                [
                  {
                    $mergeObjects: [
                      '$$this',
                      {
                        count: {
                          $sum: [
                            { $arrayElemAt: ['$$value.count', { $indexOfArray: ['$$value.area', '$$this.area'] }] },
                            1
                          ]
                        }
                      }
                    ]
                  }
                ]
              ]
            }
          }
        },
        statusBreakdown: {
          $reduce: {
            input: '$byStatus',
            initialValue: [],
            in: {
              $concatArrays: [
                '$$value',
                [
                  {
                    $mergeObjects: [
                      '$$this',
                      {
                        count: {
                          $sum: [
                            { $arrayElemAt: ['$$value.count', { $indexOfArray: ['$$value.status', '$$this.status'] }] },
                            1
                          ]
                        }
                      }
                    ]
                  }
                ]
              ]
            }
          }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalProjects: 0,
      activeProjects: 0,
      completedProjects: 0,
      totalFunding: 0,
      avgProjectDuration: 0,
      researchAreas: [],
      statusBreakdown: []
    }
  });
});

// @desc    Add student researcher to project
// @route   POST /api/research/projects/:id/students
// @access  Private (Faculty lead/Admin)
exports.addStudentResearcher = asyncHandler(async (req, res, next) => {
  const project = await ResearchProject.findById(req.params.id);

  if (!project) {
    return next(new AppError('Research project not found', 404));
  }

  // Check authorization
  if (project.facultyLead.toString() !== req.user._id.toString() && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Only faculty lead or admin can add student researchers', 403));
  }

  const { student, role, startDate } = req.body;

  // Check if student is already in project
  const existingStudent = project.studentResearchers.find(
    sr => sr.student.toString() === student
  );

  if (existingStudent) {
    return next(new AppError('Student is already a researcher in this project', 400));
  }

  project.studentResearchers.push({
    student,
    role: role || 'Undergraduate Researcher',
    startDate: startDate || new Date()
  });

  await project.save();

  res.status(200).json({
    success: true,
    message: 'Student researcher added successfully',
    data: project
  });
});

// @desc    Update project milestone
// @route   PUT /api/research/projects/:id/milestones/:milestoneId
// @access  Private (Project members/Admin)
exports.updateMilestone = asyncHandler(async (req, res, next) => {
  const project = await ResearchProject.findById(req.params.id);

  if (!project) {
    return next(new AppError('Research project not found', 404));
  }

  // Check authorization
  if (!project.isUserInvolved(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to update milestones', 403));
  }

  const milestoneIndex = project.timeline.milestones.findIndex(
    m => m._id.toString() === req.params.milestoneId
  );

  if (milestoneIndex === -1) {
    return next(new AppError('Milestone not found', 404));
  }

  // Update milestone
  Object.assign(project.timeline.milestones[milestoneIndex], req.body);
  await project.save();

  res.status(200).json({
    success: true,
    message: 'Milestone updated successfully',
    data: project.timeline.milestones[milestoneIndex]
  });
});