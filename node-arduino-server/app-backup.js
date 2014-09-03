// net
var net = require('net');
var netHost = '188.226.253.132'; // '127.0.0.1'
var netPort = 1338; 
var netClient = netClientConnect();
var netConnected = false;

// serialport
var serialPort = require('serialport'),
    serialPortInit = serialPort.SerialPort;
    portNameBase = "/dev/cu.usbmodem";
    sp = false;

// -----
function netClientConnect() {

  netClient = net.connect(netPort, netHost, function() {
    netConnected = true;
    console.log('Net client connected to ', netHost, ':', netPort);

    netClient.setNoDelay(true);

    netClient.on('close', function(err) {
      netConnected = false;
      console.log('Server connection lost to: ' + netHost + ':' + netPort + ' (will try again after 5 seconds)');
      
      setTimeout(function() {
        netClientConnect();
      }, 5000);
    });
  });

  netClient.on('error', function(e) {
    netConnected = false;
    if(e.code == 'ECONNREFUSED') {

      console.log('Server connection error to: ' + netHost + ':' + netPort + ' (will try again after 5 seconds)');

      setTimeout(function() {
        netClientConnect();
      }, 5000);
    }
  });

  return netClient;
}

// netClient.on('data', function(data) {
//   if(sp)
//     sp.write(data.toString());
// });


// -----
spFindArduino();

function spFindArduino() {
  var tempPortName = false;

  serialPort.list(function (err, ports) {
    ports.forEach(function(port) {
      if(port.comName.indexOf(portNameBase) > -1) {
        tempPortName = "/dev/tty.usbmodem" + port.comName.replace(portNameBase, '');
        // tempPortName = port.comName;
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
    baudRate: 9600,
    parser: serialPort.parsers.readline("\n")
  });

  sp.on('open', function() {

    // reset leds
    setTimeout(function() {
      sp.write('40');
      sp.write('50');
      sp.write('30');
    }, 1800);

    //
    sp.on('data', function(data) {
      if(netConnected) {
        // netClient.write(data + '\r\n')
        netClient.write(data);
        // netClient.pipe(netClient);
      }
    });

    
  });

  sp.on('close, error', function(error) {
    sp = false;
    console.log('Error connecting to arduino or unplugged');
    spFindArduino();
  });

}