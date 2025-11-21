const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function fixUserPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'spotterwamai@gmail.com';
    const newPassword = process.env.FREELANCER_PASSWORD || 'spotter123.'; // Use env password
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('Current password:', user.password);
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the user
    await User.updateOne({ email }, { password: hashedPassword });
    
    console.log('Password updated successfully');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixUserPassword();