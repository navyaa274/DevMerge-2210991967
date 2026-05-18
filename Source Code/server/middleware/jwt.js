const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'devmerge-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

class JWTService {
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user._id || user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('JWT: Token verification failed', error.message);
      return null;
    }
  }

  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('JWT: Token decoding failed', error.message);
      return null;
    }
  }
}

module.exports = new JWTService();
