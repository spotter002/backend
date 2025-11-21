const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  payerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  platformFee: {
    type: Number,
    required: true
  },
  netAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'airtel_money', 'bank_transfer', 'paypal', 'stripe'],
    required: true
  },
  transactionId: String,
  gatewayResponse: mongoose.Schema.Types.Mixed,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  escrowStatus: {
    type: String,
    enum: ['held', 'released', 'disputed'],
    default: 'held'
  },
  processedAt: Date,
  releasedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);