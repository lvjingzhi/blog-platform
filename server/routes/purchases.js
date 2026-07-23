const express = require('express');
const { runQuery, runInsert, now } = require('../db');
const { requireReader } = require('../middleware/requireReader');

const router = express.Router();

/**
 * POST /api/purchases
 * Simulate purchasing a post. Requires reader authentication.
 * Body: { post_id }
 */
router.post('/', requireReader, (req, res) => {
  const { post_id } = req.body;
  const readerId = req.reader.readerId;

  if (!post_id) {
    return res.status(400).json({ error: 'post_id is required' });
  }

  // Check if the post exists and is published
  const posts = runQuery(
    'SELECT id, price, is_published FROM posts WHERE id = $id',
    { id: parseInt(post_id) }
  );

  if (posts.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const post = posts[0];
  if (!post.is_published) {
    return res.status(400).json({ error: 'Cannot purchase an unpublished post' });
  }

  if (post.price === 0) {
    return res.status(400).json({ error: 'This post is free, no purchase needed' });
  }

  // Check if already purchased
  const existing = runQuery(
    'SELECT id FROM purchases WHERE reader_id = $reader_id AND post_id = $post_id',
    { reader_id: readerId, post_id: post.id }
  );

  if (existing.length > 0) {
    return res.status(409).json({ error: 'already_purchased', message: 'You have already purchased this post' });
  }

  // Create the purchase
  const purchaseId = runInsert(
    'INSERT INTO purchases (reader_id, post_id, amount, created_at) VALUES ($reader_id, $post_id, $amount, $created_at)',
    { reader_id: readerId, post_id: post.id, amount: post.price, created_at: now() }
  );

  const purchase = runQuery('SELECT * FROM purchases WHERE id = $id', { id: purchaseId })[0];

  res.status(201).json({
    success: true,
    purchase: {
      id: purchase.id,
      post_id: purchase.post_id,
      amount: purchase.amount,
      created_at: purchase.created_at,
    },
  });
});

/**
 * GET /api/purchases/mine
 * Get all purchases for the authenticated reader
 */
router.get('/mine', requireReader, (req, res) => {
  const readerId = req.reader.readerId;

  const purchases = runQuery(
    `SELECT p.id, p.reader_id, p.post_id, p.amount, p.payment_method, p.created_at,
            po.title as post_title, po.slug as post_slug
     FROM purchases p
     JOIN posts po ON p.post_id = po.id
     WHERE p.reader_id = $reader_id
     ORDER BY p.created_at DESC`,
    { reader_id: readerId }
  );

  res.json({ purchases });
});

module.exports = router;