const mongoose = require('mongoose');

const syllabusUnitSchema = new mongoose.Schema({
  syllabus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Syllabus',
    required: true
  },
  
  unitNumber: {
    type: Number,
    required: true,
    min: 1
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  // Topics covered in this unit
  topics: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    subtopics: [String],
    hours: Number, // Teaching hours for this topic
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium'
    },
    bloomsLevel: {
      type: String,
      enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
    },
    keywords: [String], // For RAG retrieval
    isCore: {
      type: Boolean,
      default: true
    }
  }],
  
  // Learning Outcomes for this unit
  learningOutcomes: [{
    description: String,
    bloomsLevel: {
      type: String,
      enum: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create']
    },
    coMapping: [String] // CO1, CO2, etc.
  }],
  
  // Teaching hours
  teachingHours: {
    lecture: { type: Number, default: 0 },
    tutorial: { type: Number, default: 0 },
    practical: { type: Number, default: 0 }
  },
  
  // Content details
  content: {
    theory: String, // Detailed theory content
    examples: [String],
    applications: [String],
    caseStudies: [{
      title: String,
      description: String,
      industry: String
    }]
  },
  
  // Resources for this unit
  resources: {
    textbookReferences: [{
      book: String,
      chapters: [String],
      pages: String
    }],
    videos: [{
      title: String,
      url: String,
      duration: Number // in minutes
    }],
    articles: [{
      title: String,
      url: String,
      author: String
    }],
    presentations: [{
      title: String,
      url: String
    }]
  },
  
  // Practice materials
  practiceMaterials: {
    problems: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem'
    }],
    assignments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    }],
    quizzes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz'
    }],
    labs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabManual'
    }]
  },
  
  // Assessment for this unit
  assessmentComponents: [{
    type: {
      type: String,
      enum: ['Quiz', 'Assignment', 'Lab', 'Test', 'Project', 'Presentation']
    },
    marks: Number,
    weightage: Number,
    coMapping: [String]
  }],
  
  // Prerequisites for this unit
  prerequisites: [{
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SyllabusUnit'
    },
    unitTitle: String,
    isStrict: {
      type: Boolean,
      default: false
    }
  }],
  
  // Difficulty and importance
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  
  importance: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  
  // Exam weightage
  examWeightage: {
    continuous: Number, // Percentage in continuous assessment
    endSemester: Number // Percentage in end semester exam
  },
  
  // Metadata
  order: Number, // Display order
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
syllabusUnitSchema.index({ syllabus: 1, unitNumber: 1 });
syllabusUnitSchema.index({ syllabus: 1, order: 1 });
syllabusUnitSchema.index({ 'topics.keywords': 1 }); // For RAG retrieval

// Virtual for total hours
syllabusUnitSchema.virtual('totalHours').get(function() {
  return this.teachingHours.lecture + 
         this.teachingHours.tutorial + 
         this.teachingHours.practical;
});

// Methods
syllabusUnitSchema.methods.getTopicsByDifficulty = function(difficulty) {
  return this.topics.filter(topic => topic.difficulty === difficulty);
};

syllabusUnitSchema.methods.getCoreTopics = function() {
  return this.topics.filter(topic => topic.isCore);
};

syllabusUnitSchema.methods.searchTopics = function(keyword) {
  const regex = new RegExp(keyword, 'i');
  return this.topics.filter(topic => 
    regex.test(topic.name) || 
    topic.keywords.some(kw => regex.test(kw))
  );
};

// Static methods
syllabusUnitSchema.statics.getUnitsBySyllabus = function(syllabusId) {
  return this.find({ 
    syllabus: syllabusId,
    isActive: true 
  }).sort({ order: 1, unitNumber: 1 });
};

syllabusUnitSchema.statics.searchByKeyword = function(keyword) {
  return this.find({
    'topics.keywords': { $regex: keyword, $options: 'i' },
    isActive: true
  });
};

syllabusUnitSchema.statics.getUnitsByDifficulty = function(syllabusId, difficulty) {
  return this.find({
    syllabus: syllabusId,
    difficulty: difficulty,
    isActive: true
  }).sort({ order: 1 });
};

module.exports = mongoose.model('SyllabusUnit', syllabusUnitSchema);
