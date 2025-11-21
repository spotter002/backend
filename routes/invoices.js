const express = require('express');
const Invoice = require('../models/Invoice');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get invoice by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .populate('jobId', 'title')
      .populate('applicationId');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check permissions
    if (invoice.clientId._id.toString() !== req.user._id.toString() && 
        invoice.freelancerId._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get PDF
router.get('/:id/pdf', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check permissions
    if (invoice.clientId.toString() !== req.user._id.toString() && 
        invoice.freelancerId.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!invoice.pdfUrl) {
      return res.status(404).json({ message: 'PDF not found' });
    }

    res.sendFile(invoice.pdfUrl, { root: '.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process payment (stub)
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Check permissions (only client can pay)
    if (invoice.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Stub payment processing
    invoice.status = 'paid';
    await invoice.save();

    res.json({ message: 'Payment processed successfully', invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's invoices
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'client') {
      query.clientId = req.user._id;
    } else if (req.user.role === 'freelancer') {
      query.freelancerId = req.user._id;
    }

    const invoices = await Invoice.find(query)
      .populate('clientId', 'name email')
      .populate('freelancerId', 'name email')
      .populate('jobId', 'title')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;