const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const crypto = require('crypto');
const logger = require('../utils/logger');

class TwoFactorAuthService {
  constructor() {
    this.issuer = process.env.APP_NAME || 'DevMerge';
  }

  generateSecret(userId) {
    const secret = speakeasy.generateSecret({
      name: `${this.issuer}:${userId}`,
      issuer: this.issuer,
      length: 6
    });
    
    return {
      base32: secret.base32,
      otpauth_url: secret.otpauth_url,
      secret: secret.base32
    };
  }

  async generateQRCode(userId, secret) {
    const otpauthUrl = `otpauth://totp/${this.issuer}:${userId}?secret=${secret}&issuer=${this.issuer}`;
    
    try {
      const qrCodeData = await qrcode.toDataURL(otpauthUrl);
      return qrCodeData;
    } catch (error) {
      logger.error('2FA: Failed to generate QR code', error.message);
      throw new Error('Failed to generate QR code');
    }
  }

  verifyToken(secret, token) {
    try {
      const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 2
      });
      
      return verified;
    } catch (error) {
      logger.error('2FA: Token verification failed', error.message);
      return false;
    }
  }

  generateBackupCodes(userId, count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  async storeBackupCodes(userId, codes) {
    // Store backup codes in database
    // This would be implemented in the User model
    return true;
  }

  verifyBackupCode(userId, code) {
    // Verify backup code
    // This would be implemented in the User model
    return true;
  }

  async disable2FA(userId) {
    // Disable 2FA for user
    // This would be implemented in the User model
    return true;
  }
}

module.exports = new TwoFactorAuthService();
