
global.API_ENDPOINT = 'http://api.translink.ca/rttiapi/v1/';

global.trimBus = function(bus) {
    return bus;
};

var express = require('express');
var socket_io = require( "socket.io" );
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');


var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var index = require('./routes/index')(io);
var stops = require('./routes/stops')(io);
var buses = require('./routes/buses')(io);
var fun = require('./routes/fun')(io);

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

//process.env.TRANSLINK_KEY = 'FmmnZOJpBGzKeDFmmFWl';

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

app.use('/stops', stops);
app.use('/rttiapi/v1/stops', stops);
app.use('/rttiapi/v1/buses', buses);
app.use('/buses', buses);
app.use('/fun', fun);
app.use('/', index);

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

io.on( "connection", function( socket ) {
  console.log( "A user connected" );
});


module.exports = {app: app, server: server};
