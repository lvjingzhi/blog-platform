const express = require('express');
const bcrypt = require('bcryptjs');
const { runQuery, runInsert, now } = require('../db');
const { signReaderToken } = require('../utils/jwt');
const { requireReader } = require('../middleware/requireReader');

const router = express.Router();

/**
 * POST /api/reader/register
 * Register a new reader account
 */
router.post('/register', (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: '密码至少需要6个字符' });
  }

  // Check if email already exists
  const existing = runQuery('SELECT id FROM readers WHERE email = $email', { email });
  if (existing.length > 0) {
    return res.status(409).json({ error: '该邮箱已被注册' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const readerId = runInsert(
    'INSERT INTO readers (email, password_hash, nickname, created_at) VALUES ($email, $password_hash, $nickname, $created_at)',
    {
      email,
      password_hash: passwordHash,
      nickname: nickname || email.split('@')[0],
      created_at: now(),
    }
  );

  const reader = runQuery('SELECT id, email, nickname, created_at FROM readers WHERE id = $id', { id: readerId })[0];
  const token = signReaderToken(reader);

  res.status(201).json({
    token,
    reader: {
      id: reader.id,
      email: reader.email,
      nickname: reader.nickname,
    },
  });
});

/**
 * POST /api/reader/login
 * Reader login - returns JWT token
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '邮箱和密码不能为空' });
  }

  const readers = runQuery('SELECT * FROM readers WHERE email = $email', { email });

  if (readers.length === 0) {
    return res.status(401).json({ error: '邮箱或密码错误' });
  }

  const reader = readers[0];
  const validPassword = bcrypt.compareSync(password, reader.password_hash);

  if (!validPassword) {
    return res.status(401).json({ error: '邮箱或密码错误' });
  }

  const token = signReaderToken(reader);
  res.json({
    token,
    reader: {
      id: reader.id,
      email: reader.email,
      nickname: reader.nickname,
    },
  });
});

/**
 * GET /api/reader/me
 * Verify reader token and return current reader info
 */
router.get('/me', requireReader, (req, res) => {
  const readers = runQuery(
    'SELECT id, email, nickname, created_at FROM readers WHERE id = $id',
    { id: req.reader.readerId }
  );

  if (readers.length === 0) {
    return res.status(404).json({ error: '账号不存在' });
  }

  res.json({ reader: readers[0] });
});

module.exports = router;