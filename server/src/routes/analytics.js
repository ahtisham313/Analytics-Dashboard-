import express from 'express';
import {
  getSystemAnalytics,
  getProjectAnalytics,
  getModeratorAnalytics,
  getUserAnalytics,
} from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/system', protect, authorize('admin'), getSystemAnalytics);
router.get('/project/:id', protect, getProjectAnalytics);
router.get('/moderator', protect, authorize('admin', 'moderator'), getModeratorAnalytics);
router.get('/user', protect, getUserAnalytics);

export default router;

