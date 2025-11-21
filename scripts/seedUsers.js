const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingFreelancer = await User.findOne({ email: process.env.FREELANCER_EMAIL });
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (!existingFreelancer) {
      const freelancerPassword = await bcrypt.hash(process.env.FREELANCER_PASSWORD, 12);
      const freelancer = new User({
        name: 'Elijah Potter',
        email: process.env.FREELANCER_EMAIL,
        password: freelancerPassword,
        role: 'freelancer',
        isVerified: true
      });
      await freelancer.save();
      console.log('✅ Freelancer account created');
    } else {
      console.log('ℹ️ Freelancer account already exists');
    }

    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
      const admin = new User({
        name: 'Admin User',
        email: process.env.ADMIN_EMAIL,
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('✅ Admin account created');
    } else {
      console.log('ℹ️ Admin account already exists');
    }

    console.log('🎉 User seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedUsers();