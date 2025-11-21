const express = require('express');
const Withdrawal = require('../models/Withdrawal');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Request withdrawal
router.post('/', auth, async (req, res) => {
  try {
    const { amount, method, accountDetails } = req.body;
    
    const fee = amount * 0.02; // 2% withdrawal fee
    const netAmount = amount - fee;
    
    const withdrawal = new Withdrawal({
      userId: req.user._id,
      amount,
      fee,
      netAmount,
      method,
      accountDetails
    });
    
    await withdrawal.save();
    res.status(201).json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user withdrawals
router.get('/', auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all withdrawals (admin)
router.get('/admin', auth, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process withdrawal (admin)
router.put('/:id/process', auth, async (req, res) => {
  try {
    const { status, transactionId, failureReason } = req.body;
    
    const updateData = { 
      status,
      processedAt: new Date()
    };
    
    if (transactionId) updateData.transactionId = transactionId;
    if (failureReason) updateData.failureReason = failureReason;
    
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(withdrawal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;