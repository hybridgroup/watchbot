var poll = true;

function getUrlFor(command){
  var name    = localStorage.name;
  var host    = localStorage.host;
  var port    = localStorage.port;
  var device  = localStorage.device;

  return host + ":" + port + "/robots/" + name + "/devices/" + device + "/commands/" + command;
}

function processMessage(data) {
  if ( data == "up" || data == "down" || data == "select"){
    publishEvent("button", data);
  } else if (data == "tap"){
    publishEvent("tap", "");
  } else {
    publishEvent("accel", data);
  }
}

function publishEvent(event_name, data) {
  var params = '{"name":"' + event_name+ '", "data":"' + data + '"}';
  var req    = new XMLHttpRequest();

  req.open('POST', getUrlFor(localStorage.command), true);
  req.setRequestHeader("Content-type", "application/json");
  req.send(params);
}

function pollForMessages() {
  var req = new XMLHttpRequest();

  req.open('GET', getUrlFor('pending_message'), true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if(req.status == 200) {
        var response = JSON.parse(req.responseText);
        var message = response.result;
        if (message !== null) {
          Pebble.showSimpleNotificationOnPebble("Robot", message.toString());
        }
      } else {
        console.log("Error");
      }
    }
  };
  req.send(null);
}

Pebble.addEventListener("ready", function(e) {
  if (!!localStorage.host && !!localStorage.port && !!localStorage.name){
    Pebble.sendAppMessage({
      "message": "Ready!"
    });
  } else {
    Pebble.sendAppMessage({
      "message": "conf missing"
    });
  }
});

Pebble.addEventListener("appmessage", function(e) {
  if (poll) {
    pollForMessages();
    poll = false;
  } else {
    poll = true;
  }

  processMessage(e.payload.message);
});

Pebble.addEventListener("showConfiguration", function() {

  var html = '<html> <head> <title>watchbot configuration</title> <meta charset="utf-8"> <meta name="viewport" content="width=device-width, initial-scale=1"> </head> <style> body, textarea, button { font-size: 20px; font-family: monospace; text-align: center; } textarea { resize: none; padding-top: 15px; } button { padding: 15px; } </style> <body> <div data-role="page" id="main"> <div data-role="header" class="jqm-header"> <h1>Configure watchbot</h1> </div> <div data-role="content"> <div data-role="fieldcontain"> <label for="name">Robot name is:</label> <textarea cols="24" name="name" id="name"></textarea> </div> <div data-role="fieldcontain"> <label for="host">Robot API host:</label> <textarea cols="24" name="host" id="host"></textarea> </div> <div data-role="fieldcontain"> <label for="port">Robot API port:</label> <textarea cols="24" name="port" id="port"></textarea> </div> <div data-role="fieldcontain"> <label for="device">Robot API device:</label> <textarea cols="24" name="device" id="device"></textarea> </div> <div data-role="fieldcontain"> <label for="command">Robot API command:</label> <textarea cols="24" name="command" id="command"></textarea> </div> <br/> <div class="ui-body ui-body-b"> <button type="submit" data-theme="a" id="b-submit">Submit</button> <button type="submit" data-theme="d" id="b-cancel">Cancel</button> </div> </div> </div> <script> window.onload = function () { "use strict"; document.getElementById("name").value    = NAME; document.getElementById("host").value    = HOST; document.getElementById("port").value    = PORT; document.getElementById("device").value  = DEVICE; document.getElementById("command").value = COMMAND; }; function saveOptions() { "use strict"; var options = { "name":    document.getElementById("name").value, "host":    document.getElementById("host").value, "port":    document.getElementById("port").value, "device":  document.getElementById("device").value, "command": document.getElementById("command").value }; return options; } document.getElementById("b-cancel").addEventListener("click", function () { "use strict"; console.log("Cancel"); document.location = "pebblejs://close"; }); document.getElementById("b-submit").addEventListener("click", function () { "use strict"; console.log("Submit"); var location = "pebblejs://close#" + encodeURIComponent(JSON.stringify(saveOptions())); console.log("Warping to: " + location); console.log(location); document.location = location; }); </script> </body> </html><!--.html';

  html = html.replace("NAME", '"' + (localStorage.name || "pebble") + '"');
  html = html.replace("HOST", '"' + (localStorage.host || "http://0.0.0.0") + '"');
  html = html.replace("PORT", '"' + (localStorage.port || "8080") + '"');
  html = html.replace("DEVICE", '"' + (localStorage.device || "pebble") + '"');
  html = html.replace("COMMAND", '"' + (localStorage.command || "publish_event") + '"');

  Pebble.openURL('data:text/html,' + encodeURI(html));
});

Pebble.addEventListener("webviewclosed", function(e) {
  var options = JSON.parse(decodeURIComponent(e.response));

  localStorage.host     = options.host;
  localStorage.name     = options.name;
  localStorage.port     = options.port;
  localStorage.device   = options.device;
  localStorage.command  = options.command;
});
