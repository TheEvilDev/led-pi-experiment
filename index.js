const FauxMo = require('fauxmojs');
var ledController = require('rpi-ws281x-native');
var colors = require('./colors');
var _ = require('lodash');

const NUM_LEDS = 150;

const solid = function(color) {
	return _.times(NUM_LEDS, () => color); // Create an artifical array the size of the total number of LEDs, with all values set to the same color.
};

const service = new FauxMo({ // FauxMo creates a fake "WeMo" device that can be discovered by Alexa automatically. Just run this script, and go to the alexa app, and scan for devices.
    ipAddress: require("ip").address(), // Need to programmatically determine the raspberry pi's intranet address so alexa can send it commands. This value could change, so we ask for it everytime the service starts.
    devices: [
      {
        name: 'Patio Lights', // Name your thing as you want it to appear in alexa "Turn on the Patio Lights"
        port: 11000, // Pick a number any number (11000, 110001, etc) this is the port this device will listen on.
        handler: (action) => {
          ledController.init(NUM_LEDS); // Initialize the LED Controller
          
          if(action === 'on') { // Check if we are turning "on" or "off"
            ledController.render(solid(colors.BLUE)); // Turn on the lights, make them all blue.
          } else {
            ledController.reset(); // Turn off the lights
          }
        }
      }
    ]
});

console.log('Device Service Started'); // Output something to the console so you know when it's started

// Setup exit handler to shut off all the lights if the program is killed unexpectedly.
const onExit = function(options, exitCode) {
	service.stopService(); // Turn off all the lights
	process.exitCode = exitCode || 0;
};

process.on('SIGINT', onExit); // Ensure we shut off all the lights when the program is killed.