function getUrlFor(command){
  var name    = localStorage.name;
  var host    = localStorage.host;
  var port    = localStorage.port;
  var device  = localStorage.device;

  return host + ":" + port + "/robots/" + name + "/devices/" + device + "/commands/" + command;
}

function publishEvent(data) {
  var params = '{"name":"button", "data":"' + data + '"}';
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
    setInterval(function(){
      pollForMessages();
    },3000);
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
  publishEvent(e.payload.message);
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
