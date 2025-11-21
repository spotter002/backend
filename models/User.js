const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'freelancer', 'admin'],
    required: true
  },
  profile: {
    photoUrl: String,
    bio: String,
    phone: String,
    country: String,
    profession: String,
    languages: [String],
    skills: [String],
    rates: String,
    visibility: { type: String, enum: ['public', 'clients-only', 'private'], default: 'public' },
    showEarnings: { type: Boolean, default: false },
    showReviews: { type: Boolean, default: true },
    showOnlineStatus: { type: Boolean, default: true },
    allowDirectContact: { type: Boolean, default: true },
    portfolio: [{
      title: String,
      url: String,
      type: String,
      thumbnail: String
    }],
    contactLinks: {
      email: String,
      whatsapp: String,
      website: String,
      linkedin: String,
      twitter: String
    },
    verification: {
      isVerified: { type: Boolean, default: false },
      nationalId: String,
      certificates: [String],
      skillTests: [{
        skill: String,
        score: Number,
        completedAt: Date
      }],
      verifiedAt: Date,
      writerTier: {
        type: String,
        enum: ['ESL', 'ENL', 'premium'],
        default: 'ESL'
      },
      englishTest: {
        score: Number,
        completedAt: Date,
        certificate: String
      },
      degreeVerification: {
        verified: { type: Boolean, default: false },
        degree: String,
        institution: String,
        year: Number,
        certificate: String
      },
      samples: [{
        title: String,
        category: String,
        fileUrl: String,
        approved: { type: Boolean, default: false }
      }]
    }
  },
  statistics: {
    totalEarnings: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    jobsCompleted: { type: Number, default: 0 },
    jobsPosted: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 }, // in hours
    profileViews: { type: Number, default: 0 },
    lastActive: Date
  },
  preferences: {
    emailNotifications: {
      jobUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      systemUpdates: { type: Boolean, default: true }
    },
    pushNotifications: {
      jobUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    smsNotifications: {
      payments: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
      urgent: { type: Boolean, default: false }
    },
    soundNotifications: {
      enabled: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      notifications: { type: Boolean, default: false }
    },
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '22:00' },
      end: { type: String, default: '08:00' }
    },
    theme: {
      mode: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      accentColor: { type: String, default: '#0d9488' },
      layout: { type: String, enum: ['compact', 'comfortable'], default: 'comfortable' },
      language: { type: String, default: 'en' },
      sidebarCollapsed: { type: Boolean, default: false }
    },
    categories: [String],
    minBudget: Number,
    maxBudget: Number
  },
  paymentMethods: [{
    type: { type: String, enum: ['mpesa', 'airtel', 'bank', 'paypal', 'stripe', 'crypto'] },
    phoneNumber: String,
    accountNumber: String,
    bankName: String,
    paypalEmail: String,
    cryptoAddress: String,
    cryptoType: { type: String, enum: ['BTC', 'USDT', 'ETH'] },
    isDefault: { type: Boolean, default: false }
  }],
  escrowSettings: {
    autoRelease: { type: Boolean, default: false },
    releaseDelay: { type: Number, default: 24 }, // hours
    disputeProtection: { type: Boolean, default: true }
  },
  writerSettings: {
    payoutSchedule: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    minimumPayout: {
      type: Number,
      default: 1000
    },
    preferredCategories: [String],
    workingHours: {
      start: String,
      end: String,
      timezone: String
    },
    maxActiveOrders: {
      type: Number,
      default: 5
    }
  },
  withdrawalSettings: {
    autoWithdraw: { type: Boolean, default: false },
    threshold: { type: Number, default: 5000 },
    schedule: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' }
  },
  taxInfo: {
    kraPin: String,
    vatNumber: String,
    businessName: String
  },
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ['sms', 'email', 'app'], default: 'sms' },
    loginHistory: [{
      device: String,
      location: String,
      ip: String,
      timestamp: { type: Date, default: Date.now },
      success: { type: Boolean, default: true }
    }],
    activeSessions: [{
      sessionId: String,
      device: String,
      location: String,
      lastActive: { type: Date, default: Date.now }
    }]
  }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ 'profile.visibility': 1 });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  const hashedPassword = this.password || this.passwordHash;
  if (!hashedPassword) {
    return false;
  }
  return bcrypt.compare(password, hashedPassword);
};

module.exports = mongoose.model('User', userSchema);