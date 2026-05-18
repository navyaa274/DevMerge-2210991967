const Tenant = require('../models/admin/Tenant');

/**
 * Multi-tenant resolution middleware
 * Identifies the tenant by examining the incoming request (e.g. host subdomain or x-tenant-id header)
 * and attaches the tenant object & feature flags to the request object.
 */
const tenantResolver = async (req, res, next) => {
    try {
        // Determine tenant by HTTP Header or Subdomain logic
        const tenantIdHeader = req.headers['x-tenant-id'];
        const host = req.get('host') || '';
        const subdomain = host.split('.')[0];

        let tenant = null;

        if (tenantIdHeader) {
            tenant = await Tenant.findById(tenantIdHeader);
        } else if (subdomain && subdomain !== 'www' && subdomain !== 'localhost') {
            tenant = await Tenant.findOne({ subdomain });
        }

        if (!tenant) {
            // In a strict multi-tenant system: return res.status(404).json({ error: 'Tenant not found.' });
            // For development, we allow requests without tenant
            req.tenant = {
                name: 'Default Institution',
                featureFlags: {
                    enableAiTutor: true,
                    enableAdvancedAnalytics: true,
                    enableCodeExecution: true,
                    enableCustomBranding: false,
                    enableAccreditationWorkflow: true
                },
                aiQuota: { allocatedCredits: 999999, usedCredits: 0 }
            };
            return next();
        }

        if (!tenant.isActive) {
            return res.status(403).json({ error: 'Tenant account is inactive or disabled. Contact support.' });
        }

        // Attach tenant logic to the request
        req.tenant = tenant;

        next();
    } catch (error) {
        console.error('Tenant Resolution Error:', error);
        res.status(500).json({ error: 'Failed to resolve tenant configuration' });
    }
};

module.exports = tenantResolver;
