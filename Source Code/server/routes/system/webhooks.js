const express = require('express');
const router = express.Router();
const Webhook = require('../../models/admin/Webhook');
const asyncHandler = require('../../errors/asyncHandler');

router.post('/', asyncHandler(async (req, res) => {
  const { name, url, events } = req.body;
  const secret = require('crypto').randomBytes(32).toString('hex');
  const webhook = new Webhook({ userId: req.user.id, name, url, events, secret });
  await webhook.save();
  res.status(201).json(webhook);
}));

router.get('/user/:userId', asyncHandler(async (req, res) => {
  const webhooks = await Webhook.find({ userId: req.params.userId }).select('-secret');
  res.json(webhooks);
}));

router.put('/:webhookId', asyncHandler(async (req, res) => {
  const webhook = await Webhook.findByIdAndUpdate(req.params.webhookId, req.body, { new: true });
  res.json(webhook);
}));

router.delete('/:webhookId', asyncHandler(async (req, res) => {
  await Webhook.findByIdAndDelete(req.params.webhookId);
  res.json({ message: 'Webhook deleted' });
}));

router.post('/:webhookId/test', asyncHandler(async (req, res) => {
  const webhook = await Webhook.findById(req.params.webhookId);
  if (!webhook) return res.status(404).json({ error: 'Webhook not found' });
  res.json({ message: 'Test webhook sent' });
}));

module.exports = router;
