const Webhook = require('../../models/admin/Webhook');
const axios = require('axios');
const crypto = require('crypto');
const asyncHandler = require('../../errors/asyncHandler');

/**
 * Webhook & Interoperability Controller
 * Implements Phase 8 Item 35 (Webhook System)
 */

// 1. Create a Webhook Subscription
exports.createWebhook = asyncHandler(async (req, res) => {
    const { url, events } = req.body;

    // Generate a unique secret for this webhook
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await Webhook.create({
        userId: req.user.id,
        url,
        events,
        secret
    });

    res.status(201).json({ success: true, data: webhook, secret }); // Secret is sent only once
});

// 2. Trigger Webhook Event (Internal Utility)
exports.triggerWebhooks = async (event, payload) => {
    const webhooks = await Webhook.find({ events: event, isActive: true });

    for (const hook of webhooks) {
        try {
            // Sign the payload with the secret
            const signature = crypto.createHmac('sha256', hook.secret)
                .update(JSON.stringify(payload))
                .digest('hex');

            await axios.post(hook.url, payload, {
                headers: {
                    'X-DevMerge-Event': event,
                    'X-DevMerge-Signature': signature,
                    'Content-Type': 'application/json'
                },
                timeout: 5000
            });

            hook.lastTriggered = new Date();
            hook.failureCount = 0;
            await hook.save();
        } catch (err) {
            console.error(`Webhook fail: ${hook.url}`, err.message);
            hook.failureCount++;
            if (hook.failureCount > 10) hook.isActive = false; // Auto-disable bad hooks
            await hook.save();
        }
    }
};

// 3. Get User Webhooks
exports.getMyWebhooks = asyncHandler(async (req, res) => {
    const hooks = await Webhook.find({ userId: req.user.id });
    res.json({ success: true, data: hooks });
});

// 4. Delete Webhook
exports.deleteWebhook = asyncHandler(async (req, res) => {
    await Webhook.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true, message: 'Webhook deleted' });
});
