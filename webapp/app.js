const express = require('express');
const http = require('http');
const path = require('path');
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const csrf = require('csurf');
const passport = require('passport');
const sessionStore = require('connect-sqlite3')(session);
const cors = require('cors');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const runApp = require("./app/run.js");

const app = express();
const PORT = 3000;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: `http://localhost:${PORT}` }));
app.use(bodyParser.urlencoded({ extended: false }));

// Session setup
app.use(session({
    secret: 'session',
    resave: false,
    saveUninitialized: false,
    store: new sessionStore({ db: './database/sessions.db', dir: '.' })
}));

app.use(passport.authenticate('session'));

app.use(function (req, res, next) {
    const msgs = req.session.messages || [];
    res.locals.messages = msgs;
    res.locals.hasMessages = !!msgs.length;
    req.session.messages = [];
    next();
});

// CSRF protection
app.use(csrf());
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Routes
app.use('/', indexRouter);
app.use('/', authRouter);

// Initialize app-specific logic
runApp(app);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

// Start server
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Web server listening at http://127.0.0.1:${PORT}`);
});

module.exports = app;
