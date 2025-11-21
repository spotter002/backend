const Notification = require('../models/Notification');

class NotificationService {
  // Create notification
  static async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        data
      });
      
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }
  
  // Job-related notifications
  static async notifyJobPosted(clientId, jobId) {
    return this.createNotification(
      clientId,
      'job_posted',
      'Job Posted Successfully',
      'Your job has been posted and is now visible to freelancers.',
      { jobId }
    );
  }
  
  static async notifyApplicationReceived(clientId, applicationId, jobId) {
    return this.createNotification(
      clientId,
      'application_received',
      'New Application Received',
      'A freelancer has applied to your job.',
      { applicationId, jobId }
    );
  }
  
  static async notifyApplicationAccepted(freelancerId, applicationId, jobId) {
    return this.createNotification(
      freelancerId,
      'application_accepted',
      'Application Accepted!',
      'Congratulations! Your application has been accepted.',
      { applicationId, jobId }
    );
  }
  
  static async notifyApplicationRejected(freelancerId, applicationId, jobId) {
    return this.createNotification(
      freelancerId,
      'application_rejected',
      'Application Update',
      'Your application was not selected for this project.',
      { applicationId, jobId }
    );
  }
  
  // Payment notifications
  static async notifyPaymentReceived(freelancerId, amount, contractId) {
    return this.createNotification(
      freelancerId,
      'payment_received',
      'Payment Received',
      `You have received a payment of KSh ${amount.toLocaleString()}.`,
      { amount, contractId }
    );
  }
  
  static async notifyPaymentReleased(clientId, amount, contractId) {
    return this.createNotification(
      clientId,
      'payment_released',
      'Payment Released',
      `Payment of KSh ${amount.toLocaleString()} has been released to the freelancer.`,
      { amount, contractId }
    );
  }
  
  // Contract notifications
  static async notifyContractStarted(freelancerId, contractId) {
    return this.createNotification(
      freelancerId,
      'contract_started',
      'Project Started',
      'Your new project has officially started. Good luck!',
      { contractId }
    );
  }
  
  static async notifyContractCompleted(clientId, contractId) {
    return this.createNotification(
      clientId,
      'contract_completed',
      'Project Completed',
      'Your project has been marked as completed by the freelancer.',
      { contractId }
    );
  }
  
  // Review notifications
  static async notifyReviewReceived(revieweeId, rating, contractId) {
    return this.createNotification(
      revieweeId,
      'review_received',
      'New Review Received',
      `You received a ${rating}-star review for your work.`,
      { rating, contractId }
    );
  }
  
  // Dispute notifications
  static async notifyDisputeOpened(respondentId, disputeId) {
    return this.createNotification(
      respondentId,
      'dispute_opened',
      'Dispute Opened',
      'A dispute has been opened regarding your project.',
      { disputeId }
    );
  }
  
  // Deadline reminders
  static async notifyDeadlineReminder(userId, contractId, daysLeft) {
    return this.createNotification(
      userId,
      'deadline_reminder',
      'Deadline Reminder',
      `Your project deadline is in ${daysLeft} days.`,
      { contractId, daysLeft }
    );
  }
  
  // Bulk notifications
  static async sendBulkNotification(userIds, type, title, message, data = {}) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        data
      }));
      
      await Notification.insertMany(notifications);
      return notifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
    }
  }
}

module.exports = NotificationService;