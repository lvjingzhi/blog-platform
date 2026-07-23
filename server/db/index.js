const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'blog.db');

let db = null;

/**
 * Initialize the database. If the database file exists, load it.
 * Otherwise, create a new database and run migrations.
 */
async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  // Ensure data directory exists
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Enable WAL mode and foreign keys
  db.run('PRAGMA journal_mode=WAL;');
  db.run('PRAGMA foreign_keys=ON;');

  return db;
}

/**
 * Persist the in-memory database to disk.
 */
function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Run a SQL query and return all rows.
 * Use $param placeholders for parameters.
 */
function runQuery(sql, params = {}) {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');

  // Convert named parameters ($param) to positional (?)
  const paramNames = [];
  const processedSql = sql.replace(/\$(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '?';
  });

  const values = paramNames.map(name => {
    if (params[name] === undefined) {
      throw new Error(`Missing parameter: $${name}`);
    }
    return params[name];
  });

  // Determine if this is a SELECT or a mutation
  const isSelect = processedSql.trim().toUpperCase().startsWith('SELECT');
  const isPragma = processedSql.trim().toUpperCase().startsWith('PRAGMA');

  if (isSelect || isPragma) {
    try {
      const stmt = db.prepare(processedSql);
      stmt.bind(values);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    } catch (err) {
      // If prepare fails, fallback to db.each
      const results = [];
      db.each(processedSql, values, (row) => {
        results.push(row);
      });
      return results;
    }
  } else {
    db.run(processedSql, values);
    saveDb();
    return null;
  }
}

/**
 * Run a mutation and return the last inserted row ID.
 * IMPORTANT: Gets last_insert_rowid() BEFORE saveDb() because db.export() resets it.
 */
function runInsert(sql, params = {}) {
  if (!db) throw new Error('Database not initialized. Call getDb() first.');

  // Convert named parameters ($param) to positional (?)
  const paramNames = [];
  const processedSql = sql.replace(/\$(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '?';
  });

  const values = paramNames.map(name => {
    if (params[name] === undefined) {
      throw new Error(`Missing parameter: $${name}`);
    }
    return params[name];
  });

  db.run(processedSql, values);

  // Get the last insert rowid BEFORE saving (db.export() resets it)
  const result = db.exec('SELECT last_insert_rowid() as row_id');
  let rowId = null;
  if (result.length > 0 && result[0].values.length > 0) {
    rowId = result[0].values[0][0];
  }

  saveDb();
  return rowId;
}

/**
 * Get current datetime as ISO 8601 string.
 */
function now() {
  return new Date().toISOString();
}

module.exports = { getDb, saveDb, runQuery, runInsert, now };