const express = require('express');
const cors = require('cors');
const { migrate } = require('./db/migrate');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const readerAuthRoutes = require('./routes/readerAuth');
const postRoutes = require('./routes/posts');
const adminPostRoutes = require('./routes/adminPosts');
const purchaseRoutes = require('./routes/purchases');

const PORT = process.env.PORT || 3001;

async function start() {
  // Run database migrations
  await migrate();

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/reader', readerAuthRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/admin/posts', adminPostRoutes);
  app.use('/api/purchases', purchaseRoutes);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  Admin:`);
    console.log(`    POST /api/auth/login`);
    console.log(`    GET  /api/auth/me`);
    console.log(`  Reader:`);
    console.log(`    POST /api/reader/register`);
    console.log(`    POST /api/reader/login`);
    console.log(`    GET  /api/reader/me`);
    console.log(`  Posts:`);
    console.log(`    GET  /api/posts`);
    console.log(`    GET  /api/posts/:slug`);
    console.log(`  Admin Posts:`);
    console.log(`    GET  /api/admin/posts`);
    console.log(`    POST /api/admin/posts`);
    console.log(`    PUT  /api/admin/posts/:id`);
    console.log(`    DELETE /api/admin/posts/:id`);
    console.log(`  Purchases:`);
    console.log(`    POST /api/purchases (auth required)`);
    console.log(`    GET  /api/purchases/mine (auth required)`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${PORT} 已被占用，请先关闭占用该端口的程序，或使用其他端口：`);
      console.error(`   netstat -ano | findstr ":${PORT}"`);
      console.error(`   taskkill //F //PID <PID>`);
      console.error(`   或设置环境变量 PORT=3002 使用其他端口`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });
}

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});