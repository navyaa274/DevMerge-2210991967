const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subdomain: { type: String, required: true, unique: true },
    adminEmail: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },

    // Regional Compliance & Data Residency (Phase 6)
    dataResidencyRegion: { type: String, default: 'Asia-South', enum: ['Asia-South', 'Europe-West', 'US-East', 'US-West'] },
    tenantDbUri: { type: String, required: false },

    // Feature Flags per Institution
    featureFlags: {
        enableAiTutor: { type: Boolean, default: true },
        enableAdvancedAnalytics: { type: Boolean, default: false },
        enableCodeExecution: { type: Boolean, default: true },
        enableCustomBranding: { type: Boolean, default: false },
        enableAccreditationWorkflow: { type: Boolean, default: false }
    },

    theme: {
        primaryColor: { type: String, default: '#3F51B5' },
        logoUrl: { type: String, default: '' },
        organizationName: { type: String, required: true }
    },

    // Usage Based AI Quota
    aiQuota: {
        allocatedCredits: { type: Number, default: 1000 },
        usedCredits: { type: Number, default: 0 },
        resetDate: { type: Date, required: false }
    }
});

module.exports = mongoose.model('Tenant', tenantSchema);
