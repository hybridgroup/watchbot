(function() {
  "use strict";

  var UI = require("ui");
  var Accel = require("ui/accel");
  var Settings = require("settings");
  var robotCommands = [];

  function getUrlFor(command) {
    var name = Settings.data("name"),
        host = Settings.data("host"),
        port = Settings.data("port"),
        device = Settings.data("device");

    return host + ":" + port + "/api/robots/" + name + "/devices/" + device + "/commands/" + command;
  }

  function getRobotUrlFor(command) {
    var name = Settings.data("name"),
        host = Settings.data("host"),
        port = Settings.data("port");

    return host + ":" + port + "/api/robots/" + name + "/commands/" + command;
  }

  function publishEvent(name, data) {
    var params = JSON.stringify({ name: name, data: data }),
        req = new XMLHttpRequest();

    req.open("POST", getUrlFor("publish_event"), true);
    req.setRequestHeader("Content-type", "application/json");
    req.send(params);
  }

  function executeRobotCommand(command) {
    var req = new XMLHttpRequest();

    req.open("POST", getRobotUrlFor(command), true);
    req.setRequestHeader("Content-type", "application/json");
    req.send();
  }

  function pollForMessages() {
    var req = new XMLHttpRequest();

    if (Settings.data("host")) {
      req.open("GET", getUrlFor("pending_message"), true);
      req.onreadystatechange = function() {
        if (req.readyState === 4) {
          if (req.status !== 200) { return console.log("Error"); }

          var message = JSON.parse(req.responseText).result;

          if (message !== null && message !== "") {
            console.log(message);
            Pebble.showSimpleNotificationOnPebble("Robot", message.toString());
          }
        }
      };
      req.send(null);
    }

    setTimeout(pollForMessages, 600);
  }

  function getRobotCommands() {
    var req = new XMLHttpRequest();

    req.open("GET", getRobotUrlFor(""), false);
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
        var response = JSON.parse(req.responseText);
        robotCommands = response.commands;
      }
    };

    try {
      req.send(null);
    } catch(err) {
      robotCommands = [];
    }
  }

  function showCommands() {
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

      commands.on("select", function(e) {
        executeRobotCommand(robotCommands[e.itemIndex]);
      });

      commands.show();
    } else {
      var command = new UI.Card();
      command.subtitle("No commands found");
      command.body("Verify server is running");
      command.show();
    }
  }

  function showEvents() {
    var events = new UI.Card();

    events.title("Events");
    events.subtitle("Listening to buttons and tap");
    events.show();

    ["up", "select", "down"].forEach(function(which) {
      events.on("click", which, publishEvent.bind(null, "button", which));
    });

    events.on("accelTap", publishEvent.bind(null, "tap", ""));
  }

  function showAccelerometer() {
    var card = new UI.Card();
    card.subtitle("Accelerometer");
    card.body("Sending data");
    card.show();

    card.on("accelData", function(e) {
      var accel = e.accels[0];
      var data = [accel.x, accel.y, accel.z].join();
      publishEvent("accel", data);
    });
  }

  pollForMessages();

  Pebble.addEventListener("showConfiguration", function() {
    var options = JSON.stringify({
      name: Settings.data("name"),
      host: Settings.data("host"),
      port: Settings.data("port"),
      device: Settings.data("device")
    });

    var url = "http://watchbot.io/configure/index.html?" + encodeURIComponent(options);

    Pebble.openURL(url);
  });

  Pebble.addEventListener("webviewclosed", function(e) {
    var options = JSON.parse(decodeURIComponent(e.response));

    if (options.canceled) { return; }

    Settings.data("host", options.host);
    Settings.data("name", options.name);
    Settings.data("port", options.port);
    Settings.data("device", options.device);
  });

  Accel.init();

  var main = new UI.Menu({
    sections: [{
      items: [
        {
          title: "Commands",
          subtitle: "Execute commands"
        }, {
          title: "Events",
          subtitle: "Listen to events"
        }, {
          title: "Accelerometer",
          subtitle: "Get accel info"
        }
      ]
    }]
  });

  main.on("select", function(event) {
    switch (event.itemIndex) {
      case 0:
        showCommands();
        break;

      case 1:
        showEvents();
        break;

      case 2:
        showAccelerometer();
        break;
    }
  });

  main.show();
})();
