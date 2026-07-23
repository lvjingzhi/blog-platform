const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'blog-platform-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

/**
 * Create a JWT token for an admin user.
 */
function signToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Create a JWT token for a reader account.
 */
function signReaderToken(reader) {
  return jwt.sign(
    { readerId: reader.id, email: reader.email, nickname: reader.nickname },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify a JWT token and return the decoded payload.
 * Returns null if invalid or expired.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = { signToken, signReaderToken, verifyToken, JWT_SECRET };