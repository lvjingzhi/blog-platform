const express = require('express');
const { runQuery, runInsert, now } = require('../db');
const { requireReader } = require('../middleware/requireReader');
const { createQrCode, queryOrder } = require('../utils/alipay');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// 暂存订单（内存中），生产环境建议用数据库
const pendingOrders = new Map();

/**
 * POST /api/purchases/create-order
 * 创建支付宝支付订单，返回二维码链接
 */
router.post('/create-order', requireReader, async (req, res) => {
  try {
    const { post_id } = req.body;
    const readerId = req.reader.readerId;

    if (!post_id) {
      return res.status(400).json({ error: 'post_id is required' });
    }

    const posts = runQuery('SELECT id, title, price, is_published FROM posts WHERE id = $id', {
      id: parseInt(post_id),
    });

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[0];
    if (!post.is_published) {
      return res.status(400).json({ error: 'Cannot purchase an unpublished post' });
    }
    if (post.price === 0) {
      return res.status(400).json({ error: 'This post is free' });
    }

    // 检查是否已购买
    const existing = runQuery(
      'SELECT id FROM purchases WHERE reader_id = $reader_id AND post_id = $post_id',
      { reader_id: readerId, post_id: post.id }
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'already_purchased' });
    }

    // 生成订单号
    const orderId = uuidv4().replace(/-/g, '').substring(0, 28);
    const amount = (post.price / 100).toFixed(2);

    // 调用支付宝生成二维码
    const { qrCode } = await createQrCode({
      orderId,
      title: post.title,
      amount,
    });

    // 暂存订单信息
    pendingOrders.set(orderId, {
      readerId,
      postId: post.id,
      amount: post.price,
      createdAt: now(),
    });

    res.json({
      orderId,
      qrCode,
      amount: post.price,
      amountText: `¥${amount}`,
      postTitle: post.title,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: '创建支付订单失败，请重试' });
  }
});

/**
 * GET /api/purchases/check-order/:orderId
 * 查询支付状态，前端轮询此接口
 */
router.get('/check-order/:orderId', requireReader, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = pendingOrders.get(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const result = await queryOrder(orderId);

    // 支付成功 → 创建购买记录
    if (result.status === 'SUCCESS' && !order.completed) {
      const existing = runQuery(
        'SELECT id FROM purchases WHERE reader_id = $rid AND post_id = $pid',
        { rid: order.readerId, pid: order.postId }
      );

      if (existing.length === 0) {
        runInsert(
          'INSERT INTO purchases (reader_id, post_id, amount, created_at) VALUES ($rid, $pid, $amt, $created)',
          { rid: order.readerId, pid: order.postId, amt: order.amount, created: now() }
        );
      }

      order.completed = true;
      pendingOrders.set(orderId, order);
    }

    res.json({ status: result.status });
  } catch (err) {
    console.error('Check order error:', err);
    res.status(500).json({ error: '查询支付状态失败' });
  }
});

/**
 * POST /api/purchases
 * 保留：直接创建购买记录（模拟支付用）
 */
router.post('/', requireReader, (req, res) => {
  const { post_id } = req.body;
  const readerId = req.reader.readerId;

  if (!post_id) {
    return res.status(400).json({ error: 'post_id is required' });
  }

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

  const existing = runQuery(
    'SELECT id FROM purchases WHERE reader_id = $reader_id AND post_id = $post_id',
    { reader_id: readerId, post_id: post.id }
  );

  if (existing.length > 0) {
    return res.status(409).json({ error: 'already_purchased', message: 'You have already purchased this post' });
  }

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
 * 获取当前读者的购买记录
 */
router.get('/mine', requireReader, (req, res) => {
  const readerId = req.reader.readerId;

  const purchases = runQuery(
    `SELECT p.id, p.reader_id, p.post_id, p.amount, p.created_at,
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