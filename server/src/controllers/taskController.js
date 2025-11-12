import Task from '../models/Task.js';
import Project from '../models/Project.js';

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    let query = {};

    // Admin can see all tasks
    // Moderator can see tasks in their projects
    // User can see ONLY tasks assigned to them
    if (req.user.role === 'moderator') {
      const projects = await Project.find({
        $or: [
          { moderator: req.user._id },
          { members: req.user._id }
        ]
      }).select('_id');
      const projectIds = projects.map(p => p._id);
      query = { project: { $in: projectIds } };
    } else if (req.user.role === 'user') {
      query = { assignedTo: req.user._id };
    }

    const tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name status moderator members')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access
    const project = task.project;
    if (
      req.user.role !== 'admin' &&
      project.moderator.toString() !== req.user._id.toString() &&
      !project.members.some(m => m.toString() === req.user._id.toString()) &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin, Moderator
export const createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, priority, dueDate } = req.body;

    if (!title || !project) {
      return res.status(400).json({ message: 'Please add title and project' });
    }

    // Check if project exists and user has access
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (
      req.user.role !== 'admin' &&
      projectDoc.moderator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      priority: priority || 'medium',
      dueDate,
      createdBy: req.user._id,
      status: 'open',
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'moderator members');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check access - Moderator/Admin can update any field, User can only update status
    const project = task.project;
    const isModerator = req.user.role === 'admin' || project.moderator.toString() === req.user._id.toString();
    const isAssignedUser = task.assignedTo?.toString() === req.user._id.toString();

    if (!isModerator && !isAssignedUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, status, assignedTo, priority, dueDate } = req.body;

    // Users can only update status with constrained transitions; moderators/admin can edit all fields
    if (isModerator) {
      task.title = title || task.title;
      task.description = description !== undefined ? description : task.description;
      task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
      task.priority = priority || task.priority;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    }

    if (status) {
      if (isModerator) {
        task.status = status;
      } else if (isAssignedUser) {
        // user transition: open -> in-progress only; resolving requires ticket flow
        const allowedFromOpen = status === 'in-progress' && task.status === 'open';
        const allowedNoop = status === task.status; // allow idempotent
        if (allowedFromOpen || allowedNoop) {
          task.status = status;
        } else {
          return res.status(400).json({ message: "Users can only move from 'open' to 'in-progress'. Use ticket to resolve." });
        }
      }
    }

    const updatedTask = await task.save();

    const populatedTask = await Task.findById(updatedTask._id)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json(populatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin, Moderator
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'moderator');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user is moderator or admin
    const project = task.project;
    if (
      req.user.role !== 'admin' &&
      project.moderator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.deleteOne();

    res.json({ message: 'Task removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

