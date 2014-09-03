// osc
var oscClient = require('./modules/oscClient.js');
var oscServer = require('./modules/oscServer.js');

// serialport
var serialPort = require('serialport'),
    serialPortInit = serialPort.SerialPort;
    portNameBase = "/dev/cu.usbmodem";
    sp = false;

function spFindArduino() {
  var tempPortName = false;

  serialPort.list(function (err, ports) {
    ports.forEach(function(port) {
      if(port.comName.indexOf(portNameBase) > -1) {
        tempPortName = "/dev/tty.usbmodem" + port.comName.replace(portNameBase, '');
      }
    });

    if(tempPortName) {
      console.log('Arduino found: ', tempPortName);
      return spArduinoConnect(tempPortName);
    } else {
      console.log('Couldn\'t find attached arduino. Trying again...');
      setTimeout(function() {
        spFindArduino();
      }, 5000);
    }

  });
}

function spArduinoConnect(portName) {
  sp = new serialPortInit(portName, {
    baudRate: 9600, //115200
    parser: serialPort.parsers.readline("\n")
  });

  sp.on('open', function() {
    console.log('Arduino connected: ' + portName);

    sp.on('data', function(data) {
      oscClient.send('/pot', parseInt(data, 10));
    });

  });

  sp.on('close, error', function(error) {
    sp = false;
    console.log('Error connecting to arduino or unplugged.');
    spFindArduino();
  });
}

spFindArduino();

oscServer.on('/servo', function(msg, rinfo) {
  var tiltFB = msg[1];

  if(sp && tiltFB >= -90 && tiltFB <= 90) {
    tiltFB += 90;
    tiltFB += "\n";
    sp.write(tiltFB);
  }
});