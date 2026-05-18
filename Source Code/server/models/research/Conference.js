const mongoose = require('mongoose');

const conferenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Conference name is required'],
    trim: true,
    maxlength: [200, 'Conference name cannot exceed 200 characters']
  },
  acronym: {
    type: String,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    city: String,
    country: String,
    venue: String,
    address: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  dates: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    abstractDeadline: Date,
    submissionDeadline: Date,
    notificationDate: Date,
    cameraReadyDeadline: Date
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+\..+$/, 'Please enter a valid URL']
  },
  submissionTypes: [{
    type: String,
    enum: ['Full Paper', 'Short Paper', 'Poster', 'Demo', 'Workshop', 'Tutorial']
  }],
  topics: [{
    type: String,
    trim: true
  }],
  importantDates: [{
    description: String,
    date: Date,
    type: {
      type: String,
      enum: ['Abstract', 'Submission', 'Review', 'Notification', 'Camera Ready', 'Conference']
    }
  }],
  organizers: [{
    name: String,
    email: String,
    affiliation: String,
    role: {
      type: String,
      enum: ['General Chair', 'Program Chair', 'Organizing Committee', 'Technical Committee']
    }
  }],
  submissionGuidelines: {
    maxPages: Number,
    format: String,
    template: String,
    fileTypes: [String],
    maxFileSize: Number,
    submissionSystem: String
  },
  reviewProcess: {
    type: {
      type: String,
      enum: ['Single-blind', 'Double-blind', 'Open'],
      default: 'Double-blind'
    },
    reviewCriteria: [String],
    acceptanceRate: Number
  },
  registration: {
    earlyBirdDeadline: Date,
    earlyBirdFee: Number,
    regularFee: Number,
    studentFee: Number,
    includes: [String],
    paymentMethods: [String]
  },
  proceedings: {
    publisher: String,
    isbn: String,
    issn: String,
    indexing: [String],
    openAccess: {
      type: Boolean,
      default: false
    },
    openAccessFee: Number
  },
  sponsors: [{
    name: String,
    level: {
      type: String,
      enum: ['Platinum', 'Gold', 'Silver', 'Bronze', 'Supporter']
    },
    logo: String,
    website: String
  }],
  socialEvents: [{
    name: String,
    description: String,
    date: Date,
    time: String,
    venue: String,
    cost: Number
  }],
  accommodation: [{
    name: String,
    address: String,
    distance: String,
    priceRange: String,
    bookingLink: String
  }],
  travelInfo: {
    nearestAirport: String,
    transportation: String,
    visaInfo: String,
    visaSupport: Boolean
  },
  contact: {
    email: String,
    phone: String,
    address: String
  },
  socialMedia: {
    twitter: String,
    linkedin: String,
    facebook: String
  },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Draft'
  },
  visibility: {
    type: String,
    enum: ['Public', 'Private', 'Invite-only'],
    default: 'Public'
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
conferenceSchema.index({ 'dates.startDate': 1 });
conferenceSchema.index({ 'dates.endDate': 1 });
conferenceSchema.index({ status: 1 });
conferenceSchema.index({ 'location.country': 1, 'location.city': 1 });

// Virtual for conference duration in days
conferenceSchema.virtual('duration').get(function() {
  if (!this.dates.startDate || !this.dates.endDate) return 0;
  const diffTime = Math.abs(this.dates.endDate - this.dates.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

// Virtual for registration status
conferenceSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (this.dates.earlyBirdDeadline && now > this.dates.earlyBirdDeadline) {
    return 'Late Registration';
  } else if (this.dates.earlyBirdDeadline && now <= this.dates.earlyBirdDeadline) {
    return 'Early Bird';
  }
  return 'Regular';
});

// Pre-save middleware
conferenceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find upcoming conferences
conferenceSchema.statics.findUpcoming = function() {
  return this.find({
    'dates.endDate': { $gte: new Date() },
    status: { $in: ['Published', 'Ongoing'] }
  }).sort({ 'dates.startDate': 1 });
};

// Static method to find conferences by location
conferenceSchema.statics.findByLocation = function(country, city) {
  const query = { status: { $in: ['Published', 'Ongoing'] }};
  
  if (country) {
    query['location.country'] = country;
  }
  if (city) {
    query['location.city'] = city;
  }
  
  return this.find(query).sort({ 'dates.startDate': 1 });
};

// Instance method to check if conference is accepting submissions
conferenceSchema.methods.isAcceptingSubmissions = function() {
  const now = new Date();
  return this.dates.submissionDeadline && now <= this.dates.submissionDeadline;
};

// Instance method to get conference status
conferenceSchema.methods.getStatus = function() {
  const now = new Date();
  
  if (this.status === 'Cancelled') return 'Cancelled';
  if (now < this.dates.startDate) return 'Upcoming';
  if (now >= this.dates.startDate && now <= this.dates.endDate) return 'Ongoing';
  if (now > this.dates.endDate) return 'Completed';
  return 'Scheduled';
};

module.exports = mongoose.model('Conference', conferenceSchema);