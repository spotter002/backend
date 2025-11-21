const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  deliveryTime: {
    type: Number, // in days
    required: true
  },
  proposal: {
    type: String,
    required: true
  },
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    deliveryDays: Number
  }],
  attachments: [String],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  isInstant: {
    type: Boolean,
    default: false
  },
  writerType: {
    type: String,
    enum: ['ESL', 'ENL'], // English as Second Language vs English Native Language
    default: 'ESL'
  },
  progressiveDelivery: {
    enabled: { type: Boolean, default: false },
    milestones: [{
      percentage: Number,
      description: String,
      dueDate: Date
    }]
  }
}, {
  timestamps: true
});

bidSchema.index({ jobId: 1, status: 1 });
bidSchema.index({ freelancerId: 1, status: 1 });

module.exports = mongoose.model('Bid', bidSchema);