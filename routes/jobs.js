const express = require('express');
const Job = require('../models/Job');
const { auth, requireRole } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

// Create job with AI refinement
router.post('/', auth, async (req, res) => {
  try {
    const { title, originalIdea, category, budgetMin, budgetMax, attachments, upgrades } = req.body;

    // Create initial job
    const job = new Job({
      clientId: req.user._id,
      title,
      originalIdea,
      category: category || 'other',
      budgetMin: budgetMin || 0,
      budgetMax: budgetMax || 0,
      attachments: attachments || [],
      upgrades: upgrades || {}
    });

    // Get AI refinement with fallback
    let refinement;
    try {
      refinement = await aiService.refineJobIdea(originalIdea, attachments);
      job.refinedIdea = JSON.stringify(refinement);
      job.milestones = refinement.suggestedMilestones || [];
    } catch (aiError) {
      console.log('AI service failed, using fallback:', aiError.message);
      // Fallback refinement
      refinement = {
        refinedTitle: title,
        refinedDescription: originalIdea,
        suggestedMilestones: [
          { title: 'Project Planning', description: 'Define requirements and scope', estimatedDays: 2 },
          { title: 'Development', description: 'Core development work', estimatedDays: 7 },
          { title: 'Testing & Delivery', description: 'Testing and final delivery', estimatedDays: 3 }
        ],
        budgetRange: { min: budgetMin || 10000, max: budgetMax || 50000 },
        timelineEstimate: 14,
        clarifyingQuestions: ['What specific features are most important?', 'Do you have any design preferences?'],
        elevatorPitch: 'Custom project based on your requirements'
      };
      job.refinedIdea = JSON.stringify(refinement);
      job.milestones = refinement.suggestedMilestones;
    }

    // Automatically set job as open for immediate posting
    job.status = 'open';
    job.finalDescription = job.originalIdea;
    
    await job.save();

    res.status(201).json({
      job,
      refinement
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Confirm job posting (client accepts/rejects refinement)
router.put('/:id/confirm', auth, async (req, res) => {
  try {
    const { useRefinement } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job || job.clientId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (useRefinement && job.refinedIdea) {
      const refinement = JSON.parse(job.refinedIdea);
      job.finalDescription = refinement.refinedDescription;
      job.title = refinement.refinedTitle;
    } else {
      job.finalDescription = job.originalIdea;
    }

    job.status = 'open';
    job.visibility = job.upgrades.private ? 'private' : 'public';
    
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured jobs for landing page (public)
router.get('/featured', async (req, res) => {
  try {
    console.log('💼 Fetching featured jobs...');
    
    const jobs = await Job.find({ 
      status: 'open', 
      visibility: 'public' 
    })
      .populate('clientId', 'name')
      .select('title finalDescription budgetMin budgetMax createdAt upgrades')
      .sort({ createdAt: -1 })
      .limit(6);

    console.log(`✅ Found ${jobs.length} featured jobs`);
    res.json(jobs);
  } catch (error) {
    console.error('❌ Featured jobs error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get jobs (filtered by role and visibility)
router.get('/', auth, async (req, res) => {
  try {
    let query = { status: { $in: ['open', 'applied'] } };

    if (req.user.role === 'freelancer') {
      query.visibility = 'public';
    } else if (req.user.role === 'client') {
      query.clientId = req.user._id;
    }

    const jobs = await Job.find(query)
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single job
router.get('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('clientId', 'name email profile');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check visibility permissions
    if (job.visibility === 'private' && 
        job.clientId._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || (job.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job || (job.clientId.toString() !== req.user._id.toString() && req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Job not found or access denied' });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;