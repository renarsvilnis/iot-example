var net = require('net');
var netPort = 1338;
var temperature = 20;
var client = false;
var io = require('./io.js');

var server = net.createServer(function(c) { //'connection' listener
  console.log('Server connection with client extablished');
  
  client = c;
  exports.client = c;

  c.on('data', function(data) {
    // exports.temperature = data.toString().trim();
    io.io.emit('pot', {value: data.toString().trim()});
    // console.log(data.toString().trim());
  });

  c.on('end, error', function() {
    console.log('Connection with client closed');
    exports.client = false;
  });

}).listen(netPort, function() {
  console.log('Server listening to port ',netPort);
});

exports.client = client;
exports.temperature = temperature;