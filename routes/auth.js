const express = require('express');
const passport = require('passport');
const localStrategy = require('passport-local');
const crypto = require('crypto');
const db = require('../database.js');

passport.use(new localStrategy(function verify(username, password, cb) {
    db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
        if (err) return cb(err);
        if (!row) return cb(null, false, { message: 'Incorrect email or password.' });

        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) return cb(err);
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                return cb(null, false, { message: 'Incorrect email or password.' });
            }
            return cb(null, row);
        });
    });
}));

passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});

const router = express.Router();

router.get('/login', function (req, res) {
    res.render('login');
});

//router.get('/signup', function (req, res) {
//    res.render('signup');
//});

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/home', // Redirect to Home page after successful login
    failureRedirect: '/login',
    failureMessage: true
}));

router.all('/logout', function (req, res, next) {
    req.logout(function (err) {
        if (err) return next(err);
        res.redirect('/');
    });
});

//router.post('/signup', function (req, res, next) {
//    const salt = crypto.randomBytes(16);
//    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
//        if (err) return next(err);
//        db.run('INSERT INTO users (username, hashed_password, salt) VALUES (?, ?, ?)', [
//            req.body.username,
//            hashedPassword,
//            salt
//        ], function (err) {
//            if (err) {
//                return res.render('signup', { hasMessages: true, messages: ['Account exists, please log in.'] });
//            }
//            const user = { id: this.lastID, username: req.body.username };
//            req.login(user, function (err) {
//                if (err) return next(err);
//                res.redirect('/');
//            });
//        });
//    });
//});


module.exports = router;
