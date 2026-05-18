const User = require('../../models/auth/User');
const validation = require('../../utils/validation');
const emailService = require('../../utils/emailService');

/**
 * Get current user profile
 * @access Private
 */
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('department', 'name');

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    role: user.role,
                    studentId: user.studentId,
                    employeeId: user.employeeId,
                    isEmailVerified: user.isEmailVerified,
                    twoFactorEnabled: user.twoFactorEnabled,
                    profilePicture: user.profilePicture,
                    phone: user.phone,
                    dateOfBirth: user.dateOfBirth,
                    gender: user.gender,
                    bio: user.bio,
                    department: user.department?._id || user.department,
                    departmentName: user.department?.name || 'Global',
                    programId: user.programId,
                    semester: user.semester,
                    section: user.section,
                    batch: user.batch,
                    enrollmentDate: user.enrollmentDate,
                    graduationDate: user.graduationDate,
                    preferences: user.preferences,
                    academicInfo: user.academicInfo,
                    facultyInfo: user.facultyInfo,
                    tagline: user.tagline,
                    skills: user.skills,
                    socialLinks: user.socialLinks,
                    lastLogin: user.lastLogin,
                    loginCount: user.loginCount,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile',
            code: 'PROFILE_ERROR'
        });
    }
};

/**
 * Update user profile
 * @access Private
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;

        const allowedFields = [
            'firstName', 'lastName', 'name', 'phone', 'dateOfBirth', 'gender', 'bio',
            'profilePicture', 'preferences', 'tagline', 'skills', 'socialLinks'
        ];

        const filteredData = {};
        Object.keys(updateData).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredData[key] = updateData[key];
            }
        });

        if (filteredData.name) {
            const parts = filteredData.name.trim().split(' ');
            filteredData.firstName = parts[0];
            filteredData.lastName = parts.slice(1).join(' ') || '';
        }

        const user = await User.findByIdAndUpdate(
            userId,
            filteredData,
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            code: 'UPDATE_PROFILE_ERROR'
        });
    }
};

/**
 * Change user password
 * @access Private
 */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const { error } = validation.validateChangePassword({
            currentPassword,
            newPassword,
            confirmNewPassword: newPassword
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: error.details.map(err => ({
                    field: err.path[0],
                    message: err.message
                }))
            });
        }

        const user = await User.findById(userId).select('+password');
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
                code: 'INVALID_CURRENT_PASSWORD'
            });
        }

        user.password = newPassword;
        user.lastPasswordChange = new Date();
        await user.save();

        try {
            await emailService.sendEmail({
                to: user.email,
                subject: 'Password Changed',
                html: `<h2>Password Changed</h2><p>Your password has been successfully changed.</p>`
            });
        } catch (err) { }

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Get settings
 * @access Private
 */
exports.getSettings = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: {
                settings: {
                    emailNotifications: user.preferences?.emailNotifications ?? true,
                    pushNotifications: user.preferences?.pushNotifications ?? true,
                    theme: user.preferences?.theme ?? 'light',
                    language: user.preferences?.language ?? 'en',
                    timezone: user.preferences?.timezone ?? 'UTC'
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Update settings
 * @access Private
 */
exports.updateSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const { emailNotifications, pushNotifications, theme, language, timezone } = req.body;

        const updateData = {
            preferences: {
                emailNotifications: emailNotifications ?? true,
                pushNotifications: pushNotifications ?? true,
                theme: theme ?? 'light',
                language: language ?? 'en',
                timezone: timezone ?? 'UTC'
            }
        };

        await User.findByIdAndUpdate(userId, updateData, { new: true });

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: { settings: updateData.preferences }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
