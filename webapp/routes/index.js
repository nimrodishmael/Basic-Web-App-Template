const express = require('express');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const database = require('../database.js');

const router = express.Router();
const ensureLoggedIn = ensureLogIn();

router.get('/', function (req, res, next) {
    if (!req.user) {
        return res.render('index');
    }
    next();
}, function (req, res) {
    res.redirect('/home');
});

router.get('/account', ensureLoggedIn, function (req, res) {
    res.render('account', { user: req.user, csrfToken: req.csrfToken() });
});

router.get('/home', ensureLoggedIn, function (req, res) {
    res.render('home', { user: req.user });
});

module.exports = router;
