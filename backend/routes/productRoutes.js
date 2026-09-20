import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  setCustomPrice,
  deleteCustomPrice,
  getProductMeta,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/meta/categories', protect, getProductMeta);
router.post('/custom-price', protect, adminOnly, setCustomPrice);
router.delete('/custom-price/:id', protect, adminOnly, deleteCustomPrice);

router.route('/').get(protect, getProducts).post(protect, adminOnly, createProduct);
router.route('/:id').get(protect, getProductById).put(protect, adminOnly, updateProduct);

export default router;
