var UI = require('ui');
var Accel = require('ui/accel');
var Settings = require('settings');
var robotCommands = [];
var options = {};

function getUrlFor(command){
  var name    = Settings.data('name');
  var host    = Settings.data('host');
  var port    = Settings.data('port');
  var device  = Settings.data('device');

  return host + ":" + port + "/api/robots/" + name + "/devices/" + device + "/commands/" + command;
}

function getRobotUrlFor(command){
  var name    = Settings.data('name');
  var host    = Settings.data('host');
  var port    = Settings.data('port');

  return host + ":" + port + "/api/robots/" + name + "/commands/" + command;
}

function publishEvent(event_name, data) {
  var params = '{"name":"' + event_name+ '", "data":"' + data + '"}';
  var req    = new XMLHttpRequest();

  req.open('POST', getUrlFor('publish_event'), true);
  req.setRequestHeader("Content-type", "application/json");
  req.send(params);
}

function executeRobotCommand(command) {
  var req    = new XMLHttpRequest();

  req.open('POST', getRobotUrlFor(command), true);
  req.setRequestHeader("Content-type", "application/json");
  req.send();
}

function pollForMessages() {
  var req = new XMLHttpRequest();

  req.open('GET', getUrlFor('pending_message'), true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if(req.status == 200) {
        var response = JSON.parse(req.responseText);
        var message = response.result;
        if (message !== null && message !== '') {
          console.log(message);
          Pebble.showSimpleNotificationOnPebble("Robot", message.toString());
        }
      } else {
        console.log("Error");
      }
    }
  };
  req.send(null);
  setTimeout(function() {
    pollForMessages();
  }, 600);
}

function getRobotCommands() {
  var req = new XMLHttpRequest();

  req.open('GET', getRobotUrlFor(''), false);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if(req.status == 200) {
        var response = JSON.parse(req.responseText);
        robotCommands = response.commands;
      }
    }
  };

  try {
    req.send(null);
  } catch(err) {
    robotCommands = [];
  }
}

pollForMessages();

Pebble.addEventListener("showConfiguration", function() {
  Pebble.openURL('http://watchbot.io/configure/index.html?'+encodeURIComponent(JSON.stringify(options)));
});

Pebble.addEventListener("webviewclosed", function(e) {
  var options = JSON.parse(decodeURIComponent(e.response));

  Settings.data('host', options.host);
  Settings.data('name', options.name);
  Settings.data('port', options.port);
  Settings.data('device', options.device);
});

Accel.init();
Accel.config({rate: 10, samples: 1});

var main = new UI.Menu({
  sections: [{
    items: [{
      title: 'Commands',
      subtitle: 'Execute commands'
     },
     {
      title: 'Events',
      subtitle: 'Listen to events'
     },
     {
      title: 'Accelerometer',
      subtitle: 'Get accel info'
     }]
   }]
});

main.on('select', function(e) {
    if (e.itemIndex === 1) {
      var events = new UI.Card();
      events.title('Events');
      events.subtitle('Listening to bottons and tap');
      events.show();

      events.on('click', 'up', function(e) {
        publishEvent("button", "up");
      });
      events.on('click', 'select', function(e) {
        publishEvent("button", "select");
      });
      events.on('click', 'down', function(e) {
        publishEvent("button", "down");
      });
      events.on('accelTap', function(e) {
       publishEvent("tap", "");
      });
    } else if (e.itemIndex === 2) {
      var accel = new UI.Card();
      accel.subtitle('Accelerometer');
      accel.body('Sending data');
      accel.show();

      accel.on('accelData', function(e) {
        var accel = e.accels[0];
        var data = accel.x + "," + accel.y + "," + accel.z;
        publishEvent("accel", data);
      });
    } else if (e.itemIndex === 0) {
      getRobotCommands();
      if (robotCommands.length > 0) {
        var items = [];

        robotCommands.forEach(function(c) {
          items.push({title: c});
        });

        var commands = new UI.Menu({
          sections: [{
            items: items
          }]
        });

        commands.on('select', function(e) {
          executeRobotCommand(robotCommands[e.itemIndex]);
        });

        commands.show();
      } else {
        var command = new UI.Card();
        command.subtitle('No commands found');
        command.body('Verify server is running');
        command.show();
      }
    }
});

main.show();
