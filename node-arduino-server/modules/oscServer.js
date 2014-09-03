var osc = require('node-osc');
var oscPort = 1340;
var oscServer = new osc.Server(oscPort, '0.0.0.0');
console.log('OSC server created: 127.0.0.1:' +  oscPort);

module.exports = oscServer;