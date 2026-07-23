const { verifyToken } = require('../utils/jwt');

/**
 * Middleware that requires a valid reader JWT token.
 * Attaches decoded reader info to req.reader on success.
 * Unlike requireAdmin, this is for reader accounts.
 */
function requireReader(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '请先登录' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }

  // Only accept reader tokens (not admin tokens)
  if (!decoded.readerId) {
    return res.status(401).json({ error: '无效的读者令牌' });
  }

  req.reader = decoded;
  next();
}

/**
 * Optional middleware: attaches reader info if token is present, but doesn't require it.
 */
function optionalReader(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded && decoded.readerId) {
      req.reader = decoded;
    }
  }
  next();
}

module.exports = { requireReader, optionalReader };