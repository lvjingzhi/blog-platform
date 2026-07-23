const express = require('express');
const bcrypt = require('bcryptjs');
const { runQuery } = require('../db');
const { signToken } = require('../utils/jwt');
const { requireAdmin } = require('../middleware/requireAdmin');

const router = express.Router();

/**
 * POST /api/auth/login
 * Admin login - returns JWT token on success
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const users = runQuery(
    'SELECT * FROM users WHERE username = $username',
    { username }
  );

  if (users.length === 0) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const user = users[0];
  const validPassword = bcrypt.compareSync(password, user.password_hash);

  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = signToken(user);
  res.json({ token, username: user.username });
});

/**
 * GET /api/auth/me
 * Verify token and return current user info
 */
router.get('/me', requireAdmin, (req, res) => {
  res.json({ username: req.user.username });
});

module.exports = router;