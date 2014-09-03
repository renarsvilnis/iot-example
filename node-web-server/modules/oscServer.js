var osc = require('node-osc');
var oscPort = 1339;
var oscServer = new osc.Server(oscPort, '0.0.0.0');

module.exports = oscServer;