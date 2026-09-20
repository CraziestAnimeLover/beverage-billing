import express from 'express';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  updateMyProfile,
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Customer updating own profile
router.put('/profile/me', protect, updateMyProfile);

// Admin customer operations
router.route('/').get(protect, adminOnly, getUsers).post(protect, adminOnly, createUser);
router.route('/:id').get(protect, adminOnly, getUserById).put(protect, adminOnly, updateUser);
router.put('/:id/reset-password', protect, adminOnly, resetUserPassword);

export default router;
