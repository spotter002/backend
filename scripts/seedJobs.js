const mongoose = require('mongoose');
require('dotenv').config();

const Job = require('../models/Job');
const User = require('../models/User');

const seedJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find a client user to assign jobs to
    let client = await User.findOne({ role: 'client' });
    
    if (!client) {
      // Create a sample client if none exists
      const bcrypt = require('bcryptjs');
      const clientPassword = await bcrypt.hash('password123', 12);
      client = new User({
        name: 'Sample Client',
        email: 'client@example.com',
        password: clientPassword,
        role: 'client',
        isVerified: true
      });
      await client.save();
      console.log('✅ Sample client created');
    }

    // Check if jobs already exist
    const existingJobs = await Job.countDocuments();
    
    if (existingJobs === 0) {
      const sampleJobs = [
        {
          clientId: client._id,
          title: 'Modern E-commerce Website Development',
          originalIdea: 'Need a modern e-commerce website with payment integration and admin panel',
          finalDescription: 'Looking for an experienced developer to build a modern e-commerce website with React/Next.js frontend, Node.js backend, payment gateway integration, and comprehensive admin panel.',
          budgetMin: 50000,
          budgetMax: 100000,
          status: 'open',
          visibility: 'public',
          category: 'web_development',
          skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration'],
          upgrades: { urgent: false, private: false, nda: false, ip: false }
        },
        {
          clientId: client._id,
          title: 'Mobile App UI/UX Design',
          originalIdea: 'Design a modern mobile app interface for a fitness tracking application',
          finalDescription: 'Seeking a talented UI/UX designer to create a modern, intuitive mobile app design for a fitness tracking application. Must include wireframes, mockups, and interactive prototypes.',
          budgetMin: 25000,
          budgetMax: 50000,
          status: 'open',
          visibility: 'public',
          category: 'design',
          skills: ['UI/UX Design', 'Figma', 'Mobile Design', 'Prototyping'],
          upgrades: { urgent: false, private: false, nda: false, ip: false }
        },
        {
          clientId: client._id,
          title: 'Content Writing for Tech Blog',
          originalIdea: 'Need high-quality articles about emerging technologies and programming tutorials',
          finalDescription: 'Looking for an experienced tech writer to create engaging, well-researched articles about emerging technologies, programming tutorials, and industry trends. Must have strong technical background.',
          budgetMin: 15000,
          budgetMax: 30000,
          status: 'open',
          visibility: 'public',
          category: 'writing',
          skills: ['Technical Writing', 'SEO', 'Programming Knowledge', 'Research'],
          upgrades: { urgent: false, private: false, nda: false, ip: false }
        },
        {
          clientId: client._id,
          title: 'Python Data Analysis Script',
          originalIdea: 'Automate data processing and generate reports from CSV files',
          finalDescription: 'Need a Python developer to create automated data analysis scripts that process CSV files, perform statistical analysis, and generate comprehensive reports with visualizations.',
          budgetMin: 20000,
          budgetMax: 40000,
          status: 'open',
          visibility: 'public',
          category: 'programming',
          skills: ['Python', 'Pandas', 'Data Analysis', 'Matplotlib'],
          upgrades: { urgent: false, private: false, nda: false, ip: false }
        },
        {
          clientId: client._id,
          title: 'Digital Marketing Campaign',
          originalIdea: 'Create and manage social media marketing campaign for startup',
          finalDescription: 'Seeking a digital marketing expert to create and manage a comprehensive social media marketing campaign for a tech startup. Includes content creation, ad management, and analytics.',
          budgetMin: 30000,
          budgetMax: 60000,
          status: 'open',
          visibility: 'public',
          category: 'marketing',
          skills: ['Social Media Marketing', 'Content Creation', 'Google Ads', 'Analytics'],
          upgrades: { urgent: false, private: false, nda: false, ip: false }
        },
        {
          clientId: client._id,
          title: 'Cybersecurity Assessment',
          originalIdea: 'Conduct security audit and penetration testing for web application',
          finalDescription: 'Looking for a cybersecurity expert to conduct comprehensive security assessment including vulnerability scanning, penetration testing, and security recommendations for our web application.',
          budgetMin: 75000,
          budgetMax: 150000,
          status: 'open',
          visibility: 'public',
          category: 'cybersecurity',
          skills: ['Penetration Testing', 'Security Audit', 'Vulnerability Assessment', 'OWASP'],
          upgrades: { urgent: true, private: false, nda: true, ip: false }
        }
      ];

      await Job.insertMany(sampleJobs);
      console.log(`✅ Created ${sampleJobs.length} sample jobs`);
    } else {
      console.log(`ℹ️ ${existingJobs} jobs already exist in database`);
    }

    console.log('🎉 Job seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Job seeding failed:', error);
    process.exit(1);
  }
};

seedJobs();