const express = require('express');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get client dashboard statistics
router.get('/client/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user's jobs
    const jobs = await Job.find({ clientId: userId });
    const jobIds = jobs.map(job => job._id);
    
    // Get applications for user's jobs
    const applications = await Application.find({ jobId: { $in: jobIds } });
    const acceptedApplications = applications.filter(a => a.status === 'approved');
    
    const stats = {
      totalJobs: jobs.length,
      activeJobs: jobs.filter(j => j.status === 'open').length,
      jobsInProgress: jobs.filter(j => j.status === 'in_progress').length,
      jobsCompleted: jobs.filter(j => j.status === 'completed').length,
      totalApplications: applications.length,
      acceptedApplications: acceptedApplications.length,
      totalSpent: jobs.reduce((sum, j) => sum + (j.budgetMax || 0), 0),
      avgBudget: jobs.length > 0 ? jobs.reduce((sum, j) => sum + (j.budgetMax || 0), 0) / jobs.length : 0
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get freelancer dashboard statistics
router.get('/freelancer/:userId', auth, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user's applications
    const applications = await Application.find({ freelancerId: userId });
    const approvedApplications = applications.filter(a => a.status === 'approved');
    const pendingApplications = applications.filter(a => a.status === 'pending');
    
    const stats = {
      totalApplications: applications.length,
      approvedApplications: approvedApplications.length,
      pendingApplications: pendingApplications.length,
      rejectedApplications: applications.filter(a => a.status === 'rejected').length,
      winRate: applications.length > 0 ? 
        (approvedApplications.length / applications.length) * 100 : 0,
      applicationsLast7Days: applications.filter(a => 
        new Date(a.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      applicationsLast30Days: applications.filter(a => 
        new Date(a.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      avgProposalAmount: approvedApplications.length > 0 ? 
        approvedApplications.reduce((sum, a) => sum + (a.proposedPrice || 0), 0) / approvedApplications.length : 0,
      totalEarnings: approvedApplications.reduce((sum, a) => sum + (a.proposedPrice || 0), 0)
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get admin dashboard statistics
router.get('/admin', auth, requireRole(['admin']), async (req, res) => {
  try {
    const today = new Date();
    const last24h = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // User statistics
    const totalUsers = await User.countDocuments();
    const freelancers = await User.countDocuments({ role: 'freelancer' });
    const clients = await User.countDocuments({ role: 'client' });
    const activeUsers = await User.countDocuments({ 
      'statistics.lastActive': { $gte: last30d }
    });
    const newSignups = await User.countDocuments({ 
      createdAt: { $gte: last24h }
    });
    
    // Job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open' });
    const jobsLast24h = await Job.countDocuments({ 
      createdAt: { $gte: last24h }
    });
    const jobsLast7d = await Job.countDocuments({ 
      createdAt: { $gte: last7d }
    });
    const jobsLast30d = await Job.countDocuments({ 
      createdAt: { $gte: last30d }
    });
    
    // Application statistics
    const totalApplications = await Application.countDocuments();
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    
    const stats = {
      users: {
        total: totalUsers,
        freelancers,
        clients,
        active: activeUsers,
        newSignups
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        last24h: jobsLast24h,
        last7d: jobsLast7d,
        last30d: jobsLast30d,
        completionRate: totalJobs > 0 ? ((totalJobs - activeJobs) / totalJobs) * 100 : 0
      },
      applications: {
        total: totalApplications,
        approved: approvedApplications,
        pending: pendingApplications,
        approvalRate: totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0
      },
      platform: {
        avgJobBudget: totalJobs > 0 ? 
          (await Job.aggregate([{ $group: { _id: null, avg: { $avg: '$budgetMax' } } }]))[0]?.avg || 0 : 0,
        totalJobValue: (await Job.aggregate([{ $group: { _id: null, total: { $sum: '$budgetMax' } } }]))[0]?.total || 0
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category performance
router.get('/categories', auth, requireRole(['admin']), async (req, res) => {
  try {
    const categories = await Job.aggregate([
      {
        $group: {
          _id: '$category',
          jobCount: { $sum: 1 },
          avgBudget: { $avg: '$budgetMax' }
        }
      },
      { $sort: { jobCount: -1 } }
    ]);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;