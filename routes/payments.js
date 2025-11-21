const express = require('express');
const Payment = require('../models/Payment');
const Contract = require('../models/Contract');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Process payment
router.post('/', auth, async (req, res) => {
  try {
    const { invoiceId, contractId, amount, paymentMethod } = req.body;
    
    const contract = await Contract.findById(contractId);
    const platformFee = amount * 0.1; // 10% platform fee
    const netAmount = amount - platformFee;
    
    const payment = new Payment({
      invoiceId,
      contractId,
      payerId: req.user._id,
      recipientId: contract.freelancerId,
      amount,
      platformFee,
      netAmount,
      paymentMethod,
      status: 'processing'
    });
    
    await payment.save();
    
    // Simulate payment processing
    setTimeout(async () => {
      payment.status = 'completed';
      payment.processedAt = new Date();
      await payment.save();
    }, 2000);
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user payments
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.query.type === 'sent') {
      query.payerId = req.user._id;
    } else if (req.query.type === 'received') {
      query.recipientId = req.user._id;
    }
    
    const payments = await Payment.find(query)
      .populate('contractId')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Release escrow
router.put('/:id/release', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    payment.escrowStatus = 'released';
    payment.releasedAt = new Date();
    await payment.save();
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;