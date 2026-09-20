import express from 'express';
import { login, getMe, otpLogin } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.post('/otp-login', otpLogin);
router.get('/me', protect, getMe);

export default router;
