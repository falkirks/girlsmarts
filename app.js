
global.API_ENDPOINT = 'http://api.translink.ca/rttiapi/v1/';

global.trimBus = function(bus) {
  if (bus.charAt(0) === '0') {
    return trimBus(bus.slice(1));
  } else {
    return bus;
  }
};

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');

var index = require('./routes/index');
var stops = require('./routes/stops');
var buses = require('./routes/buses');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/']
}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/stops', stops);
app.use('/buses', buses);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});

app.get('/fun', function(req, res) {
  res.render('fun', {});
});
app.get('/data/run/:name/:id', function(req, res) {
  io.emit('run', { name: req.params.name, id: req.params.id});
});
app.get('/data/done/:name/:id', function(req, res) {
  io.emit('done', { name: req.params.name, id: req.params.id});
});

io.on('connection', function (socket) {
  console.log("connect");
});

module.exports = app;
