'use strict';

// Server port
const PORT = 3000;

// Imports
var http = require('http');
var express = require('express');
var bodyParser = require('body-parser')
var cors = require('cors'); 

// Load web app
var {runApp} = require("./app.js");

// Start web app
var app = express();
var server = http.createServer(app);
server.listen(PORT);
app.use(express.static('.'));
app.use(cors({origin: `http://localhost:${PORT}`}));
app.use(bodyParser.urlencoded({extended: false}));
console.log(`Web server listening at http://127.0.0.1:${PORT}`);

// Run web app
runApp(app);
