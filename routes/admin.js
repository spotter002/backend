const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Invoice = require('../models/Invoice');
const Application = require('../models/Application');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all jobs
router.get('/jobs', auth, requireRole(['admin']), async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get analytics
router.get('/analytics', auth, requireRole(['admin']), async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // User stats
    const totalUsers = await User.countDocuments();
    const clientsCount = await User.countDocuments({ role: 'client' });
    const freelancersCount = await User.countDocuments({ role: 'freelancer' });
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Job stats
    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: 'open' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const recentJobs = await Job.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    // Upgrade stats
    const urgentJobs = await Job.countDocuments({ 'upgrades.urgent': true });
    const privateJobs = await Job.countDocuments({ 'upgrades.private': true });
    const ndaJobs = await Job.countDocuments({ 'upgrades.nda': true });
    const ipJobs = await Job.countDocuments({ 'upgrades.ip': true });

    // Financial stats
    const totalInvoices = await Invoice.countDocuments();
    const paidInvoices = await Invoice.countDocuments({ status: 'paid' });
    const pendingInvoices = await Invoice.countDocuments({ status: 'pending' });
    
    const revenueResult = await Invoice.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Application stats
    const totalApplications = await Application.countDocuments();
    const approvedApplications = await Application.countDocuments({ status: 'approved' });

    res.json({
      users: {
        total: totalUsers,
        clients: clientsCount,
        freelancers: freelancersCount,
        recent: recentUsers
      },
      jobs: {
        total: totalJobs,
        open: openJobs,
        completed: completedJobs,
        recent: recentJobs
      },
      upgrades: {
        urgent: urgentJobs,
        private: privateJobs,
        nda: ndaJobs,
        ip: ipJobs
      },
      financial: {
        totalRevenue,
        totalInvoices,
        paidInvoices,
        pendingInvoices
      },
      applications: {
        total: totalApplications,
        approved: approvedApplications,
        approvalRate: totalApplications > 0 ? (approvedApplications / totalApplications * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id/role', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', auth, requireRole(['admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;