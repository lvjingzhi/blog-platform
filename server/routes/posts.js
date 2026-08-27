const express = require('express');
const { runQuery } = require('../db');
const { optionalReader } = require('../middleware/requireReader');

const router = express.Router();

/**
 * GET /api/posts
 * List published posts with pagination, optional tag filter and title search
 */
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const tag = req.query.tag || null;
  const search = req.query.search ? String(req.query.search).trim() : null;
  const offset = (page - 1) * limit;

  const conditions = ['is_published = 1'];
  const params = {};

  if (tag) {
    conditions.push('tags LIKE $tagPattern');
    params.tagPattern = `%"${tag}"%`;
  }

  if (search) {
    conditions.push('(title LIKE $searchPattern OR excerpt LIKE $searchPattern)');
    params.searchPattern = `%${search}%`;
  }

  const where = conditions.join(' AND ');

  const total = runQuery(
    `SELECT COUNT(*) as count FROM posts WHERE ${where}`,
    params
  );

  const posts = runQuery(
    `SELECT id, title, slug, excerpt, tags, price, created_at, updated_at
     FROM posts WHERE ${where}
     ORDER BY created_at DESC LIMIT $limit OFFSET $offset`,
    { ...params, limit, offset }
  );

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