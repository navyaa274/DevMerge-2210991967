const MobileDevice = require("../../models/admin/MobileDevice");

const mobileController = {
  registerDevice: async (req, res) => {
    try {
      const { userId, deviceToken, platform, deviceInfo } = req.body;

      let device = await MobileDevice.findOne({ user: userId, deviceToken });
      if (device) {
        device.lastActive = new Date();
        device.deviceInfo = deviceInfo;
        await device.save();
      } else {
        device = new MobileDevice({
          user: userId,
          deviceToken,
          platform,
          deviceInfo,
        });
        await device.save();
      }

      res.status(201).json({ success: true, data: device });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUserDevices: async (req, res) => {
    try {
      const { userId } = req.params;
      const devices = await MobileDevice.find({ user: userId }).sort({
        lastActive: -1,
      });
      res.json({ success: true, data: devices });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  unregisterDevice: async (req, res) => {
    try {
      const { deviceId } = req.params;
      const device = await MobileDevice.findByIdAndDelete(deviceId);

      if (!device) {
        return res
          .status(404)
          .json({ success: false, message: "Device not found" });
      }

      res.json({ success: true, message: "Device unregistered" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  updateDeviceStatus: async (req, res) => {
    try {
      const { deviceId } = req.params;
      const { isActive } = req.body;

      const device = await MobileDevice.findByIdAndUpdate(
        deviceId,
        { isActive, lastActive: new Date() },
        { new: true },
      );

      if (!device) {
        return res
          .status(404)
          .json({ success: false, message: "Device not found" });
      }

      res.json({ success: true, data: device });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
};

module.exports = mobileController;
