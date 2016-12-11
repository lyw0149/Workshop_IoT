var express = require('express');
var serialPort = require('serialport');

var app = express();
var resConfig = { 'content-type': 'application/json; charset=utf-8' };

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

var port = new serialPort('/dev/ttyUSB0', {
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

function mergeOptions(obj1, obj2) {
  var obj3 = {};
  d = new Date();
  for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }

  for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }

  return obj3;
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/' + 'index.html');
});

app.get('/light/action/0', function (req, res) {
  port.write('led:0\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('불을 껐습니다.');
  });

});

app.get('/light/action/1', function (req, res) {
  port.write('led:1\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('불을 켰습니다.');
  });
});

app.get('/light/action/1/blue', function (req, res) {

  port.write('led:2\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('파란색 불을 켰습니다.');
  });
});

app.get('/light/action/1/green', function (req, res) {

  port.write('led:3\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('초록색 불을 켰습니다.');
  });
});

app.get('/light/action/1/red', function (req, res) {

  port.write('led:4\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('빨간색 불을 켰습니다.');
  });
});

app.get('/secure/action/0', function (req, res) {
  port.write('secure:0\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('경비모드를 해제하였습니다.');
  });
});

app.get('/secure/action/1', function (req, res) {

  port.write('secure:1\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('경비모드를 작동시켰습니다.');

  });
});

app.get('/secure/retrieve', function (req, res) {
  if (homeData.secure == undefined) {
    res.set(resConfig).end('최근 측정된 데이터가 없습니다.');
  }

  if (homeData.secure == 0) {
    res.set(resConfig).end('감지됨');
  }else {
    res.set(resConfig).end('감지되지 않음');
  }
});

app.get('/dht/action/0', function (req, res) {

  port.write('dht:0\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('온도 및 습도 측정을 중지하였습니다.');
  });
});

app.get('/dht/action/1', function (req, res) {

  port.write('dht:1\n', function (err) {
    if (err) {
      res.set(resConfig).end(err.message);
      return;
    }

    res.set(resConfig).end('온도 및 습도 측정을 시작하였습니다.');
  });
});

app.get('/dht/retrieve/0', function (req, res) {

  if (homeData.temper == undefined) {
    res.set(resConfig).end('최근 측정된 데이터가 없습니다.');
    return;
  }

  res.set(resConfig).end(homeData.date + ' : ' + homeData.temper +  '도');
});

app.get('/dht/retrieve/1', function (req, res) {

  if (homeData.humid == undefined) {
    res.set(resConfig).end('최근 측정된 데이터가 없습니다.');
    return;
  }

  res.set(resConfig).end(homeData.date + ' : ' + homeData.humid + '%');
});

app.listen(80, function () {
  console.log('IoT Server listening on port 80!');
});
