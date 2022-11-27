// index.js: The main routes for the web app

// Imports
var express = require('express');
var ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
var database = require('../database.js');

// Ensure logged in
var ensureLoggedIn = ensureLogIn();

// Load page
function load(req, res, next) {
  res.locals.variable = "";
  next();
}

// Routes
var router = express.Router();
router.get('/', function(req, res, next) {
  if (!req.user) { return res.render('index'); }
  next();
}, load, function(req, res, next) {
  res.redirect('/home');
});
router.get('/account', ensureLoggedIn, load, function(req, res, next) {
  res.render('account', { user: req.user });
});
router.get('/home', ensureLoggedIn, load, function(req, res, next) {
  res.render('home', { user: req.user });
});

// Export
module.exports = router;
