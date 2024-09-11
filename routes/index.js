// index.js
const express = require('express');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;

const router = express.Router();
const ensureLoggedIn = ensureLogIn();

// Redirect root to the home page after login
router.get('/', function (req, res, next) {
    if (!req.user) {
        return res.render('index');
    }
    res.redirect('/home');
});

// Home route
router.get('/home', ensureLoggedIn, function (req, res) {
    res.render('home', { user: req.user });
});

// Dashboard route (Placeholder for now)
router.get('/dashboard', ensureLoggedIn, function (req, res) {
    res.render('dashboard', { user: req.user });
});

module.exports = router;
