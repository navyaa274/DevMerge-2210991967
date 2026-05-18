const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    description: String,
    status: { type: String, enum: ['Pending Review', 'Approved', 'Rejected'], default: 'Pending Review' },
    comments: String
});

const accreditationSchema = new mongoose.Schema({
    title: { type: String, required: true }, // e.g., "NBA Tier 1 - CSE 2024"
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    framework: { type: String, enum: ['NBA', 'NAAC', 'ABET', 'Custom'], required: true },
    status: {
        type: String,
        enum: ['Planning', 'Data Collection', 'Under Review', 'Submitted', 'Accredited', 'Rejected'],
        default: 'Planning'
    },
    startDate: { type: Date, required: true },
    targetDate: { type: Date, required: true },

    // CO-PO Attainment Summary 
    overallAttainment: {
        target: { type: Number, default: 70 }, // Target percentage
        achieved: { type: Number, default: 0 }
    },

    // Criteria / Compliance Tracking
    criteria: [{
        name: { type: String, required: true }, // e.g., "Criterion 3: Course Outcomes"
        description: String,
        weight: { type: Number, default: 0 },
        score: { type: Number, default: 0 },
        complianceStatus: {
            type: String,
            enum: ['Not Started', 'In Progress', 'Compliant', 'Non-Compliant'],
            default: 'Not Started'
        },
        documents: [documentSchema],
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],

    // Audit Trail System
    auditTrail: [{
        action: { type: String, required: true }, // e.g., "Status Updated", "Document Uploaded"
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timestamp: { type: Date, default: Date.now },
        details: String
    }],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Accreditation', accreditationSchema);
