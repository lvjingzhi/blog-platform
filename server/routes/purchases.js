const express = require('express');
const { runQuery, runInsert, now } = require('../db');
const { requireReader } = require('../middleware/requireReader');
const { createQrCode, verifyCallbackSign } = require('../utils/xorpay');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// 暂存订单（内存中），生产环境建议用数据库
const pendingOrders = new Map();

/**
 * POST /api/purchases/create-order
 * 创建 XorPay 支付订单，返回二维码链接
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

    // 调用 XorPay 生成二维码
    const { qrCode, aoid } = await createQrCode({
      orderId,
      title: post.title,
      amount,
      notifyUrl: `http://abook2read.xyz/api/purchases/xorpay-callback`,
    });

    // 暂存订单信息
    pendingOrders.set(orderId, {
      readerId,
      postId: post.id,
      amount: post.price,
      aoid,
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
 * POST /api/purchases/xorpay-callback
 * XorPay 支付回调通知（无需认证）
 */
router.post('/xorpay-callback', express.urlencoded({ extended: false }), (req, res) => {
  try {
    const { order_id, aoid, price, pay_type, status, sign } = req.body;

    console.log('XorPay callback:', { order_id, aoid, price, pay_type, status });

    // 验证签名
    if (!verifyCallbackSign(req.body)) {
      console.error('XorPay callback: sign verification failed');
      return res.status(400).send('sign error');
    }

    // 只处理支付成功的回调
    if (status !== 'ok') {
      return res.send('success');
    }

    const order = pendingOrders.get(order_id);
    if (!order) {
      console.error('XorPay callback: order not found', order_id);
      return res.send('success');
    }

    if (order.completed) {
      return res.send('success');
    }

    // 检查是否已有购买记录
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
    pendingOrders.set(order_id, order);

    console.log('XorPay callback: payment confirmed for order', order_id);
    res.send('success');
  } catch (err) {
    console.error('XorPay callback error:', err);
    res.status(500).send('error');
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

    if (order.completed) {
      return res.json({ status: 'SUCCESS' });
    }

    // 检查是否超时（10分钟）
    const elapsed = Date.now() - new Date(order.createdAt + 'Z').getTime();
    if (elapsed > 10 * 60 * 1000) {
      return res.json({ status: 'CLOSED' });
    }

    res.json({ status: 'WAITING' });
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