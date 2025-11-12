import Ticket from '../models/Ticket.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
  try {
    let query = {};

    // Admin can see all tickets
    // Moderator can see tickets for their projects
    // User can see tickets they resolved
    if (req.user.role === 'moderator') {
      const projects = await Project.find({
        $or: [
          { moderator: req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      const projectIds = projects.map(p => p._id);
      const tasks = await Task.find({ project: { $in: projectIds } }).select('_id');
      const taskIds = tasks.map(t => t._id);
      query = { task: { $in: taskIds } };
    } else if (req.user.role === 'user') {
      query = { resolvedBy: req.user._id };
    }

    const tickets = await Ticket.find(query)
      .populate({
        path: 'task',
        populate: {
          path: 'project',
          select: 'name',
        },
      })
      .populate('resolvedBy', 'name email')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'task',
        populate: {
          path: 'project',
          select: 'name moderator members',
        },
      })
      .populate('resolvedBy', 'name email')
      .populate('verifiedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check access
    const project = ticket.task.project;
    if (
      req.user.role !== 'admin' &&
      project.moderator.toString() !== req.user._id.toString() &&
      ticket.resolvedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new ticket (resolve task)
// @route   POST /api/tickets
// @access  Private/User
export const createTicket = async (req, res) => {
  try {
    const { task, resolutionNotes } = req.body;

    if (!task || !resolutionNotes) {
      return res.status(400).json({ message: 'Please add task and resolution notes' });
    }

    // Check if task exists and is assigned to user
    const taskDoc = await Task.findById(task).populate('project', 'members');
    if (!taskDoc) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Only the assigned user can create a resolution ticket
    const isAssigned = taskDoc.assignedTo?.toString() === req.user._id.toString();
    if (!isAssigned && req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ message: 'Only the assigned user can resolve this task' });
    }

    // Check if ticket already exists for this task
    const existingTicket = await Ticket.findOne({ task, resolvedBy: req.user._id, status: 'pending' });
    if (existingTicket) {
      return res.status(400).json({ message: 'You already have a pending ticket for this task' });
    }

    // Create ticket
    const ticket = await Ticket.create({
      task,
      resolvedBy: req.user._id,
      resolutionNotes,
      status: 'pending',
    });

    // Update task status to resolved
    taskDoc.status = 'resolved';
    await taskDoc.save();

    const populatedTicket = await Ticket.findById(ticket._id)
      .populate({
        path: 'task',
        populate: {
          path: 'project',
          select: 'name',
        },
      })
      .populate('resolvedBy', 'name email');

    res.status(201).json(populatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Verify ticket
// @route   PUT /api/tickets/:id/verify
// @access  Private/Moderator, Admin
export const verifyTicket = async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;

    if (!status || !['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Please provide valid status (verified or rejected)' });
    }

    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'task',
        populate: {
          path: 'project',
          select: 'moderator',
        },
      });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is moderator or admin
    const project = ticket.task.project;
    if (
      req.user.role !== 'admin' &&
      project.moderator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    ticket.status = status;
    ticket.verifiedBy = req.user._id;
    ticket.verifiedAt = Date.now();
    ticket.rejectionReason = rejectionReason || ticket.rejectionReason;

    // If rejected, change task status back to in-progress
    if (status === 'rejected') {
      const task = await Task.findById(ticket.task._id);
      task.status = 'in-progress';
      await task.save();
    }

    const updatedTicket = await ticket.save();

    const populatedTicket = await Ticket.findById(updatedTicket._id)
      .populate({
        path: 'task',
        populate: {
          path: 'project',
          select: 'name',
        },
      })
      .populate('resolvedBy', 'name email')
      .populate('verifiedBy', 'name email');

    res.json(populatedTicket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private/Admin, Moderator
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate({
        path: 'task',
        populate: {
          path: 'project',
          select: 'moderator',
        },
      });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user is moderator or admin
    const project = ticket.task.project;
    if (
      req.user.role !== 'admin' &&
      project.moderator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await ticket.deleteOne();

    res.json({ message: 'Ticket removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

