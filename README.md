# chomps

A Pebble app for interfacing with your Artoo/Cylon.js/Gobot robot

# Install

* Install the pebble SDK [install instructions](https://developer.getpebble.com/2/)
* Make sure you have installed latest Pebble 2.x app on your android or IOS phone.
* Turn on "developer mode" in your app (on IOS this is in settings > pebble)
* In your app you will now see a "developer" menu where you should enable listening on the phones ip address 
* Clone this repo `git clone https://github.com/hybridgroup/chomps.git`
* cd into the cloned repo folder `cd chomps`
* run `pebble build`
* run `pebble install --phone IP_ADDRESS_OF_YOUR_PHONE` (you can find the ip of your phone in the developer mode mentioned above)
* After app is installed, click on "Settings" and configure robot name, robot api host, and robot api port
