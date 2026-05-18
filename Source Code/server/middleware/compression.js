const compression = require('compression');

/**
 * Compression Middleware
 * Compresses response bodies for all requests
 */
module.exports = compression({
  // Only compress responses larger than 1KB
  threshold: 1024,
  
  // Compression level (0-9, 6 is default)
  level: 6,
  
  // Filter function to determine if response should be compressed
  filter: (req, res) => {
    // Don't compress if client doesn't accept encoding
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Use compression filter
    return compression.filter(req, res);
  }
});
