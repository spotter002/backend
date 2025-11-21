const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  originalIdea: {
    type: String,
    required: true
  },
  refinedIdea: String,
  finalDescription: String,
  milestones: [{
    title: String,
    description: String,
    dueDate: Date,
    amount: Number
  }],
  budgetMin: Number,
  budgetMax: Number,
  deadline: Date,
  attachments: [String],
  upgrades: {
    nda: { type: Boolean, default: false },
    ip: { type: Boolean, default: false },
    urgent: { type: Boolean, default: false },
    private: { type: Boolean, default: false }
  },
  status: {
    type: String,
    enum: ['new', 'open', 'applied', 'in_progress', 'completed', 'cancelled'],
    default: 'new'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  category: {
    type: String,
    enum: ['web_development', 'mobile_apps', 'design', 'writing', 'marketing', 'data_entry', 'programming', 'cybersecurity', 'ai_ml', 'game_dev', 'enterprise_systems', 'other'],
    default: 'other'
  },
  subcategory: String,
  programmingServices: {
    fullStack: { type: Boolean, default: false },
    backend: { type: Boolean, default: false },
    frontend: { type: Boolean, default: false },
    mobile: { type: Boolean, default: false },
    cloud: { type: Boolean, default: false },
    api: { type: Boolean, default: false },
    database: { type: Boolean, default: false },
    automation: { type: Boolean, default: false },
    security: { type: Boolean, default: false },
    aiMl: { type: Boolean, default: false },
    gameDev: { type: Boolean, default: false },
    enterprise: { type: Boolean, default: false }
  },
  academicLevel: {
    type: String,
    enum: ['high_school', 'undergraduate', 'masters', 'phd', 'professional']
  },
  pages: Number,
  words: Number,
  writerType: {
    type: String,
    enum: ['any', 'ESL', 'ENL']
  },
  biddingEnabled: {
    type: Boolean,
    default: false
  },
  instantOrder: {
    type: Boolean,
    default: false
  },
  progressiveDelivery: {
    enabled: { type: Boolean, default: false },
    milestones: [{
      percentage: Number,
      description: String,
      dueDate: Date
    }]
  },
  escrowEnabled: {
    type: Boolean,
    default: true
  },
  guarantees: {
    moneyBack: { type: Boolean, default: true },
    freeRevisions: { type: Boolean, default: true },
    plagiarismFree: { type: Boolean, default: true },
    confidentiality: { type: Boolean, default: true }
  },
  skills: [String],
  location: {
    type: String,
    enum: ['remote', 'nairobi', 'mombasa', 'kisumu', 'nakuru', 'other']
  },
  views: { type: Number, default: 0 },
  applicationsCount: { type: Number, default: 0 },
  avgProposalPrice: Number,
  timeToHire: Number, // in days
  completedAt: Date,
  archivedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);