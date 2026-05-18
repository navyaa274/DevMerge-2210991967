const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  semester: {
    type: Number,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  program: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'archived'],
    default: 'draft'
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true
    },
    timeSlot: {
      start: {
        type: String,
        required: true
      },
      end: {
        type: String,
        required: true
      }
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom'
    },
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab'
    },
    type: {
      type: String,
      enum: ['lecture', 'lab', 'tutorial', 'seminar'],
      default: 'lecture'
    },
    capacity: Number,
    enrolled: {
      type: Number,
      default: 0
    },
    conflicts: [{
      type: {
        type: String,
        enum: ['faculty', 'room', 'student', 'lab']
      },
      with: {
        type: mongoose.Schema.Types.ObjectId
      },
      description: String
    }]
  }],
  resourceAssignments: [{
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    resourceType: {
      type: String,
      enum: ['classroom', 'lab', 'equipment'],
      required: true
    },
    assignments: [{
      day: String,
      timeSlot: {
        start: String,
        end: String
      },
      utilization: Number
    }]
  }],
  facultyAssignments: [{
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    courses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      hours: Number,
      type: {
        type: String,
        enum: ['lecture', 'lab', 'tutorial']
      }
    }],
    totalHours: Number,
    maxHours: Number,
    overload: {
      type: Boolean,
      default: false
    },
    preferences: {
      preferredDays: [String],
      preferredTimes: [String],
      unavailableTimes: [{
        day: String,
        timeSlot: {
          start: String,
          end: String
        },
        reason: String
      }]
    }
  }],
  metrics: {
    facultyUtilization: {
      average: Number,
      max: Number,
      overloadedFaculty: Number
    },
    roomUtilization: {
      average: Number,
      max: Number,
      underutilizedRooms: Number
    },
    labUtilization: {
      average: Number,
      max: Number,
      conflicts: Number
    },
    studentConflicts: {
      total: Number,
      byType: {
        doubleBooked: Number,
        backToBack: Number,
        travelTime: Number
      }
    },
    efficiency: {
      score: Number,
      optimal: Boolean,
      recommendations: [String]
    }
  },
  optimization: {
    algorithm: {
      type: String,
      enum: ['genetic', 'simulated_annealing', 'constraint_satisfaction', 'ai_driven'],
      default: 'ai_driven'
    },
    iterations: Number,
    convergenceTime: Number,
    objectiveScore: Number,
    constraints: {
      facultyHours: {
        min: Number,
        max: Number
      },
      roomCapacity: {
        min: Number,
        max: Number
      },
      labAvailability: {
        windows: [String]
      },
      studentPreferences: {
        weight: Number
      }
    }
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  publishedAt: Date,
  archivedAt: Date,
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes
timetableSchema.index({ semester: 1, academicYear: 1 });
timetableSchema.index({ program: 1 });
timetableSchema.index({ status: 1 });
timetableSchema.index({ 'schedule.day': 1, 'schedule.timeSlot.start': 1 });

module.exports = mongoose.model('Timetable', timetableSchema);
