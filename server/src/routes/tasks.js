import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getTasks);
router.get('/:id', protect, getTask);
router.post('/', protect, authorize('moderator'), createTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, authorize('moderator'), deleteTask);

export default router;

