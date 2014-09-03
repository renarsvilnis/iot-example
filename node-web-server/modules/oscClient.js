var osc = require('node-osc');
var oscPort = 1340;
var oscHost = false;
var oscClient = false;


module.exports.create = function(host) {
  console.log('OSC - new client instance');
  var oscHost = host;
  module.exports.client = oscClient = new osc.Client(oscHost, oscPort);
};

module.exports.client = oscClient;