const express = require('express');
const router = express.Router();
const APIKey = require('../../models/auth/APIKey');
const asyncHandler = require('../../errors/asyncHandler');

router.post('/', asyncHandler(async (req, res) => {
  const { name, permissions, rateLimit, expiresAt } = req.body;
  const key = `sk_${require('crypto').randomBytes(32).toString('hex')}`;
  const apiKey = new APIKey({ userId: req.user.id, name, key, permissions, rateLimit, expiresAt });
  await apiKey.save();
  res.status(201).json(apiKey);
}));

router.get('/user/:userId', asyncHandler(async (req, res) => {
  const keys = await APIKey.find({ userId: req.params.userId }).select('-key');
  res.json(keys);
}));

router.delete('/:keyId', asyncHandler(async (req, res) => {
  await APIKey.findByIdAndDelete(req.params.keyId);
  res.json({ message: 'API key deleted' });
}));

router.put('/:keyId/regenerate', asyncHandler(async (req, res) => {
  const newKey = `sk_${require('crypto').randomBytes(32).toString('hex')}`;
  const apiKey = await APIKey.findByIdAndUpdate(req.params.keyId, { key: newKey }, { new: true });
  res.json(apiKey);
}));

module.exports = router;
