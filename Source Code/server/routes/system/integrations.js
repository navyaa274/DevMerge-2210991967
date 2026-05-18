const express = require('express');
const router = express.Router();
const Integration = require('../../models/admin/Integration');
const asyncHandler = require('../../errors/asyncHandler');

router.get('/user/:userId', asyncHandler(async (req, res) => {
  const integrations = await Integration.find({ userId: req.params.userId }).select('-accessToken -refreshToken');
  res.json(integrations);
}));

router.post('/', asyncHandler(async (req, res) => {
  const { type, accessToken, refreshToken, expiresAt } = req.body;
  let integration = await Integration.findOne({ userId: req.user.id, type });
  if (integration) {
    integration.accessToken = accessToken;
    integration.refreshToken = refreshToken;
    integration.expiresAt = expiresAt;
    integration.isActive = true;
  } else {
    integration = new Integration({ userId: req.user.id, type, accessToken, refreshToken, expiresAt });
  }
  await integration.save();
  res.json(integration);
}));

router.delete('/:integrationId', asyncHandler(async (req, res) => {
  await Integration.findByIdAndDelete(req.params.integrationId);
  res.json({ message: 'Integration disconnected' });
}));

router.get('/:type/status', asyncHandler(async (req, res) => {
  const integration = await Integration.findOne({ userId: req.user.id, type: req.params.type });
  res.json({ connected: !!integration && integration.isActive, type: req.params.type });
}));

module.exports = router;
