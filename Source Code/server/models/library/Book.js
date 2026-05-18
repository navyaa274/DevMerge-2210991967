const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [500, 'Title cannot exceed 500 characters']
  },
  subtitle: {
    type: String,
    trim: true
  },
  authors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['Author', 'Editor', 'Translator', 'Contributor'],
      default: 'Author'
    }
  }],
  isbn: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  isbn13: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  publisher: {
    type: String,
    trim: true
  },
  publicationYear: {
    type: Number,
    min: [1000, 'Invalid publication year'],
    max: [new Date().getFullYear() + 1, 'Invalid publication year']
  },
  edition: {
    type: String,
    trim: true
  },
  language: {
    type: String,
    default: 'English',
    trim: true
  },
  subjects: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  description: {
    type: String,
    trim: true
  },
  tableOfContents: {
    type: String,
    trim: true
  },
  pageCount: {
    type: Number,
    min: [1, 'Page count must be at least 1']
  },
  format: {
    type: String,
    enum: ['Hardcover', 'Paperback', 'E-book', 'Audiobook', 'PDF', 'EPUB', 'MOBI'],
    default: 'E-book'
  },
  coverImage: {
    type: String,
    trim: true
  },
  files: [{
    format: {
      type: String,
      enum: ['PDF', 'EPUB', 'MOBI', 'DOC', 'DOCX', 'TXT', 'Other'],
      required: true
    },
    size: {
      type: Number,
      required: true,
      min: [0, 'File size must be positive']
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    accessLevel: {
      type: String,
      enum: ['Public', 'Institutional', 'Restricted'],
      default: 'Institutional'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  metadata: {
    doi: String,
    oclc: String,
    lccn: String,
    dewey: String,
    googleBooksId: String,
    openLibraryId: String
  },
  licenses: [{
    type: {
      type: String,
      enum: ['CC BY', 'CC BY-SA', 'CC BY-NC', 'CC BY-NC-SA', 'CC BY-ND', 'CC BY-NC-ND', 'All Rights Reserved', 'Public Domain'],
      default: 'All Rights Reserved'
    },
    description: String,
    url: String
  }],
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    citations: {
      type: Number,
      default: 0
    },
    ratings: {
      average: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  availability: {
    totalCopies: {
      type: Number,
      default: 1,
      min: [0, 'Total copies cannot be negative']
    },
    availableCopies: {
      type: Number,
      default: 1,
      min: [0, 'Available copies cannot be negative']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    reservationQueue: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      requestedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['Waiting', 'Notified', 'Cancelled'],
        default: 'Waiting'
      }
    }]
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived', 'Removed'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
bookSchema.index({ title: 'text', description: 'text', authors: 'text', subjects: 'text' });
bookSchema.index({ isbn: 1 }, { unique: true, sparse: true });
bookSchema.index({ isbn13: 1 }, { unique: true, sparse: true });
bookSchema.index({ publicationYear: -1 });
bookSchema.index({ 'metrics.downloads': -1 });
bookSchema.index({ 'availability.isAvailable': 1 });

// Virtual for author names
bookSchema.virtual('authorNames').get(function() {
  return this.authors.map(a => a.name).join(', ');
});

// Virtual for primary author
bookSchema.virtual('primaryAuthor').get(function() {
  return this.authors.length > 0 ? this.authors[0].name : 'Unknown';
});

// Pre-save middleware
bookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update availability
  if (this.availability) {
    this.availability.isAvailable = this.availability.availableCopies > 0;
  }
  
  next();
});

// Static methods
bookSchema.statics.findByAuthor = function(authorName) {
  return this.find({ 'authors.name': new RegExp(authorName, 'i') });
};

bookSchema.statics.findAvailable = function() {
  return this.find({ 'availability.isAvailable': true, status: 'Published' });
};

bookSchema.statics.findPopular = function(limit = 10) {
  return this.find({ status: 'Published' })
    .sort({ 'metrics.downloads': -1 })
    .limit(limit);
};

// Instance methods
bookSchema.methods.borrow = async function(userId) {
  if (this.availability.availableCopies <= 0) {
    throw new Error('No copies available for borrowing');
  }
  
  this.availability.availableCopies -= 1;
  this.availability.isAvailable = this.availability.availableCopies > 0;
  
  // Remove from reservation queue if user was waiting
  const reservationIndex = this.availability.reservationQueue.findIndex(
    r => r.user.toString() === userId.toString() && r.status === 'Waiting'
  );
  
  if (reservationIndex !== -1) {
    this.availability.reservationQueue[reservationIndex].status = 'Notified';
  }
  
  await this.save();
  return this;
};

bookSchema.methods.return = async function() {
  if (this.availability.availableCopies >= this.availability.totalCopies) {
    throw new Error('All copies are already available');
  }
  
  this.availability.availableCopies += 1;
  this.availability.isAvailable = true;
  await this.save();
  return this;
};

bookSchema.methods.reserve = async function(userId) {
  // Check if user already has a reservation
  const existingReservation = this.availability.reservationQueue.find(
    r => r.user.toString() === userId.toString() && r.status === 'Waiting'
  );
  
  if (existingReservation) {
    throw new Error('User already has a reservation for this book');
  }
  
  this.availability.reservationQueue.push({
    user: userId,
    requestedAt: new Date(),
    status: 'Waiting'
  });
  
  await this.save();
  return this;
};

module.exports = mongoose.model('Book', bookSchema);