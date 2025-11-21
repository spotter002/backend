const mongoose = require('mongoose');

const toolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['writing', 'conversion', 'analysis', 'generator', 'checker'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

toolSchema.index({ slug: 1 });
toolSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Tool', toolSchema);