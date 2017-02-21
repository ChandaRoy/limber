var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var RedisStore = require('connect-redis')(session);
var app = express();

mongoose.connect('mongodb://localhost/fragileDB');
var routes = require('./routes/index');
//var users = require('./routes/users');
var user = require('./routes/user');
var activity = require('./routes/activity');
var sprint = require('./routes/sprint');
var project = require('./routes/project');
var story = require('./routes/story');
var graph = require('./routes/graph');
var template = require('./routes/template.js');
var authenticationHandler = require('./routes/authenticationHandler')(passport);
app.use(session({
  store: new RedisStore({
    host: '127.0.0.1',
    port: 6379,
    db: 7
  }),
  secret:'fragile'
}));
// app.use(session({
//   secret:'fragile',
//   key:'limber',
//   cookie:{maxAge : 360000000},
//   resave:false,
//   saveUninitialized:false
// }));

var initPassport = require('./passport-init');
initPassport(passport);

//
//Add socket.js link here
//

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'authFolder')));
app.use('/', routes);
app.use('/auth',authenticationHandler);

// view engine setup

app.use(function(req, res, next) {
  //console.log("**************** checking for authentication ************ ");
  if (req.isAuthenticated())
  {
    return next();
  }
  else
  {

    return res.redirect('/index.html');
  }
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/activity', activity);
app.use('/sprint', sprint);
app.use('/project', project);
app.use('/user', user);
app.use('/story', story);
app.use('/graph', graph);
app.use('/template',template);
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

//production error handler
//no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
//console.log(err.message);
 res.render('error', {
   message: err.message,
    error: {}
 });
});

module.exports = app;
