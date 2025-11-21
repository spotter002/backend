const express = require('express');
const Message = require('../models/Message');
const Job = require('../models/Job');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, text, attachments } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if user is involved in this job
    const isClient = job.clientId.toString() === req.user._id.toString();
    const isFreelancer = req.user.role === 'freelancer'; // Simplified check
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const participants = [job.clientId];
    // Add freelancer if job has applications
    // For simplicity, we'll allow any freelancer to message about public jobs

    const message = new Message({
      jobId,
      participants,
      senderId: req.user._id,
      text,
      attachments: attachments || [],
      readBy: [req.user._id]
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name email');

    // Emit to socket room
    const { io } = require('../server');
    io.to(jobId).emit('new-message', populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a job
router.get('/', auth, async (req, res) => {
  try {
    const { jobId } = req.query;

    if (!jobId) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check permissions
    const isClient = job.clientId.toString() === req.user._id.toString();
    const isFreelancer = req.user.role === 'freelancer';
    const isAdmin = req.user.role === 'admin';

    if (!isClient && !isFreelancer && !isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ jobId })
      .populate('senderId', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!message.readBy.includes(req.user._id)) {
      message.readBy.push(req.user._id);
      await message.save();
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;