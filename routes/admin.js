// routes/admin.js

const express = require('express');
const router = express.Router();
const passport = require('passport');
const crypto = require('crypto');
const db = require('../database.js');
const ensureLogIn = require('connect-ensure-login').ensureLoggedIn;
const ensureLoggedIn = ensureLogIn();

router.get('/admin/add-user', ensureLoggedIn, function(req, res) {
    // Check if the user is the superuser
    if (req.user.role !== 'superuser') {
        return res.status(403).send('Access denied');
    }
    res.render('add-user');
});

router.post('/admin/add-user', ensureLoggedIn, function(req, res, next) {
    if (req.user.role !== 'superuser') {
        return res.status(403).send('Access denied');
    }

    const salt = crypto.randomBytes(16);
    const role = req.body.role || 'user';  // Default role is 'user'
    
    crypto.pbkdf2(req.body.password, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) return next(err);
        
        db.run('INSERT INTO users (username, hashed_password, salt, role) VALUES (?, ?, ?, ?)', [
            req.body.username,
            hashedPassword,
            salt,
            role
        ], function(err) {
            if (err) {
                return res.render('add-user', { hasMessages: true, messages: ['Account already exists.'] });
            }
            res.redirect('/admin/add-user');  // After adding, refresh the form
        });
    });
});

module.exports = router;
