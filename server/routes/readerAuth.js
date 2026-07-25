const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { runQuery, runInsert, now } = require('../db');
const { signReaderToken } = require('../utils/jwt');
const { requireReader } = require('../middleware/requireReader');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

/**
 * POST /api/reader/register
 * 注册新账号 → 创建未验证账号 → 发送验证邮件
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码至少需要6个字符' });
    }

    // 检查是否已注册
    const existing = runQuery('SELECT id, email_verified FROM readers WHERE email = $email', { email });
    if (existing.length > 0) {
      if (existing[0].email_verified) {
        return res.status(409).json({ error: '该邮箱已被注册' });
      }
      // 之前注册过但未验证 → 重新发送验证邮件
      const token = crypto.randomBytes(32).toString('hex');
      runQuery(
        'UPDATE readers SET verification_token = $token WHERE id = $id',
        { token, id: existing[0].id }
      );
      await sendVerificationEmail(email, token);
      return res.status(201).json({ message: '验证邮件已重新发送，请查收邮箱' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const readerId = runInsert(
      `INSERT INTO readers (email, password_hash, nickname, email_verified, verification_token, created_at)
       VALUES ($email, $password_hash, $nickname, 0, $verification_token, $created_at)`,
      {
        email,
        password_hash: passwordHash,
        nickname: nickname || email.split('@')[0],
        verification_token: verificationToken,
        created_at: now(),
      }
    );

    // 发送验证邮件
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: '注册成功！验证邮件已发送至 ' + email + '，请查收并点击验证链接。',
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: '注册失败，请稍后重试' });
  }
});

/**
 * GET /api/reader/verify-email/:token
 * 验证邮箱 → 标记已验证 → 自动登录返回 JWT
 */
router.get('/verify-email/:token', (req, res) => {
  try {
    const { token } = req.params;

    const readers = runQuery(
      'SELECT * FROM readers WHERE verification_token = $token',
      { token }
    );

    if (readers.length === 0) {
      return res.status(400).json({ error: '无效的验证链接' });
    }

    const reader = readers[0];

    // 标记已验证
    runQuery(
      'UPDATE readers SET email_verified = 1, verification_token = NULL WHERE id = $id',
      { id: reader.id }
    );

    // 自动登录
    const jwtToken = signReaderToken(reader);
    res.json({
      message: '邮箱验证成功！',
      token: jwtToken,
      reader: {
        id: reader.id,
        email: reader.email,
        nickname: reader.nickname,
      },
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: '验证失败，请稍后重试' });
  }
});

/**
 * POST /api/reader/resend-verification
 * 重新发送验证邮件
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '请输入邮箱地址' });
    }

    const readers = runQuery(
      'SELECT id, email_verified, verification_token FROM readers WHERE email = $email',
      { email }
    );

    if (readers.length > 0 && !readers[0].email_verified) {
      const token = readers[0].verification_token || crypto.randomBytes(32).toString('hex');
      if (!readers[0].verification_token) {
        runQuery('UPDATE readers SET verification_token = $token WHERE id = $id', { token, id: readers[0].id });
      }
      await sendVerificationEmail(email, token);
    }

    res.json({ message: '如果该邮箱需要验证，验证邮件已发送。' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: '发送失败，请稍后重试' });
  }
});

/**
 * POST /api/reader/login
 * 登录 → 检查邮箱是否已验证
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

  if (!reader.email_verified) {
    return res.status(403).json({ error: '请先验证邮箱后再登录', code: 'EMAIL_NOT_VERIFIED' });
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
 * POST /api/reader/forgot-password
 * 发送密码重置邮件
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '请输入邮箱地址' });
    }

    const readers = runQuery('SELECT id FROM readers WHERE email = $email AND email_verified = 1', { email });

    // 无论邮箱是否存在，都返回成功（防止邮箱枚举）
    if (readers.length > 0) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000).toISOString(); // 1 小时后过期

      runQuery(
        'UPDATE readers SET reset_token = $token, reset_token_expires = $expires WHERE id = $id',
        { token: resetToken, expires, id: readers[0].id }
      );

      await sendPasswordResetEmail(email, resetToken);
    }

    res.json({ message: '如果该邮箱已注册，您将收到一封密码重置邮件。' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: '发送失败，请稍后重试' });
  }
});

/**
 * POST /api/reader/reset-password
 * 重置密码
 */
router.post('/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: '参数不完整' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: '密码至少需要6个字符' });
    }

    const readers = runQuery(
      'SELECT * FROM readers WHERE reset_token = $token',
      { token }
    );

    if (readers.length === 0) {
      return res.status(400).json({ error: '无效的重置链接' });
    }

    const reader = readers[0];

    // 检查是否过期
    if (reader.reset_token_expires && reader.reset_token_expires < new Date().toISOString()) {
      return res.status(400).json({ error: '重置链接已过期，请重新申请' });
    }

    const passwordHash = bcrypt.hashSync(newPassword, 10);

    runQuery(
      'UPDATE readers SET password_hash = $hash, reset_token = NULL, reset_token_expires = NULL WHERE id = $id',
      { hash: passwordHash, id: reader.id }
    );

    res.json({ message: '密码重置成功，请使用新密码登录。' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: '重置失败，请稍后重试' });
  }
});

/**
 * GET /api/reader/me
 * 验证 token 并返回当前读者信息
 */
router.get('/me', requireReader, (req, res) => {
  const readers = runQuery(
    'SELECT id, email, nickname, email_verified, created_at FROM readers WHERE id = $id',
    { id: req.reader.readerId }
  );

  if (readers.length === 0) {
    return res.status(404).json({ error: '账号不存在' });
  }

  res.json({ reader: readers[0] });
});

module.exports = router;