// database.js: Creates and manages the database.

// Imports
var sqlite3 = require('sqlite3');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

// Create or open database
mkdirp.sync('./database/');
var db = new sqlite3.Database('./database/database.db');

// Reset and recreate users table
db.serialize(function() {

  // Drop the existing 'users' table if it exists
  db.run("DROP TABLE IF EXISTS users", function(dropErr) {
    if (dropErr) {
      console.error("Error dropping 'users' table:", dropErr);
      return;
    }
    console.log("'users' table dropped successfully.");
    
    // Create new 'users' table with the correct schema
    db.run("CREATE TABLE IF NOT EXISTS users ( \
      id INTEGER PRIMARY KEY, \
      username TEXT UNIQUE, \
      hashed_password BLOB, \
      salt BLOB, \
      role TEXT, \
      projects TEXT, \
      community TEXT \
    )", function(createErr) {
      if (createErr) {
        console.error("Error creating new 'users' table:", createErr);
        return;
      }
      console.log("'users' table created successfully.");
      
      // Create the superuser if it doesn't already exist
      var superuserEmail = 'nishmael@cordioea.net';
      var superuserPassword = 'cordio@24';
      var salt = crypto.randomBytes(16);
      
      var superuserEmail = 'team@cordioea.net';
      var superuserPassword = 'cordio@24';
      var salt = crypto.randomBytes(16);

      db.run('INSERT OR IGNORE INTO users (username, hashed_password, salt, role) VALUES (?, ?, ?, ?)', [
        superuserEmail,
        crypto.pbkdf2Sync(superuserPassword, salt, 310000, 32, 'sha256'),
        salt,
        'superuser'
      ], function(insertErr) {
        if (insertErr) {
          console.error("Error inserting superuser:", insertErr);
        } else {
          console.log("Superuser created successfully.");
        }
      });
    });
  });
});

module.exports = db;
