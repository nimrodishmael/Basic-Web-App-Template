// run.js: Runs the main web app server API.

// Database
var database = require('../database.js');

// Run app
function runApp(app) {
    // Test
    app.all("/api/test", (req, res) => {
        res.status(200).json({"response": "ok"});
    });

    // Load
    app.all("/api/load", (req, res) => {
        try {
            // Query data owned by this user
            if (!req.user) res.send({"response": "not logged in"});
            var query = "SELECT * FROM data WHERE owner_id == ?";
            var owner_id = req.user.id;
            var params = [owner_id];

            // Owner ID 1 admin gets all user data
            if (owner_id == 1) {
                query = "SELECT * FROM data";
                params = [];
            }

            // Query
            database.all(query, params, (err, rows) => {
                if (err) return res.status(400).json({"error": err.message});
                res.json({
                    "response": "ok",
                    "data": rows,
                    "username": req.user.username,
                    "id": req.user.id
                })
            });
        }
        catch (e) {
            console.log(e);
            res.send({"response": "not ok"});
        }
    });

    // Save
    app.all('/api/save', (req, res) => {
        try {
            if (!req.user) res.send({"response": "not logged in"});
            var owner_id = req.user.id;
            var email = req.user.username;
            var status = req.query.status;
            console.log("Saving status: " + status);
            var query = 'REPLACE INTO data (owner_id, username, status) VALUES (?, ?, ?)';
            database.run(query, [owner_id, email, status]);
            res.send({"response": "ok"});
        }
        catch (e) {
            console.log(e);
            res.send({"response": "not ok"});
        }
    });
}

// Export
module.exports = runApp;
