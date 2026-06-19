const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let dbPath = process.env.DATABASE_URL;

if (dbPath) {
  // Strip sqlite:// prefix if present
  if (dbPath.startsWith('sqlite://')) {
    dbPath = dbPath.replace('sqlite://', '');
  }
  // Resolve relative paths from current working directory
  dbPath = path.resolve(process.cwd(), dbPath);
} else {
  // Default path calculation relative to __dirname:
  // __dirname is backend/src/infrastructure/config
  // We want to store in backend/data/nalarupa.db, which is 3 levels up
  dbPath = path.resolve(__dirname, '..', '..', '..', 'data', 'nalarupa.db');
}

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(
  dbPath,
  process.env.NODE_ENV === 'development'
    ? { verbose: console.log }
    : {}
);


const initializeDatabase = () => {
  db.pragma('journal_mode = WAL'); // Improve concurrency

  const ensureColumn = (tableName, columnDefinition) => {
    const columnName = columnDefinition.split(' ')[0];
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    const hasColumn = columns.some((column) => column.name === columnName);
    if (!hasColumn) {
      db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition};`);
    }
  };

  // Create tasks table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      curriculumText TEXT NOT NULL,
      style TEXT NOT NULL,
      userId TEXT,
      optimizedPrompt TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      imageUrl TEXT,
      errorMessage TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create gallery table if it doesn't exist (can be similar to tasks or a simplified view)
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id TEXT PRIMARY KEY,
      userId TEXT,
      originalText TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      style TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  ensureColumn('tasks', 'userId TEXT');
  ensureColumn('gallery', 'userId TEXT');
  ensureColumn('tasks', 'parentId TEXT');
  ensureColumn('gallery', 'parentId TEXT');

  console.log('Database initialized successfully.');
};

module.exports = { db, initializeDatabase };
