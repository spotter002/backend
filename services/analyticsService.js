const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Job = require('../models/Job');
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const Review = require('../models/Review');
const Dispute = require('../models/Dispute');

class AnalyticsService {
  // Generate daily analytics snapshot
  static async generateDailyAnalytics(date = new Date()) {
    try {
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      // User metrics
      const totalUsers = await User.countDocuments();
      const newSignups = await User.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      const freelancers = await User.countDocuments({ role: 'freelancer' });
      const clients = await User.countDocuments({ role: 'client' });
      const verifiedUsers = await User.countDocuments({ 'profile.verification.isVerified': true });
      
      // Job metrics
      const totalJobs = await Job.countDocuments();
      const jobsPosted = await Job.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      const activeJobs = await Job.countDocuments({ status: 'open' });
      const completedJobs = await Contract.countDocuments({ status: 'completed' });
      
      // Financial metrics
      const payments = await Payment.find({ 
        status: 'completed',
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      const dailyRevenue = payments.reduce((sum, p) => sum + p.platformFee, 0);
      const totalRevenue = await Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$platformFee' } } }
      ]);
      
      // Quality metrics
      const reviews = await Review.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      const avgRating = reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
      
      // Dispute metrics
      const disputesOpened = await Dispute.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      const disputesResolved = await Dispute.countDocuments({
        'resolution.resolvedAt': { $gte: startOfDay, $lte: endOfDay }
      });
      
      // Category performance
      const categories = await Job.aggregate([
        {
          $group: {
            _id: '$category',
            jobCount: { $sum: 1 },
            avgBudget: { $avg: '$budgetMax' }
          }
        }
      ]);
      
      const analyticsData = {
        date: startOfDay,
        users: {
          totalUsers,
          newSignups,
          freelancers,
          clients,
          verifiedUsers,
          activeUsers: totalUsers // Simplified - would need last activity tracking
        },
        jobs: {
          totalJobs,
          jobsPosted,
          activeJobs,
          jobsCompleted: completedJobs,
          avgJobValue: 0, // Calculate from job budgets
          completionRate: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0
        },
        financial: {
          totalRevenue: totalRevenue[0]?.total || 0,
          dailyRevenue,
          platformFees: dailyRevenue,
          escrowBalance: 0, // Calculate from active contracts
          payoutsProcessed: payments.length,
          avgTransactionValue: payments.length > 0 ? 
            payments.reduce((sum, p) => sum + p.amount, 0) / payments.length : 0
        },
        quality: {
          avgRating,
          totalReviews: reviews.length,
          disputesOpened,
          disputesResolved,
          avgResolutionTime: 0 // Calculate from resolved disputes
        },
        categories: categories.map(cat => ({
          name: cat._id,
          jobCount: cat.jobCount,
          revenue: cat.avgBudget * cat.jobCount * 0.1, // Estimated revenue
          avgRating: 0 // Would need to join with reviews
        }))
      };
      
      // Upsert analytics record
      await Analytics.findOneAndUpdate(
        { date: startOfDay },
        analyticsData,
        { upsert: true, new: true }
      );
      
      return analyticsData;
    } catch (error) {
      console.error('Error generating daily analytics:', error);
      throw error;
    }
  }
  
  // Get analytics for date range
  static async getAnalytics(startDate, endDate) {
    try {
      return await Analytics.find({
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: -1 });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }
  
  // Update user statistics
  static async updateUserStats(userId, updates) {
    try {
      await User.findByIdAndUpdate(userId, {
        $inc: updates,
        'statistics.lastActive': new Date()
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  }
  
  // Track job view
  static async trackJobView(jobId) {
    try {
      await Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });
    } catch (error) {
      console.error('Error tracking job view:', error);
    }
  }
}

module.exports = AnalyticsService;