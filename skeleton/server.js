var express = require('express');
var serialPort = require('serialport');

var app = express();

var homeData = {
  data: undefined,
  temper: undefined,
  humid: undefined,
  led: undefined,
  secure: undefined,
  dht: undefined,
};

serialPort.list(function (err, ports) {
  ports.forEach(function (port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});

var port = new serialPort('/ttyUSB0', {
  baudRate: 115200,
});

port.on('open', function () {
  console.log('opened');
  port.on('data', function (data) {
    console.log('Data: ' + data);

    if (isJsonString(data)) {
      var recvObj = JSON.parse(data);
      if (data.error) {
        console.log(data.error);
      } else {
        recvObj.date = new Date();
        homeData = mergeOptions(homeData, recvObj);
        console.log(homeData);
      }
    }
  });
});

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }

  return true;
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/' + 'index.html');
});

app.listen(80, function () {
  console.log('IoT Server listening on port 80!');
});
