const express = require('express');
const { runQuery } = require('../db');
const { optionalReader } = require('../middleware/requireReader');

const router = express.Router();

/**
 * GET /api/posts
 * List published posts with pagination and optional tag filter
 */
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const tag = req.query.tag || null;
  const offset = (page - 1) * limit;

  let total, posts;

  if (tag) {
    total = runQuery(
      `SELECT COUNT(*) as count FROM posts
       WHERE is_published = 1 AND tags LIKE $tagPattern`,
      { tagPattern: `%"${tag}"%` }
    );

    posts = runQuery(
      `SELECT id, title, slug, excerpt, tags, price, created_at, updated_at
       FROM posts
       WHERE is_published = 1 AND tags LIKE $tagPattern
       ORDER BY created_at DESC
       LIMIT $limit OFFSET $offset`,
      { tagPattern: `%"${tag}"%`, limit, offset }
    );
  } else {
    total = runQuery(
      'SELECT COUNT(*) as count FROM posts WHERE is_published = 1'
    );

    posts = runQuery(
      `SELECT id, title, slug, excerpt, tags, price, created_at, updated_at
       FROM posts WHERE is_published = 1
       ORDER BY created_at DESC LIMIT $limit OFFSET $offset`,
      { limit, offset }
    );
  }

  res.json({
    posts: posts.map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
    })),
    total: total[0].count,
    page,
    totalPages: Math.ceil(total[0].count / limit),
  });
});

/**
 * GET /api/posts/:slug
 * Get a single published post by slug.
 * Uses optionalReader middleware to check purchase status from JWT.
 */
router.get('/:slug', optionalReader, (req, res) => {
  const { slug } = req.params;

  const posts = runQuery(
    'SELECT * FROM posts WHERE slug = $slug AND is_published = 1',
    { slug }
  );

  if (posts.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const post = posts[0];

  // Check if reader has purchased this post
  let purchased = false;
  if (req.reader) {
    const purchases = runQuery(
      'SELECT id FROM purchases WHERE reader_id = $reader_id AND post_id = $post_id',
      { reader_id: req.reader.readerId, post_id: post.id }
    );
    purchased = purchases.length > 0;
  }

  // If the post is free (price = 0), treat as purchased
  if (post.price === 0) {
    purchased = true;
  }

  res.json({
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    paid_blocks: JSON.parse(post.paid_blocks || '[]'),
    purchased,
  });
});

module.exports = router;