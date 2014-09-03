var osc = require('node-osc');
// var oscHost = '188.226.253.132';
var oscHost = '172.27.224.1'; // vpn ip
var oscPort = 1339;
var oscClient = new osc.Client(oscHost, oscPort);
console.log('OSC client created: ' + oscHost + ':' +  oscPort);

module.exports = oscClient;