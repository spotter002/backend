const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
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
  lineItems: [{
    desc: String,
    amount: Number,
    qty: { type: Number, default: 1 }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'paid', 'rejected'],
    default: 'pending'
  },
  pdfUrl: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);