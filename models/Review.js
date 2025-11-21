const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  revieweeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  categories: {
    communication: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  response: {
    comment: String,
    createdAt: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);