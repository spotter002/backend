const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const invoiceRoutes = require('./routes/invoices');
const messageRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');
const contractRoutes = require('./routes/contracts');
const paymentRoutes = require('./routes/payments');
const reviewRoutes = require('./routes/reviews');
const disputeRoutes = require('./routes/disputes');
const withdrawalRoutes = require('./routes/withdrawals');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');
const samplesRoutes = require('./routes/samples');
const bidsRoutes = require('./routes/bids');
const toolsRoutes = require('./routes/tools');
const blogRoutes = require('./routes/blog');
const contactRoutes = require('./routes/contact');
const notificationsRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);
// Build allowed origins from env
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://prime-quill-academy.vercel.app'
].filter(Boolean).map(s => s.trim());

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/freelance-marketplace')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('🔗 Database:', process.env.MONGODB_URI?.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Make sure MongoDB is running on port 27017');
  });

// Socket.IO for real-time messaging
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('user-connected', (userData) => {
    connectedUsers.set(socket.id, userData);
    console.log(`${userData.name} (${userData.role}) connected`);
  });
  
  socket.on('send-message', (message) => {
    // Broadcast message to all connected users except sender
    socket.broadcast.emit('receive-message', message);
    console.log('Message sent:', message.text);
  });
  
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log(`${user.name} disconnected`);
      connectedUsers.delete(socket.id);
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/samples', samplesRoutes);
app.use('/api/bids', bidsRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/blog', blogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log('\n🚀 Server Status:');
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 Socket.IO enabled`);
  const apiBase = process.env.BACKEND_URL || `http://localhost:${PORT}`;
  console.log(`🔗 API Base: ${apiBase}/api`);
  console.log('\n📋 Available Routes:');
  console.log('   /api/auth - Authentication');
  console.log('   /api/jobs - Job management');
  console.log('   /api/applications - Applications');
  console.log('   /api/contracts - Contract management');
  console.log('   /api/payments - Payment processing');
  console.log('   /api/reviews - Rating system');
  console.log('   /api/disputes - Dispute resolution');
  console.log('   /api/withdrawals - Freelancer payouts');
  console.log('   /api/notifications - System notifications');
  console.log('   /api/invoices - Invoice management');
  console.log('   /api/messages - Real-time messaging');
  console.log('   /api/analytics - Dashboard statistics');
  console.log('   /api/admin - Admin panel');
  console.log('   /api/ai - AI services');
  console.log('   /api/settings - User & platform settings');
  console.log('   /api/samples - Work samples showcase');
  console.log('   /api/bids - Bidding system');
  console.log('   /api/tools - Free tools (word counter, etc.)');
  console.log('   /api/blog - Content marketing blog\n');
});

module.exports = { app, io };