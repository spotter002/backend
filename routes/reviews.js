const express = require('express');
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', auth, async (req, res) => {
  try {
    const { contractId, revieweeId, rating, comment, categories } = req.body;
    
    const review = new Review({
      contractId,
      reviewerId: req.user._id,
      revieweeId,
      rating,
      comment,
      categories
    });
    
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for user
router.get('/user/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ 
      revieweeId: req.params.userId,
      isPublic: true 
    })
    .populate('reviewerId', 'name')
    .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's review statistics
router.get('/stats/:userId', async (req, res) => {
  try {
    const reviews = await Review.find({ revieweeId: req.params.userId });
    
    const stats = {
      totalReviews: reviews.length,
      avgRating: reviews.length > 0 ? 
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
      ratingDistribution: {
        5: reviews.filter(r => r.rating === 5).length,
        4: reviews.filter(r => r.rating === 4).length,
        3: reviews.filter(r => r.rating === 3).length,
        2: reviews.filter(r => r.rating === 2).length,
        1: reviews.filter(r => r.rating === 1).length
      }
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;