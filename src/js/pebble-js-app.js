function publishEvent(data) {
  var name    = localStorage.name;
  var host    = localStorage.host;
  var port    = localStorage.port;
  
  var baseUrl = "http://" + host + ":" + port + "/robots/" + name;
  var publish = "/devices/pebble/commands/publish_event";
  var params  = '{"name":"button", "data":"' + data + '"}';
  
  var req = new XMLHttpRequest();
  req.open('POST', baseUrl + publish, true);
  
  req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  req.setRequestHeader("Content-length", params.length);
  req.setRequestHeader("Connection", "close");
  req.send(params);
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
  publishEvent(e.payload.message);
});

Pebble.addEventListener("showConfiguration", function() {
  Pebble.openURL('http://hybridgroup.github.io/chomps/configure.html');
});

Pebble.addEventListener("webviewclosed", function(e) {
  var options = JSON.parse(decodeURIComponent(e.response));
  
  localStorage.host = options.host;
  localStorage.name = options.name;
  localStorage.port = options.port;
});
