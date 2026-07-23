const fs = require('fs');
const path = require('path');
const { getDb, runQuery, now } = require('./index');

/**
 * Run all SQL migration files in order.
 * Seeds the admin user on first run if no users exist.
 */
async function migrate() {
  const db = await getDb();
  const migrationsDir = path.join(__dirname, 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found, skipping.');
    return;
  }

  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);

    for (const stmt of statements) {
      try {
        db.run(stmt);
      } catch (err) {
        // Ignore "already exists" errors for idempotent migrations
        if (!err.message.includes('already exists') && !err.message.includes('duplicate')) {
          console.error(`Migration error in ${file}: ${err.message}`);
          console.error(`Statement: ${stmt.substring(0, 100)}...`);
        }
      }
    }
    console.log(`Migration applied: ${file}`);
  }

  // Seed admin user if not exists
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  // Use a simple hash for bcryptjs
  let passwordHash;
  try {
    const bcrypt = require('bcryptjs');
    passwordHash = bcrypt.hashSync(adminPassword, 10);
  } catch {
    // Fallback if bcryptjs not available
    const crypto = require('crypto');
    passwordHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
  }

  const existingUsers = runQuery('SELECT COUNT(*) as count FROM users');
  if (existingUsers[0].count === 0) {
    runQuery(
      'INSERT INTO users (username, password_hash, created_at) VALUES ($username, $password_hash, $created_at)',
      { username: 'admin', password_hash: passwordHash, created_at: now() }
    );
    console.log('Default admin user created (username: admin, password: admin123)');
  }

  console.log('Migration complete.');
}

module.exports = { migrate };