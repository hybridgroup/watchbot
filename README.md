![](http://hybridgroup.github.io/watchbot/images/watchbot.png)

**A pebble app to control robots from your wrist.**

With very few lines of code, you can:

* Send notifications to your pebble:

```javascript
my.pebble.send_notification("Hello Pebble!");
```

* Detect when a button is pushed:

```javascript
my.pebble.on('button', function(data) {
  console.log("Button pushed: " + data);
});
```

* Tap events awareness:

```javascript
my.pebble.on('tap', function(data) {
  console.log("Tap event detected");
});
```

* Get accelerometer data:

```javascript
my.pebble.on('accel', function(data) {
  console.log(data);
});
```

### Full examples of how to interact with **watchbot**

##### Hello Pebble!

```javascript
var Cylon = require("cylon");

Cylon.api({
  host: "0.0.0.0",
  port: "8080",
  ssl:  false
});

Cylon.robot({
  name: "pebble",

  connections: {
    pebble: { adaptor: "pebble" }
  },

  devices: {
    pebble: { driver: "pebble" }
  },

  work: function(my) {
    my.pebble.send_notification("Hello Pebble!");

    my.pebble.on("button", function(data) {
      console.log("Button pushed: " + data);
    });

    my.pebble.on("tap", function() {
      console.log("Tap event detected");
    });
  }
}).start();
```

##### Accelerometer

```javascript
"use strict";

var Cylon = require("cylon");

Cylon.api({
  host: "0.0.0.0",
  port: "8080",
  ssl:  false
});

Cylon.robot({
  name: "pebble",

  connections: {
    pebble: { adaptor: "pebble" }
  },

  devices: {
    pebble: { driver: "pebble" }
  },

  work: function(my) {
    my.pebble.on('accel', function(data) {
      console.log(data);
    });
  }
}).start();
```

### More information about pebble drivers/adaptors

* [Cylon.js (Javascript)](http://cylonjs.com/documentation/platforms/pebble/)
* [Artoo    (Ruby)](http://artoo.io/documentation/platforms/pebble/)
* [Gobot    (Golang)](http://gobot.io/documentation/platforms/pebble/)

# Download

[![watchbot appstore](http://new.tinygrab.com/089df54f8fa9653cbc03459bef1dc11352cd2e4fc6.png)](https://apps.getpebble.com/applications/52b11885b0661fb292000004)

You can find Watchbot in the [Pebble Appstore][appstore], or add it directly to your phone's Pebble app with this link: pebble://appstore/52b11885b0661fb292000004

[appstore]: https://apps.getpebble.com/applications/52b11885b0661fb292000004

# Configure

After app is installed, click on "Settings" and configure:

* robot name
* robot api host
* robot api port
* device name

# Usage

Watchbot has 3 main sections:

* Commands: Execute custom commands defined in your robot.
* Events: Listen to tap and button events.
* Accelerometer: Send x/y/z accel data to your programs.

# Releases

* 2.3 - Updated to Pebble SDK 3.0, fixed config page on iOS.

* 2.0 - Adding menu to listen to events, execute commands or send accel information. Using pebblejs.

* 0.2.0 - Compatible with CPPP.io robot API

* 0.1.0 - Accelerometer events on/off and refactoring

* 0.0.4 - Adding styles to configuration page

* 0.0.3 - Tap event

* 0.0.2 - Notifications and accelerometer events

* 0.0.1 - Button events

## Contribute

* All patches must be provided under the Apache 2.0 License
* Please use the -s option in git to "sign off" that the commit is your work and you are providing it under the Apache 2.0 License
* Submit a Github Pull Request to the appropriate branch and ideally discuss the changes with us in IRC.
* We will look at the patch, test it out, and give you feedback.
* Avoid doing minor whitespace changes, renamings, etc. along with merged content. These will be done by the maintainers from time to time but they can complicate merges and should be done seperately.
* Take care to maintain the existing coding style.
* All pull requests should be "fast forward"
  * If there are commits after yours use “git rebase -i <new_head_branch>”
  * If you have local changes you may need to use “git stash”
  * For git help see [progit](http://git-scm.com/book) which is an awesome (and free) book on git

# Install from source

* Sign into [pebble cloud](https://cloudpebble.net).
* Create a new project from import: `github.com/hybridgroup/watchbot.git`
* From Compilation menu, install and run into your own pebbel.

## LICENSE

Copyright (c) 2013-2015 The Hybrid Group. Licensed under the Apache 2.0 license
