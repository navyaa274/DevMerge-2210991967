const express = require('express');
const router = express.Router();
const MobileDevice = require('../../models/admin/MobileDevice');
const asyncHandler = require('../../errors/asyncHandler');

router.post('/register', asyncHandler(async (req, res) => {
  const { deviceId, deviceType, pushToken } = req.body;
  let device = await MobileDevice.findOne({ deviceId });
  if (device) {
    device.pushToken = pushToken;
    device.isActive = true;
    device.lastUsed = new Date();
  } else {
    device = new MobileDevice({ userId: req.user.id, deviceId, deviceType, pushToken });
  }
  await device.save();
  res.json(device);
}));

router.get('/devices', asyncHandler(async (req, res) => {
  const devices = await MobileDevice.find({ userId: req.user.id });
  res.json(devices);
}));

router.delete('/devices/:deviceId', asyncHandler(async (req, res) => {
  await MobileDevice.findByIdAndDelete(req.params.deviceId);
  res.json({ message: 'Device unregistered' });
}));

module.exports = router;
