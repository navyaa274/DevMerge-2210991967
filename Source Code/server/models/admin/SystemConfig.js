const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    maintenanceMode: { type: Boolean, default: false },
    registrationsEnabled: { type: Boolean, default: true },
    fileUploadsEnabled: { type: Boolean, default: true },
    maxUploadSize: { type: String, default: '10MB' },
    smtpHost: { type: String, default: 'smtp.mailgun.org' },
    smtpPort: { type: String, default: '587' },
    smtpUser: { type: String, default: 'postmaster@mg.devmerge.com' }
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
