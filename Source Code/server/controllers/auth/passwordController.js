const crypto = require('crypto');
const User = require('../../models/auth/User');
const emailService = require('../../utils/emailService');
const validation = require('../../utils/validation');

/**
 * Send password reset email
 * @access Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
                code: 'EMAIL_REQUIRED'
            });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetExpires;
        await user.save();

        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        try {
            await emailService.sendEmail({
                to: email,
                subject: 'Reset Your Password - AI University Platform',
                template: 'password-reset',
                data: {
                    firstName: user.firstName,
                    resetUrl,
                    platformName: 'AI University Platform'
                }
            });
        } catch (err) { }

        res.json({ success: true, message: 'Password reset link sent to your email' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

/**
 * Reset password
 * @access Public
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required',
                code: 'TOKEN_PASSWORD_REQUIRED'
            });
        }

        const { error } = validation.validatePasswordReset({
            token,
            password: newPassword,
            confirmPassword: newPassword
        });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: error.details.map(err => ({ field: err.path[0], message: err.message }))
            });
        }

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
                code: 'INVALID_RESET_TOKEN'
            });
        }

        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.lastPasswordChange = new Date();
        await user.save();

        try {
            await emailService.sendEmail({
                to: user.email,
                subject: 'Password Reset Successful',
                html: `<h2>Password Reset Successful</h2><p>Your password has been successfully reset.</p>`
            });
        } catch (err) { }

        res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
