const express = require('express');
const Sample = require('../models/Sample');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get all public samples
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 12, search } = req.query;
    const query = { isPublic: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const samples = await Sample.find(query)
      .populate('createdBy', 'name profile.photoUrl')
      .sort({ downloadCount: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Sample.countDocuments(query);
    
    res.json({
      samples,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sample by ID
router.get('/:id', async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id)
      .populate('createdBy', 'name profile.photoUrl profile.bio');
    
    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }
    
    // Increment download count
    sample.downloadCount += 1;
    await sample.save();
    
    res.json(sample);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new sample (admin/freelancer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const sampleData = {
      ...req.body,
      createdBy: req.user.id
    };
    
    const sample = new Sample(sampleData);
    await sample.save();
    
    res.status(201).json(sample);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update sample
router.put('/:id', auth, async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    
    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }
    
    if (sample.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    Object.assign(sample, req.body);
    await sample.save();
    
    res.json(sample);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete sample
router.delete('/:id', auth, async (req, res) => {
  try {
    const sample = await Sample.findById(req.params.id);
    
    if (!sample) {
      return res.status(404).json({ message: 'Sample not found' });
    }
    
    if (sample.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await sample.deleteOne();
    res.json({ message: 'Sample deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;