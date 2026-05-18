const Publication = require('../../models/research/Publication');
const ResearchProject = require('../../models/research/ResearchProject');
const asyncHandler = require('../../errors/asyncHandler');
const AppError = require('../../errors/AppError');

// @desc    Get all publications
// @route   GET /api/research/publications
// @access  Public/Private based on visibility
exports.getAllPublications = asyncHandler(async (req, res, next) => {
  const { 
    page = 1, 
    limit = 10, 
    type, 
    year, 
    department,
    author,
    search,
    sort = '-publicationDate'
  } = req.query;

  // Build query
  const query = {};

  // Visibility filter
  if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
    // Admins can see all publications
  } else if (req.user) {
    // Regular users can see public and institutional publications
    // or publications where they are authors
    query.$or = [
      { visibility: 'Public' },
      { visibility: 'Institutional' },
      { 'authors.user': req.user._id }
    ];
  } else {
    // Public users can only see public publications
    query.visibility = 'Public';
  }

  // Apply filters
  if (type) query.publicationType = type;
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query.publicationDate = { $gte: startDate, $lte: endDate };
  }
  if (department) query.departments = department;
  if (author) query['authors.user'] = author;

  // Search
  if (search) {
    query.$text = { $search: search };
  }

  // Execute query with pagination
  const publications = await Publication.find(query)
    .populate('authors.user', 'firstName lastName email avatar')
    .populate('departments', 'name code')
    .populate('projects', 'title')
    .sort(sort)
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Get total count for pagination
  const total = await Publication.countDocuments(query);

  res.status(200).json({
    success: true,
    count: publications.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: publications
  });
});

// @desc    Get single publication
// @route   GET /api/research/publications/:id
// @access  Public/Private based on visibility
exports.getPublication = asyncHandler(async (req, res, next) => {
  const publication = await Publication.findById(req.params.id)
    .populate('authors.user', 'firstName lastName email avatar designation department')
    .populate('departments', 'name code')
    .populate('projects', 'title description researchArea');

  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Check visibility
  if (publication.visibility === 'Private' && 
      !publication.isAuthor(req.user?._id) && 
      !['admin', 'super_admin'].includes(req.user?.role)) {
    return next(new AppError('Not authorized to access this publication', 403));
  }

  if (publication.visibility === 'Institutional' && 
      !req.user && 
      !publication.isAuthor(req.user?._id) &&
      !['admin', 'super_admin'].includes(req.user?.role)) {
    return next(new AppError('Not authorized to access this publication', 403));
  }

  res.status(200).json({
    success: true,
    data: publication
  });
});

// @desc    Create new publication
// @route   POST /api/research/publications
// @access  Private (Faculty/Student/Admin)
exports.createPublication = asyncHandler(async (req, res, next) => {
  // Check if user is author
  const isAuthor = req.body.authors?.some(author => 
    author.user && author.user.toString() === req.user._id.toString()
  );

  if (!isAuthor && !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('You must be listed as an author to create a publication', 403));
  }

  const publication = await Publication.create(req.body);

  // Link publication to projects if specified
  if (req.body.projects && req.body.projects.length > 0) {
    await ResearchProject.updateMany(
      { _id: { $in: req.body.projects } },
      { $addToSet: { publications: publication._id } }
    );
  }

  res.status(201).json({
    success: true,
    message: 'Publication created successfully',
    data: publication
  });
});

// @desc    Update publication
// @route   PUT /api/research/publications/:id
// @access  Private (Authors/Admin)
exports.updatePublication = asyncHandler(async (req, res, next) => {
  let publication = await Publication.findById(req.params.id);

  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Check authorization
  if (!publication.isAuthor(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to update this publication', 403));
  }

  // Update publication
  publication = await Publication.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('authors.user', 'firstName lastName email');

  res.status(200).json({
    success: true,
    message: 'Publication updated successfully',
    data: publication
  });
});

// @desc    Delete publication
// @route   DELETE /api/research/publications/:id
// @access  Private (Authors/Admin)
exports.deletePublication = asyncHandler(async (req, res, next) => {
  const publication = await Publication.findById(req.params.id);

  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Check authorization
  if (!publication.isAuthor(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to delete this publication', 403));
  }

  // Remove publication from projects
  await ResearchProject.updateMany(
    { publications: publication._id },
    { $pull: { publications: publication._id } }
  );

  await publication.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Publication deleted successfully'
  });
});

// @desc    Add citation to publication
// @route   POST /api/research/publications/:id/cite
// @access  Private
exports.addCitation = asyncHandler(async (req, res, next) => {
  const publication = await Publication.findById(req.params.id);

  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Check visibility
  if (publication.visibility === 'Private' && 
      !publication.isAuthor(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to cite this publication', 403));
  }

  await publication.addCitation();

  res.status(200).json({
    success: true,
    message: 'Citation added successfully',
    data: {
      citations: publication.metrics.citations
    }
  });
});

// @desc    Add author to publication
// @route   POST /api/research/publications/:id/authors
// @access  Private (Existing authors/Admin)
exports.addAuthor = asyncHandler(async (req, res, next) => {
  const publication = await Publication.findById(req.params.id);

  if (!publication) {
    return next(new AppError('Publication not found', 404));
  }

  // Check authorization
  if (!publication.isAuthor(req.user._id) && 
      !['admin', 'super_admin'].includes(req.user.role)) {
    return next(new AppError('Not authorized to add authors to this publication', 403));
  }

  const { user, name, email, affiliation, isCorrespondingAuthor, order } = req.body;

  // Check if author already exists
  const existingAuthor = publication.authors.find(a => 
    (a.user && a.user.toString() === user) || 
    a.email === email
  );

  if (existingAuthor) {
    return next(new AppError('Author already exists in this publication', 400));
  }

  publication.authors.push({
    user,
    name,
    email,
    affiliation,
    isCorrespondingAuthor,
    order
  });

  // Sort authors by order
  publication.authors.sort((a, b) => a.order - b.order);

  await publication.save();

  res.status(200).json({
    success: true,
    message: 'Author added successfully',
    data: publication
  });
});

// @desc    Get publication statistics
// @route   GET /api/research/publications/stats
// @access  Private (Admin/Department)
exports.getPublicationStats = asyncHandler(async (req, res, next) => {
  const { department, year } = req.query;
  
  const matchStage = {};
  
  // Filter by department if specified
  if (department) {
    matchStage.departments = department;
  } else if (req.user?.department && !['admin', 'super_admin'].includes(req.user.role)) {
    // Regular users see only their department stats
    matchStage.departments = req.user.department;
  }

  // Filter by year if specified
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    matchStage.publicationDate = { $gte: startDate, $lte: endDate };
  }

  const stats = await Publication.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalPublications: { $sum: 1 },
        journalArticles: {
          $sum: { $cond: [{ $eq: ['$publicationType', 'Journal Article'] }, 1, 0] }
        },
        conferencePapers: {
          $sum: { $cond: [{ $eq: ['$publicationType', 'Conference Paper'] }, 1, 0] }
        },
        totalCitations: { $sum: '$metrics.citations' },
        avgCitations: { $avg: '$metrics.citations' },
        byPublicationType: {
          $push: {
            type: '$publicationType',
            count: 1,
            citations: '$metrics.citations'
          }
        },
        byYear: {
          $push: {
            year: { $year: '$publicationDate' },
            count: 1
          }
        },
        topPublications: {
          $push: {
            title: '$title',
            citations: '$metrics.citations',
            publicationDate: '$publicationDate'
          }
        }
      }
    },
    {
      $project: {
        totalPublications: 1,
        journalArticles: 1,
        conferencePapers: 1,
        totalCitations: 1,
        avgCitations: { $round: ['$avgCitations', 2] },
        publicationTypes: {
          $reduce: {
            input: '$byPublicationType',
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
                            { $arrayElemAt: ['$$value.count', { $indexOfArray: ['$$value.type', '$$this.type'] }] },
                            1
                          ]
                        },
                        totalCitations: {
                          $sum: [
                            { $arrayElemAt: ['$$value.citations', { $indexOfArray: ['$$value.type', '$$this.type'] }] },
                            '$$this.citations'
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
        yearlyTrend: {
          $reduce: {
            input: '$byYear',
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
                            { $arrayElemAt: ['$$value.count', { $indexOfArray: ['$$value.year', '$$this.year'] }] },
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
        topPublications: {
          $slice: [
            {
              $sortArray: {
                input: '$topPublications',
                sortBy: { citations: -1 }
              }
            },
            10
          ]
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || {
      totalPublications: 0,
      journalArticles: 0,
      conferencePapers: 0,
      totalCitations: 0,
      avgCitations: 0,
      publicationTypes: [],
      yearlyTrend: [],
      topPublications: []
    }
  });
});