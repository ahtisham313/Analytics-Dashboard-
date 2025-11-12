import Project from '../models/Project.js';
import Task from '../models/Task.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
  try {
    let query = {};

    // Admin can see all projects
    // Moderator can see their projects and projects they're assigned to
    // User can only see projects where they have tasks assigned
    if (req.user.role === 'moderator') {
      query = {
        $or: [
          { moderator: req.user._id },
          { members: req.user._id }
        ]
      };
    } else if (req.user.role === 'user') {
      const userTasks = await Task.find({ assignedTo: req.user._id }).select('project');
      const projectIds = [...new Set(userTasks.map(t => t.project?.toString()))].filter(Boolean);
      query = { _id: { $in: projectIds } };
    }

    const projects = await Project.find(query)
      .populate('moderator', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('moderator', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    if (req.user.role === 'admin') {
      return res.json(project);
    }
    if (req.user.role === 'moderator') {
      if (project.moderator._id.toString() !== req.user._id.toString() && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
        return res.status(403).json({ message: 'Access denied' });
      }
      return res.json(project);
    }
    // user: visible only if they have an assigned task in this project
    const assignedTask = await Task.findOne({ project: project._id, assignedTo: req.user._id }).select('_id');
    if (!assignedTask) {
      return res.status(403).json({ message: 'Access denied' });
    }
    return res.json(project);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private/Admin, Moderator
export const createProject = async (req, res) => {
  try {
    const { name, description, members, startDate, endDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please add a project name' });
    }

    const project = await Project.create({
      name,
      description,
      moderator: req.user._id,
      members: members || [],
      startDate: startDate || Date.now(),
      endDate,
      status: 'active',
    });

    const populatedProject = await Project.findById(project._id)
      .populate('moderator', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private/Admin, Moderator
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is moderator or admin
    if (
      req.user.role !== 'admin' &&
      project.moderator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, status, members, startDate, endDate } = req.body;

    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    project.status = status || project.status;
    project.members = members || project.members;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate !== undefined ? endDate : project.endDate;

    const updatedProject = await project.save();

    const populatedProject = await Project.findById(updatedProject._id)
      .populate('moderator', 'name email')
      .populate('members', 'name email');

    res.json(populatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private/Admin, Moderator
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is moderator or admin
    if (
      req.user.role !== 'admin' &&
      project.moderator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ project: project._id });

    await project.deleteOne();

    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project tasks
// @route   GET /api/projects/:id/tasks
// @access  Private
export const getProjectTasks = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    if (
      req.user.role !== 'admin' &&
      project.moderator.toString() !== req.user._id.toString() &&
      !project.members.some(m => m.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

