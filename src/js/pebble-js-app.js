function fetchMessage() {
  var req = new XMLHttpRequest();
  req.open('GET', "http://192.168.1.15:8080/robots/pebble/devices/pebble/commands/last_message", true);
  req.onload = function(e) {
    if (req.readyState == 4) {
      if(req.status == 200) {
        var response = JSON.parse(req.responseText);
        var message = response.result.toString();
        Pebble.sendAppMessage({
          "message": message
        });
      } else {
        console.log("Error");
      }
    }
  };
  req.send(null);
}

Pebble.addEventListener("ready", function(e) {
  console.log("connect!" + e.ready);
  Pebble.sendAppMessage({
    "message": "Ready!"
  });
  console.log(e.type);
});

Pebble.addEventListener("appmessage", function(e) {
  console.log("message");
  fetchMessage();
});
