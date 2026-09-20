import User from '../models/User.js';
import CustomerLedger from '../models/CustomerLedger.js';
import UserProductPrice from '../models/UserProductPrice.js';

// @desc    Get all users / customers (Admin)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { gstin: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user with custom pricing
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch custom pricing assigned to this user
    const customPrices = await UserProductPrice.find({ userId: user._id })
      .populate('productId', 'name brand variant sellingPrice mrp')
      .lean();

    res.json({ success: true, user, customPrices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin creates new customer account
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const {
      name,
      businessName,
      mobile,
      whatsapp,
      email,
      password,
      role = 'user',
      gstin,
      address,
      city,
      state,
      pincode,
      creditLimit = 50000,
      paymentTerms = 15,
      openingBalance = 0,
      status = 'active',
    } = req.body;

    const existingUser = await User.findOne({ mobile: mobile.trim() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this mobile number already exists' });
    }

    const user = new User({
      name,
      businessName: businessName || name,
      mobile: mobile.trim(),
      whatsapp: whatsapp || mobile.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      password: password || '123456',
      role,
      gstin,
      address,
      city,
      state,
      pincode,
      creditLimit: Number(creditLimit),
      paymentTerms: Number(paymentTerms),
      openingBalance: Number(openingBalance),
      outstandingBalance: Number(openingBalance),
      status,
    });

    await user.save();

    // If opening balance > 0, record in ledger
    if (Number(openingBalance) !== 0) {
      const isDebit = Number(openingBalance) > 0;
      await CustomerLedger.create({
        userId: user._id,
        type: 'OPENING',
        debit: isDebit ? Number(openingBalance) : 0,
        credit: !isDebit ? Math.abs(Number(openingBalance)) : 0,
        runningBalance: Number(openingBalance),
        description: 'Initial Opening Balance on account setup',
        date: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Customer account created successfully',
      user: {
        _id: user._id,
        name: user.name,
        businessName: user.businessName,
        mobile: user.mobile,
        role: user.role,
        creditLimit: user.creditLimit,
        outstandingBalance: user.outstandingBalance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      businessName,
      mobile,
      whatsapp,
      email,
      gstin,
      address,
      city,
      state,
      pincode,
      creditLimit,
      paymentTerms,
      status,
    } = req.body;

    if (name) user.name = name;
    if (businessName) user.businessName = businessName;
    if (mobile) user.mobile = mobile;
    if (whatsapp) user.whatsapp = whatsapp;
    if (email !== undefined) user.email = email;
    if (gstin !== undefined) user.gstin = gstin;
    if (address !== undefined) user.address = address;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (pincode !== undefined) user.pincode = pincode;
    if (creditLimit !== undefined) user.creditLimit = Number(creditLimit);
    if (paymentTerms !== undefined) user.paymentTerms = Number(paymentTerms);
    if (status !== undefined) user.status = status;

    await user.save();

    res.json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password (Admin)
// @route   PUT /api/users/:id/reset-password
// @access  Private/Admin
export const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = req.body.newPassword || '123456';
    await user.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Customer updates their own profile
// @route   PUT /api/users/profile/me
// @access  Private
export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, whatsapp, email, address, city, state, pincode, gstin } = req.body;

    if (name) user.name = name;
    if (whatsapp) user.whatsapp = whatsapp;
    if (email) user.email = email;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;
    if (pincode) user.pincode = pincode;
    if (gstin) user.gstin = gstin;

    await user.save();

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
