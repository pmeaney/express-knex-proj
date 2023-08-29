var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('connect-flash');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');

var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./docs/swagger.json');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

app.use(flash());


var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/v1/users', usersRouter);
app.use('/auth', authRouter);

// swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;               // 8/29/23 -- added developmentB since we use two env configs for Knexjs-- development for Knex CLI, developmentB for the node app Knex connection
  res.locals.error = req.app.get('env') === 'development' || 'developmentB' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
