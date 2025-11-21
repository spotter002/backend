const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: String,
  category: {
    type: String,
    enum: ['programming', 'web_development', 'mobile_apps', 'design', 'writing', 'marketing', 'tutorials', 'tips'],
    required: true
  },
  tags: [String],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  views: {
    type: Number,
    default: 0
  },
  readTime: Number, // in minutes
  publishedAt: Date
}, {
  timestamps: true
});

blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ tags: 1 });

module.exports = mongoose.model('BlogPost', blogPostSchema);