import BusinessSettings from '../models/BusinessSettings.js';
import User from '../models/User.js';

// @desc    Get business settings (Admin & authenticated users for invoices)
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = await BusinessSettings.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update business settings (Admin)
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    let settings = await BusinessSettings.findOne();
    if (!settings) {
      settings = new BusinessSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();

    // Synchronize Admin user profile with new business details
    if (req.user && req.user.role === 'admin') {
      const adminUser = await User.findById(req.user._id);
      if (adminUser) {
        if (req.body.businessName) adminUser.businessName = req.body.businessName;
        if (req.body.ownerName) adminUser.name = req.body.ownerName;
        if (req.body.gstin) adminUser.gstin = req.body.gstin;
        if (req.body.address) adminUser.address = req.body.address;
        if (req.body.city) adminUser.city = req.body.city;
        if (req.body.state) adminUser.state = req.body.state;
        if (req.body.pincode) adminUser.pincode = req.body.pincode;
        if (req.body.mobile) adminUser.mobile = req.body.mobile;
        if (req.body.whatsapp) adminUser.whatsapp = req.body.whatsapp;
        await adminUser.save();
      }
    }

    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
