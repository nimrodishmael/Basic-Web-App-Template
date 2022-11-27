// database.js: Creates and manages the database.

// Imports
var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

// Create or open database
mkdirp.sync('./database/');
var db = new sqlite3.Database('./database/database.db');

// Create tables
db.serialize(function() {
  // Create users table
  db.run("CREATE TABLE IF NOT EXISTS users ( \
    id INTEGER PRIMARY KEY, \
    username TEXT UNIQUE, \
    hashed_password BLOB, \
    salt BLOB \
  )");

  // Create example data table
  db.run("CREATE TABLE IF NOT EXISTS data ( \
    owner_id INTEGER, \
    username TEXT, \
    status TEXT, \
    PRIMARY KEY (owner_id) \
  )");

  // Create an initial user
  var email = 'admin@example.com';
  var password = 'plplpl';
  var salt = crypto.randomBytes(16);
  db.run('INSERT OR IGNORE INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
    email,
    crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256'),
    salt
  ]);
});

// Export
module.exports = db;
