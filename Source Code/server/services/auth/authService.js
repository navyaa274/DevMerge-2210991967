const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../../models/auth/User');

/**
 * Auth Service — encapsulates authentication business logic
 * Controllers should delegate to these methods instead of querying models directly.
 */

const findUserByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase() });
};

const findUserById = async (id, selectFields = '') => {
  return User.findById(id).select(selectFields);
};

const hashPassword = async (password, rounds = 12) => {
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

const generateTokenPair = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );

  const refreshToken = jwt.sign(
    { id: user._id, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );

  return { accessToken, refreshToken };
};

const createVerificationToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, hashedToken };
};

const createPasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { rawToken, hashedToken, expires };
};

module.exports = {
  findUserByEmail,
  findUserById,
  hashPassword,
  comparePassword,
  generateTokenPair,
  createVerificationToken,
  createPasswordResetToken
};
