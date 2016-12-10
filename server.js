var bodyParser = require('body-parser');
var express = require('express');
var serialPort = require('serialport');

var app = express();

// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

serialPort.list(function (err, ports) {
  ports.forEach(function (port) {
    console.log(port.comName);
    console.log(port.pnpId);
    console.log(port.manufacturer);
  });
});

app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/' + 'index.html');
});

app.listen(80, function () {
  console.log('IoT Server listening on port 80!');
});
