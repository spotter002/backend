const mongoose = require('mongoose');
const Tool = require('../models/Tool');
const BlogPost = require('../models/BlogPost');
const Sample = require('../models/Sample');
require('dotenv').config();

const tools = [
  {
    name: 'Word Counter',
    slug: 'word-counter',
    description: 'Count words, characters, paragraphs, and estimate reading time',
    category: 'analysis',
    isActive: true
  },
  {
    name: 'Words to Pages Converter',
    slug: 'words-to-pages',
    description: 'Convert word count to page count based on formatting',
    category: 'conversion',
    isActive: true
  },
  {
    name: 'Thesis Statement Generator',
    slug: 'thesis-generator',
    description: 'Generate thesis statements for academic papers',
    category: 'generator',
    isActive: true
  },
  {
    name: 'Reading Time Calculator',
    slug: 'reading-time',
    description: 'Calculate estimated reading time for any text',
    category: 'analysis',
    isActive: true
  },
  {
    name: 'Price Calculator',
    slug: 'price-calculator',
    description: 'Calculate project pricing based on requirements',
    category: 'analysis',
    isActive: true
  },
  {
    name: 'AI Detection Tool',
    slug: 'ai-detector',
    description: 'Detect AI-generated content in text',
    category: 'checker',
    isActive: true
  },
  {
    name: 'Plagiarism Checker',
    slug: 'plagiarism-checker',
    description: 'Check for plagiarism in documents',
    category: 'checker',
    isActive: true
  }
];

const blogPosts = [
  {
    title: 'How to Write a Perfect Thesis Statement',
    slug: 'how-to-write-perfect-thesis-statement',
    excerpt: 'Learn the essential elements of crafting a compelling thesis statement that will anchor your academic paper.',
    content: `A thesis statement is the backbone of any academic paper. It presents your main argument and guides the entire structure of your work.

## What Makes a Good Thesis Statement?

1. **Clear and Specific**: Your thesis should make a specific claim, not a general observation
2. **Arguable**: It should present a position that others might disagree with
3. **Focused**: Keep it narrow enough to be thoroughly supported in your paper

## Steps to Write a Thesis Statement

### 1. Start with a Question
Begin by asking a question about your topic. For example: "How does social media affect teenage mental health?"

### 2. Take a Position
Answer your question with a clear stance: "Social media negatively impacts teenage mental health by increasing anxiety and depression."

### 3. Add Supporting Reasons
Expand your position with specific reasons: "Social media negatively impacts teenage mental health by increasing anxiety through constant comparison and depression through cyberbullying."

## Common Mistakes to Avoid

- Making it too broad or vague
- Simply stating facts instead of making an argument
- Using weak language like "I think" or "maybe"
- Placing it anywhere other than the end of your introduction

## Examples of Strong Thesis Statements

**Weak**: "Social media is bad for teenagers."
**Strong**: "Social media platforms contribute to teenage depression by promoting unrealistic beauty standards, facilitating cyberbullying, and disrupting healthy sleep patterns."

Remember, your thesis statement should be a roadmap for your entire paper. Every paragraph should relate back to and support your main argument.`,
    category: 'writing',
    tags: ['thesis', 'academic writing', 'essay tips'],
    status: 'published',
    seoTitle: 'How to Write a Perfect Thesis Statement - Complete Guide',
    seoDescription: 'Master the art of writing compelling thesis statements with our step-by-step guide. Includes examples and common mistakes to avoid.',
    seoKeywords: ['thesis statement', 'academic writing', 'essay writing', 'writing tips'],
    readTime: 5,
    publishedAt: new Date()
  },
  {
    title: 'APA vs MLA: Complete Citation Guide',
    slug: 'apa-vs-mla-citation-guide',
    excerpt: 'Understand the key differences between APA and MLA citation styles and when to use each format.',
    content: `Citation styles can be confusing, but understanding the differences between APA and MLA is crucial for academic success.

## When to Use Each Style

### APA (American Psychological Association)
- Psychology, Education, Sciences
- Social Sciences
- Business and Economics

### MLA (Modern Language Association)
- Literature and Language Arts
- Humanities
- Cultural Studies

## Key Differences

### In-Text Citations

**APA**: (Smith, 2023, p. 15)
**MLA**: (Smith 15)

### Reference Page vs Works Cited

**APA**: References page with hanging indent
**MLA**: Works Cited page with hanging indent

### Author Names

**APA**: Last name, First initial. (2023)
**MLA**: Last name, First name. (2023)

## Quick Reference Guide

This guide will help you choose the right citation style and format your sources correctly for academic success.`,
    category: 'writing',
    tags: ['APA', 'MLA', 'citations', 'academic writing'],
    status: 'published',
    seoTitle: 'APA vs MLA Citation Guide - Complete Comparison',
    seoDescription: 'Learn the differences between APA and MLA citation styles with examples and formatting guidelines.',
    seoKeywords: ['APA citation', 'MLA citation', 'academic writing', 'bibliography'],
    readTime: 7,
    publishedAt: new Date()
  }
];

const samples = [
  {
    title: 'E-commerce Website Development',
    category: 'web_development',
    subcategory: 'Full Stack',
    description: 'Complete e-commerce solution built with React and Node.js, featuring payment integration, inventory management, and admin dashboard.',
    previewText: 'This project demonstrates a full-stack e-commerce application with modern technologies...',
    academicLevel: 'professional',
    pages: 15,
    words: 3500,
    tags: ['React', 'Node.js', 'E-commerce', 'Full Stack'],
    isPublic: true,
    rating: 4.8,
    ratingCount: 12
  },
  {
    title: 'Mobile Banking App UI/UX Design',
    category: 'mobile_apps',
    subcategory: 'UI/UX Design',
    description: 'Modern mobile banking application design with intuitive user interface and seamless user experience.',
    previewText: 'This mobile banking app design focuses on user-friendly interface and secure transactions...',
    academicLevel: 'professional',
    pages: 8,
    words: 2000,
    tags: ['Mobile Design', 'Banking', 'UI/UX', 'Fintech'],
    isPublic: true,
    rating: 4.9,
    ratingCount: 8
  },
  {
    title: 'AI-Powered Chatbot Development',
    category: 'programming',
    subcategory: 'AI/ML',
    description: 'Intelligent chatbot using natural language processing for customer service automation.',
    previewText: 'This AI chatbot leverages machine learning algorithms to provide intelligent responses...',
    academicLevel: 'professional',
    pages: 12,
    words: 2800,
    tags: ['AI', 'Chatbot', 'NLP', 'Machine Learning'],
    isPublic: true,
    rating: 4.7,
    ratingCount: 15
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Tool.deleteMany({});
    await BlogPost.deleteMany({});
    await Sample.deleteMany({});

    // Seed tools
    await Tool.insertMany(tools);
    console.log('✅ Tools seeded successfully');

    // Seed blog posts (you'll need to add a user ID for author)
    // For now, we'll skip blog posts as they need an author
    console.log('⚠️  Blog posts skipped - need author user ID');

    // Seed samples (you'll need to add a user ID for createdBy)
    // For now, we'll skip samples as they need a creator
    console.log('⚠️  Samples skipped - need creator user ID');

    console.log('🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();