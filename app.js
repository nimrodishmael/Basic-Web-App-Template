// Imports
var sqlite = require('sqlite3').verbose();
var dotenv = require("dotenv").config();
var tokens = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

// Database
const DB = "database.db"

// Run app
function runApp(app) {
    // Test
    app.all("/api/test", (req, res) => {
        res.status(200).json({"response": "ok"});
    });

    // Load
    app.all("/api/load", (req, res) => {
        const query = "SELECT * FROM Data";
        const params = [];
        db.all(query, params, (err, rows) => {
            if (err) return res.status(400).json({"error": err.message});
            res.json({
                "response": "ok",
                "data": rows
            });
          });
    });

    // Save
    app.all('/api/save', (req, res) => {
        const {email, status} = req.body;
        const query = 'INSERT INTO Data (email, status) VALUES (?, ?)';
        db.run(query, [email, status]);
        res.send({"response": "ok"});
    });

    // Sign up
    app.all("/api/signup", async (req, res) => {
        // Check for email and password
        const {email, password} = req.body;
        console.log("Sign up: " + email);
        if (!(email && password)) return res.status(400).json({"error": "Email and password required to sign up."});

        // Check user email doesn't exist already
        var query = "SELECT * FROM Users WHERE email = ?";
        db.all(query, email, function(err, rows) {
            if (rows.length > 0) return res.status(400).json({"error": "User already exists, please log in."});

            // Create user
            var salt = bcrypt.genSaltSync(10);
            var query = 'INSERT INTO Users (username, email, password, salt, created) VALUES (?, ?, ?, ?, ?)';
            db.run(query, [email, email, bcrypt.hashSync(password, salt), salt, Date('now')]);

            // Log in
            req.url = '/api/login';
            return app._router.handle(req, res);
        });
    });

    // Login
    app.all("/api/login", async (req, res) => {
        try {
            // Check for email and password
            const {email, password} = req.body;
            console.log("Login: " + email);
            if (!(email && password)) return res.status(400).json({"error": "Email and password required to log in."});

            // Check email
            let user = [];
            let userOutput = {};
            var query = "SELECT * FROM Users WHERE email = ?";
            db.all(query, email, function(err, rows) {
                // Check error
                if (err) return res.status(400).json({"error": err.message});
                rows.forEach(function (row) { user.push(row); });

                // Find user
                if (rows.length == 0) return res.status(400).json({"error": "No user with that email found."});

                // Check password
                var passwordHash = bcrypt.hashSync(password, user[0].salt);
                if (passwordHash === user[0].password) {
                    // Create login token
                    if (!process.env.TOKEN_KEY) { 
                        console.log(".env file missing"); 
                        return res.status(400).json({"error": "Server .env file token key missing."});
                    }
                    const token = tokens.sign(
                        {user_id: user[0].id, username: user[0].username, email},
                        process.env.TOKEN_KEY,
                        {expiresIn: "90d"}
                    );

                    // Return user
                    userOutput.email = email;
                    userOutput.token = token;
                    return res.status(200).send(userOutput);
                } else {
                    // Invalid password
                    console.log("Invalid password.");
                    return res.status(400).json({"error": "Invalid password."});     
                }
            }); 
        } catch (err) {
            console.log("Caught error: " + err);
        }
    });

    // Load database
    var db = new sqlite.Database(DB, (err) => {
        if (err) {
          console.error(err.message)
          throw err
        } 
        else {
            // Create database
            var salt = bcrypt.genSaltSync(10);
            db.run(`CREATE TABLE users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username text,
                email text,
                password text,
                salt text,
                token text,
                login date,
                created date
                )`,
            (err) => {
                if (err) {
                    // Table already created
                } else {
                    // Table just created
                    console.log("Created database.");
                    var insert = 'INSERT INTO users (username, email, password, salt, created) VALUES (?, ?, ?, ?, ?)';
                    db.run(insert, ["user1", "user1@example.com", bcrypt.hashSync("user1", salt), salt, Date('now')]);

                    // Create table
                    db.run('CREATE TABLE IF NOT EXISTS Data (id INTEGER PRIMARY KEY AUTOINCREMENT, email text, status text)');
                }
            });

            // List users
            db.each("SELECT id, email FROM Users", (err, row) => {
                if (!err) console.log("User " + row.id + ": " + row.email);
            });
        }
    });
}
module.exports = { runApp };
