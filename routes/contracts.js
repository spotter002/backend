const express = require('express');
const Contract = require('../models/Contract');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create contract (when application is accepted)
router.post('/', auth, async (req, res) => {
  try {
    const { jobId, freelancerId, applicationId, agreedPrice, agreedDeadline, milestones } = req.body;
    
    const contract = new Contract({
      jobId,
      clientId: req.user._id,
      freelancerId,
      applicationId,
      agreedPrice,
      agreedDeadline,
      milestones: milestones || []
    });
    
    await contract.save();
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's contracts
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'freelancer') {
      query.freelancerId = req.user._id;
    } else if (req.user.role === 'client') {
      query.clientId = req.user._id;
    }
    
    const contracts = await Contract.find(query)
      .populate('jobId', 'title')
      .populate('clientId', 'name')
      .populate('freelancerId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update milestone status
router.put('/:id/milestone/:milestoneId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const contract = await Contract.findById(req.params.id);
    
    const milestone = contract.milestones.id(req.params.milestoneId);
    milestone.status = status;
    if (status === 'completed') {
      milestone.completedAt = new Date();
    }
    
    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Submit deliverable
router.post('/:id/deliverable', auth, async (req, res) => {
  try {
    const { title, description, fileUrl } = req.body;
    const contract = await Contract.findById(req.params.id);
    
    contract.deliverables.push({
      title,
      description,
      fileUrl,
      submittedAt: new Date(),
      status: 'submitted'
    });
    
    await contract.save();
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;