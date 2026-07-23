const express = require('express');
const { runQuery, runInsert, now } = require('../db');
const { requireAdmin } = require('../middleware/requireAdmin');
const { slugify } = require('../utils/slugify');

const router = express.Router();

// All admin routes require authentication
router.use(requireAdmin);

/**
 * Parse paid content markers (<!--paid-->...<!--/paid-->) from content.
 * Returns { cleanContent, paidBlocks } where paidBlocks is an array of {start, end} offsets.
 */
function parsePaidBlocks(content) {
  const paidBlocks = [];
  const paidRegex = /<!--paid-->([\s\S]*?)<!--\/paid-->/g;
  let cleanContent = content;
  let offset = 0;
  let match;

  while ((match = paidRegex.exec(content)) !== null) {
    const originalStart = match.index;
    const originalEnd = match.index + match[0].length;
    const paidText = match[1];

    // Calculate adjusted positions in the clean content
    const adjustedStart = originalStart - offset;
    const adjustedEnd = adjustedStart + paidText.length;

    paidBlocks.push({ start: adjustedStart, end: adjustedEnd });

    // Remove the markers, keep the content
    cleanContent = cleanContent.replace(match[0], paidText);
    offset += '<!--paid-->'.length + '<!--/paid-->'.length;
  }

  return { cleanContent, paidBlocks: JSON.stringify(paidBlocks) };
}

/**
 * GET /api/admin/posts
 * List all posts (including drafts) with pagination
 */
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const totalRow = runQuery('SELECT COUNT(*) as count FROM posts');
  const total = totalRow[0].count;

  const posts = runQuery(
    `SELECT id, title, slug, excerpt, tags, price, is_published, created_at, updated_at
     FROM posts ORDER BY updated_at DESC LIMIT $limit OFFSET $offset`,
    { limit, offset }
  );

  res.json({
    posts: posts.map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
});

/**
 * Restore <!--paid-->...<!--/paid--> markers back into content for editing.
 * Processes blocks in reverse order so earlier offsets stay valid.
 */
function restorePaidMarkers(content, paidBlocks) {
  if (!paidBlocks || paidBlocks.length === 0) return content;

  // Sort by start position descending so we can insert from the end
  const sorted = [...paidBlocks].sort((a, b) => b.start - a.start);

  let result = content;
  for (const block of sorted) {
    const before = result.slice(0, block.start);
    const paid = result.slice(block.start, block.end);
    const after = result.slice(block.end);
    result = before + '<!--paid-->\n' + paid + '\n<!--/paid-->' + after;
  }
  return result;
}

/**
 * GET /api/admin/posts/:id
 * Get a single post by ID for editing
 */
router.get('/:id', (req, res) => {
  const posts = runQuery('SELECT * FROM posts WHERE id = $id', { id: parseInt(req.params.id) });

  if (posts.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const post = posts[0];
  const paidBlocks = JSON.parse(post.paid_blocks || '[]');

  res.json({
    ...post,
    // Restore markers so the editor shows <!--paid-->...<!--/paid-->
    content: restorePaidMarkers(post.content, paidBlocks),
    tags: JSON.parse(post.tags || '[]'),
    paid_blocks: paidBlocks,
  });
});

/**
 * POST /api/admin/posts
 * Create a new post
 */
router.post('/', (req, res) => {
  const { title, content, excerpt, tags, price, is_published } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  // Parse paid content markers
  const { cleanContent, paidBlocks } = parsePaidBlocks(content);

  const slug = slugify(title);
  const tagsJson = JSON.stringify(tags || []);
  const priceValue = parseInt(price) || 0;

  const timestamp = now();
  const id = runInsert(
    `INSERT INTO posts (title, slug, content, excerpt, tags, paid_blocks, price, is_published, created_at, updated_at)
     VALUES ($title, $slug, $content, $excerpt, $tags, $paid_blocks, $price, $is_published, $created_at, $updated_at)`,
    {
      title,
      slug,
      content: cleanContent,
      excerpt: excerpt || '',
      tags: tagsJson,
      paid_blocks: paidBlocks,
      price: priceValue,
      is_published: is_published ? 1 : 0,
      created_at: timestamp,
      updated_at: timestamp,
    }
  );

  const post = runQuery('SELECT * FROM posts WHERE id = $id', { id })[0];
  res.status(201).json({
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    paid_blocks: JSON.parse(post.paid_blocks || '[]'),
  });
});

/**
 * PUT /api/admin/posts/:id
 * Update an existing post
 */
router.put('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const existing = runQuery('SELECT * FROM posts WHERE id = $id', { id: postId });

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const { title, content, excerpt, tags, price, is_published } = req.body;

  // Parse paid content markers
  const { cleanContent, paidBlocks } = parsePaidBlocks(content);

  const slug = slugify(title);
  const tagsJson = JSON.stringify(tags || []);
  const priceValue = parseInt(price) || 0;

  runQuery(
    `UPDATE posts SET
      title = $title, slug = $slug, content = $content, excerpt = $excerpt,
      tags = $tags, paid_blocks = $paid_blocks, price = $price,
      is_published = $is_published, updated_at = $updated_at
     WHERE id = $id`,
    {
      title,
      slug,
      content: cleanContent,
      excerpt: excerpt || '',
      tags: tagsJson,
      paid_blocks: paidBlocks,
      price: priceValue,
      is_published: is_published ? 1 : 0,
      updated_at: now(),
      id: postId,
    }
  );

  const post = runQuery('SELECT * FROM posts WHERE id = $id', { id: postId })[0];
  res.json({
    ...post,
    tags: JSON.parse(post.tags || '[]'),
    paid_blocks: JSON.parse(post.paid_blocks || '[]'),
  });
});

/**
 * DELETE /api/admin/posts/:id
 * Delete a post (cascades to purchases)
 */
router.delete('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const existing = runQuery('SELECT * FROM posts WHERE id = $id', { id: postId });

  if (existing.length === 0) {
    return res.status(404).json({ error: 'Post not found' });
  }

  runQuery('DELETE FROM posts WHERE id = $id', { id: postId });
  res.json({ message: 'Post deleted successfully' });
});

module.exports = router;