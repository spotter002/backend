const express = require('express');
const Dispute = require('../models/Dispute');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create dispute
router.post('/', auth, async (req, res) => {
  try {
    const { contractId, respondentId, category, title, description, evidence } = req.body;
    
    const dispute = new Dispute({
      contractId,
      initiatorId: req.user._id,
      respondentId,
      category,
      title,
      description,
      evidence: evidence || []
    });
    
    await dispute.save();
    res.status(201).json(dispute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's disputes
router.get('/', auth, async (req, res) => {
  try {
    const disputes = await Dispute.find({
      $or: [
        { initiatorId: req.user._id },
        { respondentId: req.user._id }
      ]
    })
    .populate('initiatorId', 'name')
    .populate('respondentId', 'name')
    .sort({ createdAt: -1 });
    
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all disputes (admin only)
router.get('/admin', auth, requireRole(['admin']), async (req, res) => {
  try {
    const disputes = await Dispute.find()
      .populate('initiatorId', 'name')
      .populate('respondentId', 'name')
      .populate('adminId', 'name')
      .sort({ createdAt: -1 });
    
    res.json(disputes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Assign admin to dispute
router.put('/:id/assign', auth, requireRole(['admin']), async (req, res) => {
  try {
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { 
        adminId: req.user._id,
        status: 'under_review'
      },
      { new: true }
    );
    
    res.json(dispute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resolve dispute
router.put('/:id/resolve', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { decision, reasoning, refundAmount } = req.body;
    
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      {
        status: 'resolved',
        resolution: {
          decision,
          reasoning,
          refundAmount,
          resolvedAt: new Date(),
          resolvedBy: req.user._id
        }
      },
      { new: true }
    );
    
    res.json(dispute);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;