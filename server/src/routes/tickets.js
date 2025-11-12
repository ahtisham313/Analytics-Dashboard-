import express from 'express';
import {
  getTickets,
  getTicket,
  createTicket,
  verifyTicket,
  deleteTicket,
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getTickets);
router.get('/:id', protect, getTicket);
router.post('/', protect, createTicket);
router.put('/:id/verify', protect, authorize('admin', 'moderator'), verifyTicket);
router.delete('/:id', protect, authorize('admin', 'moderator'), deleteTicket);

export default router;

