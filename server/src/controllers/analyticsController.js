import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

// @desc    Get system-wide analytics (Admin only)
// @route   GET /api/analytics/system
// @access  Private/Admin
export const getSystemAnalytics = async (req, res) => {
  try {
    // Project status distribution
    const projectStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Task distribution
    const taskDistribution = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Total counts
    const totalProjects = await Project.countDocuments();
    const totalTasks = await Task.countDocuments();
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalTickets = await Ticket.countDocuments();

    // Tickets resolved per user
    const ticketsPerUser = await Ticket.aggregate([
      {
        $match: { status: 'verified' },
      },
      {
        $group: {
          _id: '$resolvedBy',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          ticketsResolved: '$count',
        },
      },
      {
        $sort: { ticketsResolved: -1 },
      },
    ]);

    // Moderator performance
    const moderatorPerformance = await Project.aggregate([
      {
        $group: {
          _id: '$moderator',
          projectsCount: { $sum: 1 },
          activeProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          completedProjects: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'moderator',
        },
      },
      {
        $unwind: '$moderator',
      },
      {
        $lookup: {
          from: 'tasks',
          localField: '_id',
          foreignField: 'project',
          as: 'tasks',
        },
      },
      {
        $project: {
          moderatorId: '$_id',
          moderatorName: '$moderator.name',
          moderatorEmail: '$moderator.email',
          projectsCount: 1,
          activeProjects: 1,
          completedProjects: 1,
          totalTasks: { $size: '$tasks' },
          resolvedTasks: {
            $size: {
              $filter: {
                input: '$tasks',
                as: 'task',
                cond: { $eq: ['$$task.status', 'resolved'] },
              },
            },
          },
        },
      },
      {
        $sort: { projectsCount: -1 },
      },
    ]);

    res.json({
      projectStatus,
      taskDistribution,
      totals: {
        projects: totalProjects,
        tasks: totalTasks,
        users: totalUsers,
        tickets: totalTickets,
      },
      ticketsPerUser,
      moderatorPerformance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get project analytics
// @route   GET /api/analytics/project/:id
// @access  Private
export const getProjectAnalytics = async (req, res) => {
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

    // Task distribution for this project
    const taskDistribution = await Task.aggregate([
      {
        $match: { project: project._id },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      {
        $match: { project: project._id },
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Tasks by assigned user
    const tasksByUser = await Task.aggregate([
      {
        $match: { project: project._id },
      },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          totalTasks: '$total',
          resolvedTasks: '$resolved',
        },
      },
    ]);

    // Tickets for this project
    const tasks = await Task.find({ project: project._id }).select('_id');
    const taskIds = tasks.map(t => t._id);
    const tickets = await Ticket.find({ task: { $in: taskIds } });
    const verifiedTickets = tickets.filter(t => t.status === 'verified').length;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;

    const totalTasks = await Task.countDocuments({ project: project._id });
    const openTasks = await Task.countDocuments({ project: project._id, status: 'open' });
    const inProgressTasks = await Task.countDocuments({ project: project._id, status: 'in-progress' });
    const resolvedTasks = await Task.countDocuments({ project: project._id, status: 'resolved' });

    res.json({
      project: {
        id: project._id,
        name: project.name,
        status: project.status,
      },
      taskDistribution,
      tasksByPriority,
      tasksByUser,
      tickets: {
        total: tickets.length,
        verified: verifiedTickets,
        pending: pendingTickets,
        rejected: tickets.length - verifiedTickets - pendingTickets,
      },
      summary: {
        totalTasks,
        openTasks,
        inProgressTasks,
        resolvedTasks,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get moderator analytics
// @route   GET /api/analytics/moderator
// @access  Private/Moderator, Admin
export const getModeratorAnalytics = async (req, res) => {
  try {
    let query = { moderator: req.user._id };
    
    // Admin can view all moderators
    if (req.user.role === 'admin') {
      query = {};
    }

    const projects = await Project.find(query);
    const projectIds = projects.map(p => p._id);

    // Get tasks for these projects
    const tasks = await Task.find({ project: { $in: projectIds } });
    const taskIds = tasks.map(t => t._id);

    // Task distribution
    const taskDistribution = await Task.aggregate([
      {
        $match: { project: { $in: projectIds } },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Project status
    const projectStatus = await Project.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Team progress (tasks by user)
    const teamProgress = await Task.aggregate([
      {
        $match: { project: { $in: projectIds } },
      },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: '$_id',
          userName: '$user.name',
          userEmail: '$user.email',
          totalTasks: '$total',
          openTasks: '$open',
          inProgressTasks: '$inProgress',
          resolvedTasks: '$resolved',
        },
      },
    ]);

    // Tickets
    const tickets = await Ticket.find({ task: { $in: taskIds } });
    const verifiedTickets = tickets.filter(t => t.status === 'verified').length;
    const pendingTickets = tickets.filter(t => t.status === 'pending').length;

    res.json({
      projectStatus,
      taskDistribution,
      teamProgress,
      tickets: {
        total: tickets.length,
        verified: verifiedTickets,
        pending: pendingTickets,
      },
      summary: {
        totalProjects: projects.length,
        totalTasks: tasks.length,
        totalTickets: tickets.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user analytics
// @route   GET /api/analytics/user
// @access  Private
export const getUserAnalytics = async (req, res) => {
  try {
    // Get projects user is member of
    const projects = await Project.find({ members: req.user._id });
    const projectIds = projects.map(p => p._id);

    // Get tasks assigned to user
    const assignedTasks = await Task.find({ assignedTo: req.user._id });
    const assignedTaskIds = assignedTasks.map(t => t._id);

    // Task status distribution
    const taskStatus = await Task.aggregate([
      {
        $match: { assignedTo: req.user._id },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Tickets resolved by user
    const ticketsResolved = await Ticket.countDocuments({
      resolvedBy: req.user._id,
      status: 'verified',
    });

    const ticketsPending = await Ticket.countDocuments({
      resolvedBy: req.user._id,
      status: 'pending',
    });

    res.json({
      tasks: {
        total: assignedTasks.length,
        status: taskStatus,
      },
      tickets: {
        resolved: ticketsResolved,
        pending: ticketsPending,
      },
      projects: {
        total: projects.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

