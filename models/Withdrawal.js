const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100 // Minimum withdrawal amount
  },
  fee: {
    type: Number,
    required: true
  },
  netAmount: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['mpesa', 'airtel_money', 'bank_transfer'],
    required: true
  },
  accountDetails: {
    phoneNumber: String,
    accountNumber: String,
    bankName: String,
    accountName: String
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  transactionId: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  processedAt: Date,
  failureReason: String,
  adminNotes: String
}, {
  timestamps: true
});

// Index for user queries
withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);