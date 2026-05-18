const jwt = require('jsonwebtoken');

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
const verifyToken = (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT secret not configured');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
};

/**
 * Generate JWT token
 * @param {object} payload - Data to encode in token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} JWT token
 */
const generateToken = (payload, expiresIn = '24h') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret not configured');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Generate refresh token
 * @param {object} payload - Data to encode in refresh token
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT refresh secret not configured');
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

module.exports = {
  verifyToken,
  generateToken,
  generateRefreshToken
};
