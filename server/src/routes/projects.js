import express from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getProjectTasks,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.get('/:id/tasks', protect, getProjectTasks);
router.post('/', protect, authorize('moderator'), createProject);
router.put('/:id', protect, authorize('moderator'), updateProject);
router.delete('/:id', protect, authorize('moderator'), deleteProject);

export default router;

