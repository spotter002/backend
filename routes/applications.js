const express = require('express');
const Application = require('../models/Application');
const Invoice = require('../models/Invoice');
const Job = require('../models/Job');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Apply to job
router.post('/:jobId/apply', auth, requireRole(['freelancer']), async (req, res) => {
  try {
    const { quoteAmount, deliveryDays, coverLetter, attachments, portfolioLinks } = req.body;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId).populate('clientId');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      freelancerId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }

    // Create application
    const application = new Application({
      jobId,
      freelancerId: req.user._id,
      quoteAmount,
      deliveryDays,
      coverLetter,
      attachments: attachments || [],
      portfolioLinks: portfolioLinks || []
    });

    await application.save();

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    res.status(201).json({
      success: true,
      application
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get applications for a job (client view)
router.get('/:jobId/applications', auth, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check permissions
    if (job.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const applications = await Application.find({ jobId })
      .populate('freelancerId', 'name email profile')
      .populate('invoiceId')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get freelancer's applications
router.get('/my-applications', auth, requireRole(['freelancer']), async (req, res) => {
  try {
    const applications = await Application.find({ freelancerId: req.user._id })
      .populate('jobId')
      .populate('invoiceId')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get applications by freelancer ID
router.get('/freelancer/:freelancerId', auth, async (req, res) => {
  try {
    const applications = await Application.find({ freelancerId: req.params.freelancerId })
      .populate('jobId')
      .populate('invoiceId')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update application status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('jobId')
      .populate('invoiceId');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check permissions (client can approve/reject)
    if (application.jobId.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    application.status = status;
    await application.save();

    // Update job status
    if (status === 'approved') {
      application.jobId.status = 'in_progress';
      await application.jobId.save();
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;