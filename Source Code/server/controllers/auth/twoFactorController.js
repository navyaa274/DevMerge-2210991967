const User = require('../../models/auth/User');
const twoFactorAuth = require('../../utils/twoFactorAuth');
const cacheService = require('../../services/infrastructure/cacheService');

/**
 * Enable 2FA - Generate secret and QR code
 */
exports.enable2FA = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const user = await User.findById(userId);
        if (user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA is already enabled'
            });
        }

        const secretData = twoFactorAuth.generateSecret(userId);
        const qrCode = await twoFactorAuth.generateQRCode(userId, secretData.base32);

        await cacheService.set(`2fa:secret:${userId}`, secretData.base32, 3600);

        res.json({
            success: true,
            message: '2FA secret generated successfully. Please verify with token.',
            data: {
                qrCode: qrCode,
                secret: secretData.base32
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to enable 2FA',
            error: error.message
        });
    }
};

/**
 * Verify 2FA token to complete enablement
 */
exports.verifyAndEnable2FA = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { token } = req.body;

        const secret = await cacheService.get(`2fa:secret:${userId}`);

        if (!secret) {
            return res.status(400).json({
                success: false,
                message: 'Secret expired or not found. Please regenerate.'
            });
        }

        const isValid = twoFactorAuth.verifyToken(secret, token);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid 2FA token'
            });
        }

        const user = await User.findById(userId);
        user.twoFactorEnabled = true;
        user.twoFactorSecret = secret;
        await user.save();

        await cacheService.del(`2fa:secret:${userId}`);

        res.json({
            success: true,
            message: '2FA enabled and verified successfully',
            data: { twoFactorEnabled: true }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify 2FA',
            error: error.message
        });
    }
};

/**
 * Disable 2FA
 */
exports.disable2FA = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const user = await User.findById(userId);
        user.twoFactorEnabled = false;
        user.twoFactorSecret = null;
        await user.save();

        res.json({
            success: true,
            message: '2FA disabled successfully',
            data: { twoFactorEnabled: false }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to disable 2FA',
            error: error.message
        });
    }
};

/**
 * Verify 2FA during login
 */
exports.loginVerify2FA = async (req, res) => {
    try {
        const { userId, token } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!user.twoFactorEnabled) {
            return res.status(400).json({
                success: false,
                message: '2FA not enabled for this user'
            });
        }

        const isValid = twoFactorAuth.verifyToken(user.twoFactorSecret, token);

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid 2FA token'
            });
        }

        res.json({
            success: true,
            message: '2FA verified successfully',
            data: { twoFactorVerified: true }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to verify 2FA',
            error: error.message
        });
    }
};

/**
 * Get 2FA status
 */
exports.get2FAStatus = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const user = await User.findById(userId);

        res.json({
            success: true,
            data: { twoFactorEnabled: user.twoFactorEnabled || false }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get 2FA status',
            error: error.message
        });
    }
};
