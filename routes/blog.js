const express = require('express');
const BlogPost = require('../models/BlogPost');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all published blog posts
router.get('/', async (req, res) => {
  try {
    const { category, tag, page = 1, limit = 10, search } = req.query;
    const query = { status: 'published' };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const posts = await BlogPost.find(query)
      .populate('author', 'name profile.photoUrl')
      .select('-content')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await BlogPost.countDocuments(query);
    
    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get blog post by slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    }).populate('author', 'name profile.photoUrl profile.bio');
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get related posts
router.get('/:slug/related', async (req, res) => {
  try {
    const currentPost = await BlogPost.findOne({ 
      slug: req.params.slug, 
      status: 'published' 
    });
    
    if (!currentPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    const relatedPosts = await BlogPost.find({
      _id: { $ne: currentPost._id },
      status: 'published',
      $or: [
        { category: currentPost.category },
        { tags: { $in: currentPost.tags } }
      ]
    })
    .populate('author', 'name profile.photoUrl')
    .select('-content')
    .sort({ publishedAt: -1 })
    .limit(4);
    
    res.json(relatedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create blog post (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const postData = {
      ...req.body,
      author: req.user.id
    };
    
    // Generate slug from title if not provided
    if (!postData.slug) {
      postData.slug = postData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    
    // Set published date if status is published
    if (postData.status === 'published' && !postData.publishedAt) {
      postData.publishedAt = new Date();
    }
    
    const post = new BlogPost(postData);
    await post.save();
    
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update blog post
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    // Set published date if changing to published
    if (req.body.status === 'published' && post.status !== 'published') {
      req.body.publishedAt = new Date();
    }
    
    Object.assign(post, req.body);
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete blog post
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Blog post not found' });
    }
    
    await post.deleteOne();
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get popular tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    res.json(tags.map(tag => ({ name: tag._id, count: tag.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get categories with post counts
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json(categories.map(cat => ({ name: cat._id, count: cat.count })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;