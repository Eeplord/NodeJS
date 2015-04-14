// app.js

var express      = require('express');
var path         = require('path');
var favicon      = require('serve-favicon');
var logger       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var fs           = require('fs');
var https        = require('https');
var http         = require('http');

var key          = fs.readFileSync('./ssl/key.pem');
var cert         = fs.readFileSync('./ssl/cert.pem');
var options = {
    key: key,
    cert: cert
};

var PORT = 8000;
var HOST = 'localhost';

var mongoose = require('mongoose');
var passport = require('passport');
require('./models/Posts');
require('./models/Comments');
require('./models/Users');
require('./config/passport');
mongoose.connect('mongodb://localhost/Readeet/data');

var routes     = require('./routes/index');
var filesystem = require('./routes/filesystem');
var fileserver = require('./routes/fileserver');
var users      = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/../public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/../public')));
app.use(passport.initialize());

app.use('/', routes);
app.use('/filesystem', filesystem);
app.use('/fileserver', fileserver);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// create http service
http.createServer(app).listen(8080);

// create https service identical to the http service
https.createServer(options, app).listen(8443);

module.exports = app;
