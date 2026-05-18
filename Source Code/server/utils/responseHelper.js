/**
 * Standardized API Response Helpers
 * Ensures consistent response format across all endpoints
 */

const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

const sendCreated = (res, data) => {
  sendSuccess(res, data, 201);
};

const sendMessage = (res, message, statusCode = 200) => {
  res.status(statusCode).json({ success: true, message });
};

module.exports = { sendSuccess, sendCreated, sendMessage };
