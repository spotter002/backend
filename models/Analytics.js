const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  users: {
    totalUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    newSignups: { type: Number, default: 0 },
    freelancers: { type: Number, default: 0 },
    clients: { type: Number, default: 0 },
    verifiedUsers: { type: Number, default: 0 }
  },
  jobs: {
    totalJobs: { type: Number, default: 0 },
    jobsPosted: { type: Number, default: 0 },
    jobsCompleted: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    avgJobValue: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 }
  },
  financial: {
    totalRevenue: { type: Number, default: 0 },
    dailyRevenue: { type: Number, default: 0 },
    platformFees: { type: Number, default: 0 },
    escrowBalance: { type: Number, default: 0 },
    payoutsProcessed: { type: Number, default: 0 },
    avgTransactionValue: { type: Number, default: 0 }
  },
  engagement: {
    totalMessages: { type: Number, default: 0 },
    activeConversations: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    jobViews: { type: Number, default: 0 }
  },
  quality: {
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    disputesOpened: { type: Number, default: 0 },
    disputesResolved: { type: Number, default: 0 },
    avgResolutionTime: { type: Number, default: 0 }
  },
  categories: [{
    name: String,
    jobCount: Number,
    revenue: Number,
    avgRating: Number
  }],
  security: {
    suspiciousLogins: { type: Number, default: 0 },
    fraudAlerts: { type: Number, default: 0 },
    verificationsPending: { type: Number, default: 0 },
    accountsSuspended: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for efficient date queries
analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);