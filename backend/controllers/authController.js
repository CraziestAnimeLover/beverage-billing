import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretbeveragedealerjwtkey2026', {
    expiresIn: '30d',
  });
};

// @desc    Auth user / admin & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // mobile or email

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide mobile/email and password' });
    }

    const cleanIdentifier = identifier.trim();
    const digits = cleanIdentifier.replace(/\D/g, '');
    const mobileOrConditions = [{ mobile: cleanIdentifier }, { email: cleanIdentifier.toLowerCase() }];
    if (digits.length >= 10) {
      mobileOrConditions.push({ mobile: new RegExp(digits.slice(-10) + '$') });
      mobileOrConditions.push({ whatsapp: new RegExp(digits.slice(-10) + '$') });
    }

    // Check by mobile or email
    const user = await User.findOne({
      $or: mobileOrConditions,
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account is blocked. Contact distributor.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        businessName: user.businessName,
        mobile: user.mobile,
        whatsapp: user.whatsapp,
        email: user.email,
        role: user.role,
        gstin: user.gstin,
        creditLimit: user.creditLimit,
        paymentTerms: user.paymentTerms,
        outstandingBalance: user.outstandingBalance,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Demo OTP verification (instant 1234 or auto-verify for mobile testing)
// @route   POST /api/auth/otp-login
// @access  Public
export const otpLogin = async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const user = await User.findOne({ mobile: mobile?.trim() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered customer found with this mobile number' });
    }

    if (otp !== '1234' && otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP. For demo testing, use OTP: 1234' });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        businessName: user.businessName,
        mobile: user.mobile,
        whatsapp: user.whatsapp,
        role: user.role,
        creditLimit: user.creditLimit,
        outstandingBalance: user.outstandingBalance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
