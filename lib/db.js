import sql from 'better-sqlite3';

const db = sql('training.db');

// Tablas de better-auth
db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    emailVerified INTEGER DEFAULT 0,
    name TEXT,
    image TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expiresAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    idToken TEXT,
    password TEXT,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updatedAt INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trainings (
    id INTEGER PRIMARY KEY,
    title TEXT,
    image TEXT,
    description TEXT
  );
`);

const hasTrainings =
  db.prepare('SELECT COUNT(*) as count FROM trainings').get().count > 0;

if (!hasTrainings) {
  db.exec(`
    INSERT INTO trainings (title, image, description)
    VALUES
    ('Yoga', '/yoga.jpg', 'A gentle way to improve flexibility and balance.'),
    ('Boxing', '/boxing.jpg', 'A high-energy workout that improves strength and speed.'),
    ('Running', '/running.jpg', 'A great way to improve cardiovascular health and endurance.'),
    ('Weightlifting', '/weightlifting.jpg', 'A strength-building workout that helps tone muscles.'),
    ('Cycling', '/cycling.jpg', 'A low-impact workout that improves cardiovascular health and endurance.'),
    ('Gaming', '/gaming.jpg', 'A fun way to improve hand-eye coordination and reflexes.'),
    ('Sailing', '/sailing.jpg', 'A relaxing way to enjoy the outdoors and improve balance.');
`);
}

export default db;
