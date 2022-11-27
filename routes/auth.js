// auth.js: User authentication

// Imports
var express = require('express');
var passport = require('passport');
var localStrategy = require('passport-local');
var crypto = require('crypto');

// Database
var db = require('../database.js');

// Read email and password, pass it into verify to check it
passport.use(new localStrategy(function verify(username, password, cb) {
  // Query user
  db.get('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
    if (err) { return cb(err); }
    if (!row) { return cb(null, false, { message: 'Incorrect email or password.' }); }

    // Check password    
    crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect email or password.' });
      }
      return cb(null, row);
    });
  });
}));


// Set data stored in the session
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});
passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// Router
var router = express.Router();

// Log in and sign up pages
router.get('/login', function(req, res, next) {
  res.render('login');
});
router.get('/signup', function(req, res, next) {
  res.render('signup');
});

// Log in
router.post('/login/password', passport.authenticate('local', {
  successReturnToOrRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true
}));

// Log out
router.all('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

// Sign up
router.post('/signup', function(req, res, next) {
  var salt = crypto.randomBytes(16);
  crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
    if (err) { return next(err); }
    db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
      req.body.username,
      hashedPassword,
      salt
    ], function(err) {
      if (err) {
        return res.render('signup', {hasMessages: true, messages: ['Account exists, please log in.']});
      }
      var user = {
        id: this.lastID,
        username: req.body.username
      };
      req.login(user, function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });
  });
});

// Export
module.exports = router;
