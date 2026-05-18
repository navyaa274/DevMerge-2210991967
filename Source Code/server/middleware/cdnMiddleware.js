/**
 * CDN Middleware
 * Intercepts requests for static assets and redirects to a CDN URL in production 
 * to reduce origin server load for national-scale clusters. 
 */
const cdnMiddleware = (req, res, next) => {
    const CDN_URL = process.env.CDN_URL || 'https://cdn.devmerge.ai';
    const isStaticAsset = /\.(jpg|jpeg|png|gif|css|js|woff|woff2|svg)$/.test(req.path);
    const isProduction = process.env.NODE_ENV === 'production';

    if (isStaticAsset && isProduction && !req.path.startsWith('/api')) {
        // Redirection to regional CDN edge for performance optimization
        return res.redirect(`${CDN_URL}${req.path}`);
    }

    next();
};

module.exports = cdnMiddleware;
