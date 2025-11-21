const express = require('express');
const Tool = require('../models/Tool');

const router = express.Router();

// Get all active tools
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    const tools = await Tool.find(query).sort({ usageCount: -1, name: 1 });
    res.json(tools);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get tool by slug
router.get('/:slug', async (req, res) => {
  try {
    const tool = await Tool.findOne({ slug: req.params.slug, isActive: true });
    
    if (!tool) {
      return res.status(404).json({ message: 'Tool not found' });
    }
    
    res.json(tool);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Word counter tool
router.post('/word-counter', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    
    // Update usage count
    await Tool.findOneAndUpdate(
      { slug: 'word-counter' },
      { $inc: { usageCount: 1 } }
    );
    
    res.json({
      words,
      characters,
      charactersNoSpaces,
      paragraphs,
      sentences,
      readingTime
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Words to pages converter
router.post('/words-to-pages', async (req, res) => {
  try {
    const { words, spacing = 'double', fontSize = 12 } = req.body;
    
    if (!words || words < 0) {
      return res.status(400).json({ message: 'Valid word count is required' });
    }
    
    let wordsPerPage;
    
    // Standard estimates
    if (spacing === 'single') {
      wordsPerPage = fontSize === 12 ? 500 : 450;
    } else {
      wordsPerPage = fontSize === 12 ? 250 : 225;
    }
    
    const pages = Math.ceil(words / wordsPerPage);
    
    await Tool.findOneAndUpdate(
      { slug: 'words-to-pages' },
      { $inc: { usageCount: 1 } }
    );
    
    res.json({
      words,
      pages,
      wordsPerPage,
      spacing,
      fontSize
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thesis statement generator
router.post('/thesis-generator', async (req, res) => {
  try {
    const { topic, position, reasons } = req.body;
    
    if (!topic || !position || !reasons || reasons.length < 2) {
      return res.status(400).json({ 
        message: 'Topic, position, and at least 2 reasons are required' 
      });
    }
    
    const reasonsList = reasons.slice(0, 3).join(', ');
    const thesis = `${topic.trim()} ${position.trim()} because ${reasonsList}.`;
    
    await Tool.findOneAndUpdate(
      { slug: 'thesis-generator' },
      { $inc: { usageCount: 1 } }
    );
    
    res.json({
      thesis,
      topic,
      position,
      reasons: reasons.slice(0, 3)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reading time calculator
router.post('/reading-time', async (req, res) => {
  try {
    const { text, wpm = 200 } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
    const minutes = Math.ceil(words / wpm);
    
    await Tool.findOneAndUpdate(
      { slug: 'reading-time' },
      { $inc: { usageCount: 1 } }
    );
    
    res.json({
      words,
      minutes,
      wpm,
      formattedTime: minutes === 1 ? '1 minute' : `${minutes} minutes`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Price calculator
router.post('/price-calculator', async (req, res) => {
  try {
    const { 
      pages = 1, 
      academicLevel = 'undergraduate', 
      deadline = 7, 
      writerType = 'ESL',
      urgentDeadline = 24 
    } = req.body;
    
    // Base prices per page in KSh
    const basePrices = {
      high_school: { ESL: 800, ENL: 1200 },
      undergraduate: { ESL: 1000, ENL: 1500 },
      masters: { ESL: 1300, ENL: 1800 },
      phd: { ESL: 1600, ENL: 2200 },
      professional: { ESL: 1400, ENL: 1900 }
    };
    
    let basePrice = basePrices[academicLevel]?.[writerType] || basePrices.undergraduate.ESL;
    
    // Deadline multiplier
    let deadlineMultiplier = 1;
    if (deadline <= 6) deadlineMultiplier = 1.5;
    if (deadline <= 12) deadlineMultiplier = 1.3;
    if (deadline <= urgentDeadline) deadlineMultiplier = 2;
    
    const totalPrice = Math.round(basePrice * pages * deadlineMultiplier);
    const pricePerPage = Math.round(totalPrice / pages);
    
    await Tool.findOneAndUpdate(
      { slug: 'price-calculator' },
      { $inc: { usageCount: 1 } }
    );
    
    res.json({
      pages,
      academicLevel,
      deadline,
      writerType,
      basePrice,
      deadlineMultiplier,
      pricePerPage,
      totalPrice,
      currency: 'KSh'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;