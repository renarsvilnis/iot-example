var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var util = require('util');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('port', 80);

app.use(favicon());
app.use(logger('dev'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: app.get('env') === 'development' ? err : {}
  });
});

var oscServer = require('./modules/oscServer.js');
var oscClient = require('./modules/oscClient.js');
var io = require('./modules/io.js');

io.listen(app);
io.server.listen(app.get('port'));
oscClient.create('172.27.208.2');

var ioCurrentID = 0,
    potLastValue = 0;

io.io.on('connection', function (socket) {

  ioCurrentID++;
  if(ioCurrentID > 1000) {
    console.log('IO reseting id to  0.');
    ioCurrentID = 0;
  }

  socket.emit('initID', {id: ioCurrentID});
  socket.broadcast.emit('activeRemove', {remove: true});
  socket.emit('pot', {value: potLastValue});

  socket.on('servo', function(data) {

    if(!oscClient ||
      typeof data !== 'object' ||
      typeof data.id === 'undefined' ||
      data.id !== ioCurrentID ||
      typeof data.tilt === 'undefined'
      ) {
      return;
    }

    oscClient.client.send('/servo', data.tilt);
  });
});


oscServer.on('/pot', function(msg, rinfo) {
  potLastValue = msg[1];
  io.io.emit('pot', {value: potLastValue});
});

module.exports = app;