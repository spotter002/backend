const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Get user settings
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const settings = {
      profile: {
        name: user.name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        country: user.profile?.country || '',
        bio: user.profile?.bio || '',
        photoUrl: user.profile?.photoUrl || '',
        skills: user.profile?.skills || [],
        rates: user.profile?.rates || '',
        contactLinks: user.profile?.contactLinks || {}
      },
      notifications: {
        emailNotifications: user.preferences?.emailNotifications || {
          jobUpdates: true,
          messages: true,
          payments: true,
          marketing: false,
          systemUpdates: true
        },
        pushNotifications: user.preferences?.pushNotifications || {
          jobUpdates: true,
          messages: true,
          payments: true,
          marketing: false
        },
        smsNotifications: user.preferences?.smsNotifications || {
          payments: true,
          security: true,
          urgent: false
        },
        soundNotifications: user.preferences?.soundNotifications || {
          enabled: true,
          messages: true,
          notifications: false
        },
        quietHours: user.preferences?.quietHours || {
          enabled: false,
          start: '22:00',
          end: '08:00'
        }
      },
      privacy: {
        profileVisibility: user.profile?.visibility || 'public',
        showEarnings: user.profile?.showEarnings || false,
        showReviews: user.profile?.showReviews !== false
      },
      paymentMethods: user.paymentMethods || [],
      theme: user.preferences?.theme || {
        mode: 'light',
        accentColor: '#0d9488',
        layout: 'comfortable',
        language: 'en',
        sidebarCollapsed: false
      }
    };

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/user', auth, async (req, res) => {
  try {
    const { section, data } = req.body;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    switch (section) {
      case 'profile':
        user.name = data.name || user.name;
        user.email = data.email || user.email;
        if (!user.profile) user.profile = {};
        user.profile = {
          ...user.profile,
          phone: data.phone,
          country: data.country,
          bio: data.bio,
          photoUrl: data.photoUrl,
          skills: data.skills || [],
          rates: data.rates,
          contactLinks: data.contactLinks || {}
        };
        break;

      case 'notifications':
        if (!user.preferences) user.preferences = {};
        {
          const d = data || {};

          // emailNotifications
          if (typeof d.emailNotifications === 'object' && d.emailNotifications !== null) {
            user.preferences.emailNotifications = {
              ...user.preferences.emailNotifications,
              ...d.emailNotifications
            };
          } else if (!user.preferences.emailNotifications) {
            user.preferences.emailNotifications = {
              jobUpdates: true,
              messages: true,
              payments: true,
              marketing: false,
              systemUpdates: true
            };
          }

          // pushNotifications
          if (typeof d.pushNotifications === 'object' && d.pushNotifications !== null) {
            user.preferences.pushNotifications = {
              ...user.preferences.pushNotifications,
              ...d.pushNotifications
            };
          } else if (!user.preferences.pushNotifications) {
            user.preferences.pushNotifications = {
              jobUpdates: true,
              messages: true,
              payments: true,
              marketing: false
            };
          }

          // smsNotifications
          if (typeof d.smsNotifications === 'object' && d.smsNotifications !== null) {
            user.preferences.smsNotifications = {
              ...user.preferences.smsNotifications,
              ...d.smsNotifications
            };
          } else if (!user.preferences.smsNotifications) {
            user.preferences.smsNotifications = {
              payments: true,
              security: true,
              urgent: false
            };
          }

          // soundNotifications
          if (typeof d.soundNotifications === 'object' && d.soundNotifications !== null) {
            user.preferences.soundNotifications = {
              ...user.preferences.soundNotifications,
              ...d.soundNotifications
            };
          } else if (!user.preferences.soundNotifications) {
            user.preferences.soundNotifications = {
              enabled: true,
              messages: true,
              notifications: false
            };
          }

          // quietHours
          if (typeof d.quietHours === 'object' && d.quietHours !== null) {
            user.preferences.quietHours = {
              ...user.preferences.quietHours,
              ...d.quietHours
            };
          } else if (!user.preferences.quietHours) {
            user.preferences.quietHours = {
              enabled: false,
              start: '22:00',
              end: '08:00'
            };
          }
        }
        break;

      case 'privacy':
        if (!user.profile) user.profile = {};
        user.profile = {
          ...user.profile,
          visibility: data.profileVisibility,
          showEarnings: data.showEarnings,
          showReviews: data.showReviews
        };
        break;

      case 'payment':
        user.paymentMethods = data.paymentMethods || [];
        break;

      case 'theme':
        if (!user.preferences) user.preferences = {};
        {
          const d = data || {};
          user.preferences.theme = {
            mode: typeof d.mode !== 'undefined' ? d.mode : (user.preferences.theme?.mode || 'light'),
            accentColor: typeof d.accentColor !== 'undefined' ? d.accentColor : (user.preferences.theme?.accentColor || '#0d9488'),
            layout: typeof d.layout !== 'undefined' ? d.layout : (user.preferences.theme?.layout || 'comfortable'),
            language: typeof d.language !== 'undefined' ? d.language : (user.preferences.theme?.language || 'en'),
            sidebarCollapsed: typeof d.sidebarCollapsed !== 'undefined' ? d.sidebarCollapsed : (user.preferences.theme?.sidebarCollapsed || false)
          };
        }
        break;

      default:
        return res.status(400).json({ message: 'Invalid settings section' });
    }

    await user.save();
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Platform settings (Admin only)
router.get('/platform', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // TODO: Implement platform settings model
    const platformSettings = {
      platform: {
        name: 'FreelanceHub',
        tagline: 'AI-Powered Freelance Marketplace',
        description: 'Connect with skilled freelancers worldwide'
      },
      financial: {
        commission: { global: 10 },
        withdrawal: { minAmount: 1000, maxAmount: 100000 }
      },
      security: {
        rateLimit: { enabled: true, requests: 100, window: 15 },
        sessionTimeout: 24
      }
    };

    res.json({ settings: platformSettings });
  } catch (error) {
    console.error('Error fetching platform settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update platform settings (Admin only)
router.put('/platform', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { section, data } = req.body;
    
    // TODO: Implement platform settings update logic
    console.log('Updating platform settings:', section, data);
    
    res.json({ message: 'Platform settings updated successfully' });
  } catch (error) {
    console.error('Error updating platform settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;