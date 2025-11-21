const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  freelancerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled', 'disputed'],
    default: 'active'
  },
  agreedPrice: {
    type: Number,
    required: true
  },
  agreedDeadline: {
    type: Date,
    required: true
  },
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'approved'],
      default: 'pending'
    },
    completedAt: Date
  }],
  deliverables: [{
    title: String,
    description: String,
    fileUrl: String,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'submitted', 'approved', 'rejected'],
      default: 'pending'
    }
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  totalPaid: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contract', contractSchema);