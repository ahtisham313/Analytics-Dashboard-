import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersByRole,
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/role/:role', protect, authorize('admin', 'moderator'), getUsersByRole);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

export default router;

