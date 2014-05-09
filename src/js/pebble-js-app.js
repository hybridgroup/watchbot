var poll = true;

function getUrlFor(command){
  var name    = localStorage.name;
  var host    = localStorage.host;
  var port    = localStorage.port;
  var device  = localStorage.device;
  
  return host + ":" + port + "/robots/" + name + "/devices/" + device + "/commands/" + command;
}

function processMessage(data) {
  var event_name;

  if ( data == "up" || data == "down" || data == "select"){
    event_name = "button";
  } else {
    event_name = "accel";
  }
  
  publishEvent(event_name, data);
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
    processMessage(e.payload.message); 
    poll = true;
  }
});

Pebble.addEventListener("showConfiguration", function() {
  Pebble.openURL('http://hybridgroup.github.io/chomps/configure.html');
});

Pebble.addEventListener("webviewclosed", function(e) {
  var options = JSON.parse(decodeURIComponent(e.response));

  localStorage.host     = options.host;
  localStorage.name     = options.name;
  localStorage.port     = options.port;
  localStorage.device   = options.device  || 'pebble';
  localStorage.command  = options.command || 'publish_event';
});
