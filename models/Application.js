const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quoteAmount: {
    type: Number,
    required: true
  },
  deliveryDays: {
    type: Number,
    required: true
  },
  coverLetter: {
    type: String,
    required: true
  },
  attachments: [String],
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  status: {
    type: String,
    enum: ['submitted', 'viewed', 'shortlisted', 'invoice_sent', 'approved', 'rejected'],
    default: 'submitted'
  },
  portfolioLinks: [String],
  viewedAt: Date,
  shortlistedAt: Date,
  respondedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);