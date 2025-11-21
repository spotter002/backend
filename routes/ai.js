const express = require('express');
const aiService = require('../services/aiService');
const { auth } = require('../middleware/auth');

const router = express.Router();

// AI refinement endpoint
router.post('/refine', auth, async (req, res) => {
  try {
    const { ideaText, files, metadata } = req.body;

    if (!ideaText) {
      return res.status(400).json({ message: 'Idea text is required' });
    }

    const refinement = await aiService.refineJobIdea(ideaText, files);

    res.json({
      success: true,
      refinement,
      confidence: 0.85, // Mock confidence score
      processingTime: Date.now() - req.startTime || 1500
    });
  } catch (error) {
    console.error('AI refinement error:', error);
    res.status(500).json({ 
      message: 'AI refinement service temporarily unavailable',
      fallback: true
    });
  }
});

module.exports = router;