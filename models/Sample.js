const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['web_development', 'mobile_apps', 'design', 'writing', 'marketing', 'data_entry', 'programming', 'other'],
    required: true
  },
  subcategory: String,
  description: {
    type: String,
    required: true
  },
  fileUrl: String,
  thumbnailUrl: String,
  previewText: String,
  academicLevel: {
    type: String,
    enum: ['high_school', 'undergraduate', 'masters', 'phd', 'professional']
  },
  pages: Number,
  words: Number,
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

sampleSchema.index({ category: 1, isPublic: 1 });
sampleSchema.index({ tags: 1 });

module.exports = mongoose.model('Sample', sampleSchema);