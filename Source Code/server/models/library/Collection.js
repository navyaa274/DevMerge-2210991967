const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Course Reading', 'Research Topic', 'Subject Area',
      'Faculty Publications', 'Student Works', 'Reference',
      'Special Collection', 'New Arrivals', 'Popular'
    ],
    default: 'Subject Area'
  },
  subjects: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  coverImage: {
    type: String,
    trim: true
  },
  items: [{
    itemType: {
      type: String,
      enum: ['Book', 'Journal', 'Article', 'Thesis', 'Report', 'Multimedia'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'items.itemType'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String,
    order: Number
  }],
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  departments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  curators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['Primary', 'Contributor', 'Reviewer'],
      default: 'Contributor'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  accessLevel: {
    type: String,
    enum: ['Public', 'Institutional', 'Department', 'Private'],
    default: 'Institutional'
  },
  metadata: {
    createdFor: String,
    academicYear: String,
    semester: String,
    lastReviewed: Date,
    reviewSchedule: {
      type: String,
      enum: ['Monthly', 'Quarterly', 'Semesterly', 'Annually', 'Never'],
      default: 'Semesterly'
    }
  },
  metrics: {
    totalItems: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    avgRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Archived', 'Draft', 'Under Review'],
    default: 'Active'
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
collectionSchema.index({ name: 'text', description: 'text', subjects: 'text' });
collectionSchema.index({ type: 1, status: 1 });
collectionSchema.index({ 'curators.user': 1 });
collectionSchema.index({ accessLevel: 1 });
collectionSchema.index({ createdAt: -1 });

// Virtual for item count by type
collectionSchema.virtual('itemCounts').get(function() {
  if (!this.items) return {};
  
  return this.items.reduce((counts, item) => {
    counts[item.itemType] = (counts[item.itemType] || 0) + 1;
    return counts;
  }, {});
});

// Virtual for primary curator
collectionSchema.virtual('primaryCurator').get(function() {
  if (!this.curators || this.curators.length === 0) return null;
  
  const primary = this.curators.find(c => c.role === 'Primary');
  return primary || this.curators[0];
});

// Pre-save middleware
collectionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update total items count
  this.metrics.totalItems = this.items ? this.items.length : 0;
  
  // Ensure at least one primary curator if there are curators
  if (this.curators && this.curators.length > 0 && !this.curators.some(c => c.role === 'Primary')) {
    this.curators[0].role = 'Primary';
  }
  
  // Sort items by order if specified
  if (this.items) {
    this.items.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return new Date(a.addedAt) - new Date(b.addedAt);
    });
  }
  
  next();
});

// Static methods
collectionSchema.statics.findByType = function(type) {
  return this.find({ type, status: 'Active' });
};

collectionSchema.statics.findByCurator = function(userId) {
  return this.find({
    'curators.user': userId,
    status: { $in: ['Active', 'Draft'] }
  });
};

collectionSchema.statics.findPublic = function() {
  return this.find({
    accessLevel: 'Public',
    status: 'Active'
  }).sort({ 'metrics.views': -1 });
};

collectionSchema.statics.findForCourse = function(courseId) {
  return this.find({
    courses: courseId,
    status: 'Active'
  });
};

// Instance methods
collectionSchema.methods.addItem = async function(itemType, itemId, addedBy, notes, order) {
  if (!this.items) {
    this.items = [];
  }
  
  // Check if item already exists
  const existingItem = this.items.find(
    item => item.itemType === itemType && item.itemId.equals(itemId)
  );
  
  if (existingItem) {
    throw new Error('Item already exists in collection');
  }
  
  this.items.push({
    itemType,
    itemId,
    addedAt: new Date(),
    addedBy,
    notes,
    order: order || (this.items.length + 1)
  });
  
  await this.save();
  return this;
};

collectionSchema.methods.removeItem = async function(itemType, itemId) {
  if (!this.items) {
    throw new Error('No items in collection');
  }
  
  const initialLength = this.items.length;
  this.items = this.items.filter(
    item => !(item.itemType === itemType && item.itemId.equals(itemId))
  );
  
  if (this.items.length === initialLength) {
    throw new Error('Item not found in collection');
  }
  
  await this.save();
  return this;
};

collectionSchema.methods.addCurator = async function(userId, role = 'Contributor') {
  if (!this.curators) {
    this.curators = [];
  }
  
  // Check if user is already a curator
  const existingCurator = this.curators.find(c => c.user.equals(userId));
  if (existingCurator) {
    throw new Error('User is already a curator');
  }
  
  this.curators.push({
    user: userId,
    role,
    addedAt: new Date()
  });
  
  await this.save();
  return this;
};

collectionSchema.methods.recordView = async function() {
  this.metrics.views += 1;
  await this.save();
  return this;
};

collectionSchema.methods.getItemsByType = function(itemType) {
  if (!this.items) return [];
  
  return this.items
    .filter(item => item.itemType === itemType)
    .map(item => item.itemId);
};

collectionSchema.methods.getFormattedItems = async function() {
  if (!this.items || this.items.length === 0) return [];
  
  // This would populate items in a real implementation
  // For now, return basic item info
  return this.items.map(item => ({
    itemType: item.itemType,
    itemId: item.itemId,
    addedAt: item.addedAt,
    notes: item.notes,
    order: item.order
  }));
};

module.exports = mongoose.model('Collection', collectionSchema);