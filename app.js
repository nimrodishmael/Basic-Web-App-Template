// app.js: The main web app file.

// Server port
const PORT = 3000;

// Imports
var express = require('express');
var http = require('http');
var cors = require('cors');
var createError = require('http-errors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport-local');
const session = require('express-session');
const path = require('path');

// Routes
var indexRouter = require('./routes/index');

// App files
var initLogin = require("./app/login");

// Web server
var app = express();
var server = http.createServer(app);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static('./public/'));
app.use(cors({origin: `http://localhost:${PORT}`}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
server.listen(PORT);
console.log(`Web server listening at http://127.0.0.1:${PORT}`);

// Routes
app.use('/', indexRouter);

// Init
initLogin(app);

// Export
module.exports = app;


