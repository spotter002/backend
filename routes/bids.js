const express = require('express');
const Bid = require('../models/Bid');
const Job = require('../models/Job');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get bids for a job
router.get('/job/:jobId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    // Only job owner can see all bids
    if (job.clientId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const bids = await Bid.find({ jobId: req.params.jobId })
      .populate('freelancerId', 'name profile.photoUrl profile.bio profile.verification statistics')
      .sort({ amount: 1, createdAt: -1 });
    
    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get freelancer's bids
router.get('/my-bids', auth, async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const { status, page = 1, limit = 10 } = req.query;
    const query = { freelancerId: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    const bids = await Bid.find(query)
      .populate('jobId', 'title category budgetMin budgetMax deadline status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Bid.countDocuments(query);
    
    res.json({
      bids,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a bid
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancers can place bids' });
    }
    
    const { jobId, amount, deliveryTime, proposal, milestones, writerType, progressiveDelivery } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for bidding' });
    }
    
    // Check if freelancer already bid on this job
    const existingBid = await Bid.findOne({ jobId, freelancerId: req.user.id });
    if (existingBid) {
      return res.status(400).json({ message: 'You have already placed a bid on this job' });
    }
    
    const bid = new Bid({
      jobId,
      freelancerId: req.user.id,
      amount,
      deliveryTime,
      proposal,
      milestones,
      writerType,
      progressiveDelivery
    });
    
    await bid.save();
    await bid.populate('freelancerId', 'name profile.photoUrl profile.bio profile.verification statistics');
    
    res.status(201).json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update bid
router.put('/:id', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    
    if (bid.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update bid that is not pending' });
    }
    
    Object.assign(bid, req.body);
    await bid.save();
    
    res.json(bid);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Accept bid (client only)
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('jobId');
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    
    if (bid.jobId.clientId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Bid is not pending' });
    }
    
    // Accept the bid
    bid.status = 'accepted';
    await bid.save();
    
    // Update job status and reject other bids
    await Job.findByIdAndUpdate(bid.jobId._id, { status: 'in_progress' });
    await Bid.updateMany(
      { jobId: bid.jobId._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    );
    
    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Withdraw bid
router.put('/:id/withdraw', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    
    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }
    
    if (bid.freelancerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    if (bid.status !== 'pending') {
      return res.status(400).json({ message: 'Can only withdraw pending bids' });
    }
    
    bid.status = 'withdrawn';
    await bid.save();
    
    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;