const Joi = require('joi');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const objectId = Joi.string().custom((value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

// Research Project Validators
exports.createProject = {
  body: Joi.object({
    title: Joi.string().required().max(200).trim(),
    description: Joi.string().required().trim(),
    abstract: Joi.string().trim(),
    facultyLead: objectId,
    coInvestigators: Joi.array().items(objectId),
    department: objectId.required(),
    researchArea: Joi.string().required().valid(
      'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry',
      'Biology', 'Medicine', 'Psychology', 'Sociology', 'Economics',
      'Business', 'Education', 'Arts', 'Humanities', 'Interdisciplinary'
    ),
    subAreas: Joi.array().items(Joi.string().trim()),
    funding: Joi.object({
      grantNumber: Joi.string().trim(),
      fundingAgency: Joi.string().trim(),
      amount: Joi.number().min(0),
      currency: Joi.string().default('USD'),
      startDate: Joi.date(),
      endDate: Joi.date(),
      status: Joi.string().valid('Applied', 'Awarded', 'In Progress', 'Completed', 'Terminated')
    }),
    timeline: Joi.object({
      startDate: Joi.date().required(),
      expectedEndDate: Joi.date(),
      milestones: Joi.array().items(
        Joi.object({
          title: Joi.string().required(),
          description: Joi.string(),
          dueDate: Joi.date().required(),
          status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Delayed')
        })
      )
    }),
    status: Joi.string().valid('Planning', 'Active', 'On Hold', 'Completed', 'Archived'),
    visibility: Joi.string().valid('Public', 'Department Only', 'Private'),
    tags: Joi.array().items(Joi.string().trim())
  })
};

exports.updateProject = {
  body: Joi.object({
    title: Joi.string().max(200).trim(),
    description: Joi.string().trim(),
    abstract: Joi.string().trim(),
    coInvestigators: Joi.array().items(objectId),
    researchArea: Joi.string().valid(
      'Computer Science', 'Engineering', 'Mathematics', 'Physics', 'Chemistry',
      'Biology', 'Medicine', 'Psychology', 'Sociology', 'Economics',
      'Business', 'Education', 'Arts', 'Humanities', 'Interdisciplinary'
    ),
    subAreas: Joi.array().items(Joi.string().trim()),
    funding: Joi.object({
      grantNumber: Joi.string().trim(),
      fundingAgency: Joi.string().trim(),
      amount: Joi.number().min(0),
      currency: Joi.string(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      status: Joi.string().valid('Applied', 'Awarded', 'In Progress', 'Completed', 'Terminated')
    }),
    timeline: Joi.object({
      startDate: Joi.date(),
      expectedEndDate: Joi.date(),
      actualEndDate: Joi.date(),
      milestones: Joi.array().items(
        Joi.object({
          title: Joi.string(),
          description: Joi.string(),
          dueDate: Joi.date(),
          completedDate: Joi.date(),
          status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Delayed')
        })
      )
    }),
    status: Joi.string().valid('Planning', 'Active', 'On Hold', 'Completed', 'Archived'),
    visibility: Joi.string().valid('Public', 'Department Only', 'Private'),
    tags: Joi.array().items(Joi.string().trim())
  }).min(1) // At least one field must be provided
};

exports.addStudentResearcher = {
  body: Joi.object({
    student: objectId.required(),
    role: Joi.string().valid(
      'Undergraduate Researcher',
      'Graduate Researcher',
      'Research Assistant',
      'PhD Candidate'
    ),
    startDate: Joi.date().default(Date.now)
  })
};

exports.updateMilestone = {
  body: Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    dueDate: Joi.date(),
    completedDate: Joi.date(),
    status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Delayed')
  }).min(1)
};

// Publication Validators
exports.createPublication = {
  body: Joi.object({
    title: Joi.string().required().max(500).trim(),
    abstract: Joi.string().trim(),
    authors: Joi.array().items(
      Joi.object({
        user: objectId,
        name: Joi.string().required(),
        email: Joi.string().email(),
        affiliation: Joi.string(),
        isCorrespondingAuthor: Joi.boolean().default(false),
        order: Joi.number().required().min(1)
      })
    ).min(1),
    publicationType: Joi.string().required().valid(
      'Journal Article', 'Conference Paper', 'Book Chapter', 'Book',
      'Technical Report', 'Thesis', 'Dissertation', 'Preprint',
      'Working Paper', 'Patent', 'Software', 'Dataset'
    ),
    journal: Joi.object({
      name: Joi.string().required(),
      volume: Joi.string(),
      issue: Joi.string(),
      pages: Joi.string(),
      issn: Joi.string(),
      publisher: Joi.string(),
      impactFactor: Joi.number().min(0),
      quartile: Joi.string().valid('Q1', 'Q2', 'Q3', 'Q4', null)
    }).when('publicationType', {
      is: 'Journal Article',
      then: Joi.object({
        name: Joi.string().required(),
        volume: Joi.string(),
        issue: Joi.string(),
        pages: Joi.string()
      }).required()
    }),
    conference: Joi.object({
      name: Joi.string(),
      location: Joi.string(),
      date: Joi.date(),
      proceedings: Joi.string(),
      isbn: Joi.string()
    }).when('publicationType', {
      is: 'Conference Paper',
      then: Joi.object({
        name: Joi.string().required(),
        date: Joi.date()
      }).required()
    }),
    doi: Joi.string().trim(),
    arxivId: Joi.string().trim(),
    pmid: Joi.string().trim(),
    url: Joi.string().uri().trim(),
    publicationDate: Joi.date().required(),
    submissionDate: Joi.date(),
    acceptanceDate: Joi.date(),
    keywords: Joi.array().items(Joi.string().trim()),
    researchAreas: Joi.array().items(Joi.string().trim()),
    projects: Joi.array().items(objectId),
    departments: Joi.array().items(objectId),
    funding: Joi.array().items(
      Joi.object({
        grantNumber: Joi.string(),
        agency: Joi.string(),
        acknowledgment: Joi.string()
      })
    ),
    license: Joi.string().valid(
      'CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-NC-SA',
      'CC BY-ND', 'CC BY-NC-ND', 'All Rights Reserved', 'Public Domain'
    ),
    status: Joi.string().valid('Draft', 'Submitted', 'Under Review', 'Accepted', 'Published', 'Retracted'),
    visibility: Joi.string().valid('Public', 'Institutional', 'Private')
  })
};

exports.updatePublication = {
  body: Joi.object({
    title: Joi.string().max(500).trim(),
    abstract: Joi.string().trim(),
    authors: Joi.array().items(
      Joi.object({
        user: objectId,
        name: Joi.string(),
        email: Joi.string().email(),
        affiliation: Joi.string(),
        isCorrespondingAuthor: Joi.boolean(),
        order: Joi.number().min(1)
      })
    ),
    publicationType: Joi.string().valid(
      'Journal Article', 'Conference Paper', 'Book Chapter', 'Book',
      'Technical Report', 'Thesis', 'Dissertation', 'Preprint',
      'Working Paper', 'Patent', 'Software', 'Dataset'
    ),
    journal: Joi.object({
      name: Joi.string(),
      volume: Joi.string(),
      issue: Joi.string(),
      pages: Joi.string(),
      issn: Joi.string(),
      publisher: Joi.string(),
      impactFactor: Joi.number().min(0),
      quartile: Joi.string().valid('Q1', 'Q2', 'Q3', 'Q4', null)
    }),
    conference: Joi.object({
      name: Joi.string(),
      location: Joi.string(),
      date: Joi.date(),
      proceedings: Joi.string(),
      isbn: Joi.string()
    }),
    doi: Joi.string().trim(),
    arxivId: Joi.string().trim(),
    pmid: Joi.string().trim(),
    url: Joi.string().uri().trim(),
    publicationDate: Joi.date(),
    keywords: Joi.array().items(Joi.string().trim()),
    researchAreas: Joi.array().items(Joi.string().trim()),
    projects: Joi.array().items(objectId),
    departments: Joi.array().items(objectId),
    license: Joi.string().valid(
      'CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-NC-SA',
      'CC BY-ND', 'CC BY-NC-ND', 'All Rights Reserved', 'Public Domain'
    ),
    status: Joi.string().valid('Draft', 'Submitted', 'Under Review', 'Accepted', 'Published', 'Retracted'),
    visibility: Joi.string().valid('Public', 'Institutional', 'Private')
  }).min(1)
};

exports.addAuthor = {
  body: Joi.object({
    user: objectId,
    name: Joi.string().required(),
    email: Joi.string().email(),
    affiliation: Joi.string(),
    isCorrespondingAuthor: Joi.boolean().default(false),
    order: Joi.number().required().min(1)
  })
};

// Conference Validators
exports.createConference = {
  body: Joi.object({
    name: Joi.string().required().max(200).trim(),
    acronym: Joi.string().trim().uppercase(),
    description: Joi.string().trim(),
    location: Joi.object({
      city: Joi.string().required(),
      country: Joi.string().required(),
      venue: Joi.string(),
      address: Joi.string()
    }),
    dates: Joi.object({
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      abstractDeadline: Joi.date(),
      submissionDeadline: Joi.date(),
      notificationDate: Joi.date(),
      cameraReadyDeadline: Joi.date()
    }),
    website: Joi.string().uri().trim(),
    submissionTypes: Joi.array().items(
      Joi.string().valid('Full Paper', 'Short Paper', 'Poster', 'Demo', 'Workshop', 'Tutorial')
    ),
    topics: Joi.array().items(Joi.string().trim()),
    submissionGuidelines: Joi.object({
      maxPages: Joi.number().min(1),
      format: Joi.string(),
      template: Joi.string(),
      fileTypes: Joi.array().items(Joi.string()),
      maxFileSize: Joi.number().min(0)
    }),
    reviewProcess: Joi.object({
      type: Joi.string().valid('Single-blind', 'Double-blind', 'Open'),
      reviewCriteria: Joi.array().items(Joi.string())
    }),
    registration: Joi.object({
      earlyBirdDeadline: Joi.date(),
      earlyBirdFee: Joi.number().min(0),
      regularFee: Joi.number().min(0),
      studentFee: Joi.number().min(0)
    }),
    status: Joi.string().valid('Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'),
    visibility: Joi.string().valid('Public', 'Private', 'Invite-only')
  })
};

exports.updateConference = {
  body: Joi.object({
    name: Joi.string().max(200).trim(),
    acronym: Joi.string().trim().uppercase(),
    description: Joi.string().trim(),
    location: Joi.object({
      city: Joi.string(),
      country: Joi.string(),
      venue: Joi.string(),
      address: Joi.string()
    }),
    dates: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date(),
      abstractDeadline: Joi.date(),
      submissionDeadline: Joi.date(),
      notificationDate: Joi.date(),
      cameraReadyDeadline: Joi.date()
    }),
    website: Joi.string().uri().trim(),
    submissionTypes: Joi.array().items(
      Joi.string().valid('Full Paper', 'Short Paper', 'Poster', 'Demo', 'Workshop', 'Tutorial')
    ),
    topics: Joi.array().items(Joi.string().trim()),
    status: Joi.string().valid('Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'),
    visibility: Joi.string().valid('Public', 'Private', 'Invite-only')
  }).min(1)
};

exports.createSubmission = {
  body: Joi.object({
    title: Joi.string().required().max(300).trim(),
    abstract: Joi.string().required().trim(),
    authors: Joi.array().items(
      Joi.object({
        user: objectId,
        name: Joi.string().required(),
        email: Joi.string().email(),
        affiliation: Joi.string(),
        isCorrespondingAuthor: Joi.boolean().default(false),
        order: Joi.number().required().min(1)
      })
    ).min(1),
    submissionType: Joi.string().required().valid('Full Paper', 'Short Paper', 'Poster', 'Demo', 'Workshop', 'Tutorial'),
    keywords: Joi.array().items(Joi.string().trim()),
    topics: Joi.array().items(Joi.string().trim())
  })
};

// Grant Validators
exports.createGrant = {
  body: Joi.object({
    title: Joi.string().required().max(300).trim(),
    description: Joi.string().required().trim(),
    grantNumber: Joi.string().trim(),
    fundingAgency: Joi.string().required().trim(),
    agencyType: Joi.string().valid(
      'Government', 'Foundation', 'Corporate', 'International',
      'University', 'Non-profit', 'Other'
    ),
    program: Joi.string().trim(),
    principalInvestigator: objectId,
    coInvestigators: Joi.array().items(
      Joi.object({
        user: objectId,
        name: Joi.string(),
        role: Joi.string(),
        allocation: Joi.number().min(0).max(100),
        institution: Joi.string()
      })
    ),
    department: objectId.required(),
    researchAreas: Joi.array().items(Joi.string().trim()),
    keywords: Joi.array().items(Joi.string().trim()),
    budget: Joi.object({
      totalAmount: Joi.number().required().min(0),
      currency: Joi.string().default('USD'),
      durationMonths: Joi.number().required().min(1),
      breakdown: Joi.object({
        personnel: Joi.number().min(0),
        equipment: Joi.number().min(0),
        travel: Joi.number().min(0),
        materials: Joi.number().min(0),
        indirectCosts: Joi.number().min(0),
        other: Joi.number().min(0)
      })
    }),
    timeline: Joi.object({
      submissionDate: Joi.date().required(),
      startDate: Joi.date().required(),
      endDate: Joi.date().required(),
      milestones: Joi.array().items(
        Joi.object({
          description: Joi.string().required(),
          dueDate: Joi.date().required(),
          status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Delayed')
        })
      )
    }),
    status: Joi.string().valid(
      'Draft', 'Submitted', 'Under Review', 'Awarded', 'Active',
      'Completed', 'Terminated', 'Rejected', 'Withdrawn'
    ),
    compliance: Joi.object({
      ethicsApproval: Joi.object({
        required: Joi.boolean(),
        approvalNumber: Joi.string()
      }),
      dataManagementPlan: Joi.object({
        required: Joi.boolean()
      })
    })
  })
};

exports.updateGrant = {
  body: Joi.object({
    title: Joi.string().max(300).trim(),
    description: Joi.string().trim(),
    grantNumber: Joi.string().trim(),
    fundingAgency: Joi.string().trim(),
    agencyType: Joi.string().valid(
      'Government', 'Foundation', 'Corporate', 'International',
      'University', 'Non-profit', 'Other'
    ),
    researchAreas: Joi.array().items(Joi.string().trim()),
    keywords: Joi.array().items(Joi.string().trim()),
    budget: Joi.object({
      totalAmount: Joi.number().min(0),
      currency: Joi.string(),
      durationMonths: Joi.number().min(1),
      breakdown: Joi.object({
        personnel: Joi.number().min(0),
        equipment: Joi.number().min(0),
        travel: Joi.number().min(0),
        materials: Joi.number().min(0),
        indirectCosts: Joi.number().min(0),
        other: Joi.number().min(0)
      })
    }),
    timeline: Joi.object({
      submissionDate: Joi.date(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      milestones: Joi.array().items(
        Joi.object({
          description: Joi.string(),
          dueDate: Joi.date(),
          completedDate: Joi.date(),
          status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Delayed')
        })
      )
    }),
    status: Joi.string().valid(
      'Draft', 'Submitted', 'Under Review', 'Awarded', 'Active',
      'Completed', 'Terminated', 'Rejected', 'Withdrawn'
    ),
    deliverables: Joi.array().items(
      Joi.object({
        type: Joi.string().valid('Publication', 'Report', 'Software', 'Dataset', 'Prototype', 'Training'),
        description: Joi.string(),
        dueDate: Joi.date(),
        status: Joi.string().valid('Pending', 'In Progress', 'Completed', 'Delayed')
      })
    )
  }).min(1)
};

exports.createReport = {
  body: Joi.object({
    reportType: Joi.string().required().valid('Progress', 'Final', 'Financial', 'Technical'),
    periodStart: Joi.date().required(),
    periodEnd: Joi.date().required(),
    summary: Joi.string().required(),
    achievements: Joi.array().items(Joi.string()),
    challenges: Joi.array().items(Joi.string()),
    nextSteps: Joi.array().items(Joi.string()),
    budgetUtilization: Joi.number().min(0).max(100),
    attachments: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        type: Joi.string().valid('Document', 'Spreadsheet', 'Presentation', 'Other'),
        size: Joi.number().min(0)
      })
    )
  })
};

// Export all validators
module.exports = exports;