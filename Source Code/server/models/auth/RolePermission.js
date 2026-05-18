const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
    module: { type: String, required: true, unique: true },
    student: { type: Boolean, default: false },
    faculty: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    superAdmin: { type: Boolean, default: true }
});

module.exports = mongoose.models.RolePermission || mongoose.model('RolePermission', rolePermissionSchema);
