// Imports
var ledController = require('rpi-ws281x-native');
var colors = require('./colors');
var _ = require('lodash');

//// Variables - Change as you want
const NUM_LEDS = 150;
const PRIMARY = colors.HOTPINK;
const SECONDARY = colors.RED;

ledController.init(NUM_LEDS); // Initialize the LED controller, needs to be called before any other function.

//// Reusable Functions (Call them to apply affects)

///// Helper functions for creating LED states
const solid = function(color) {
	return _.times(NUM_LEDS, () => color); // Create an artifical array the size of the total number of LEDs, with all values set to the same color.
};

const alternating = function(primary, secondary) {
	return _.times(NUM_LEDS, (i) => i % 2 === 0 ? primary : secondary); // Create an array the size of the total number of leds, where ever even numbered one is primary, every odd is secondary.
};

const timer = function(action, milliseconds) {
	return new Promise((resolve, reject) {
		setTimeout(() => {
			action();
			resolve();
		}, milliseconds);
	});
};

const repeater = function(action, interval) {
	let int = null;

	return {
		start: function() {
			int = setInterval(action, interval);
		},
		stop: function() {
			clearInterval(int);
		};
	};
};

///// Control functions (actually setting the states on the LEDS) 
const render = function(data) {
	ledController.render(data);
};

const pulse = function(speed, stepRate) {
	let brightness = 0; // Current brightness level (0-255);
	let ascending = true; // Should be getting brighter
	let increment = stepRate || 5; // How much should we adjust brightness on each interval

	const interval = setInterval(() => {
		if (ascending) {
			brightness += increment; // Increase the brightness variable by the increment.
			if(brightness > 255) { brightness = 255 }; // Ensure we don't pass a value greater than the max

			if(brightness === 255) {
				ascending = false; // Lights at max brightness, start dimming.
			}
		} else {
			brightness -= increment;
			if(brightness < 0) { brightness = 0 }; // Ensure we don't pass a value less than 0

			if(brightness === 0) {
				ascending = true; // Lights totally off, time to get brighter again.
			}
		}

		ledController.setBrightness(brightness); // Actually set the brightness of the lights.

	}, speed || 25 /* How often we should adjust brightness */);

	return {
		stop: () => {
			clearInterval(interval); // Stop pulsing.
		}
	}
}

const alternate = function(primary, secondary, speed) {
	let isPrimary = false;

	const interval = setInterval(() => {
		if(isPrimary) {
			ledController.render(secondary);
			isPrimary = false;
		} else {
			ledController.render(primary);
			isPrimary = true;
		}
	}, speed || 1000); // Rate at which to change, default 1 second. (milliseconds)

	return {
		stop: () => {
			clearInterval(interval)
		}
	}
};

//// Main program code (Careful when modifying)

// Setup exit handler to shut off all the lights if the program is killed unexpectedly.
const onExit = function(options, exitCode) {
	ledController.reset(); // Turn off all the lights
	process.exitCode = exitCode || 0;
};

process.on('SIGINT', onExit); // Ensure we shut off all the lights when the program is killed.



//// Program sequence (change as much as you like)
(async() => {
	await timer(render(solid(colors.RED)), 1000);
	await timer(render(solid(colors.BLUE)), 1000);
	await timer(render(solid(colors.GREEN)), 1000);
	await timer(alternating(colors.RED, colors.HOTPINK), 1000);
})();

/*
timer(render(solid(colors.RED)), 1000);
setTimeout(() => render(solid(colors.RED)), 200); // Set all the lights to red
setTimeout(() => render(solid(colors.BLUE)), 1000); // Turn them to blue after 1 second
setTimeout(() => render(solid(colors.GREEN)), 2000); // Turn them to green after 2 seconds (From program start, not from last change).
setTimeout(() => render(alternating(colors.RED, colors.HOTPINK)), 3000); // Alternate red and hotpink
setTimeout(() => {
	const animation = alternate(solid(colors.BLUE), solid(colors.GREEN));

	setTimeout(() => animation.stop, 10000); // Stop animation after 10 seconds
}, 10000); // Alternate between blue and green

// Cool jiggle effect
setTimeout(() => {
	const animation = alternate(alternating(colors.RED, colors.HOTPINK), alternating(colors.HOTPINK, colors.RED)); // Alternate between alternating states (cool jiggle effect)

	setTimeout(() => animation.stop, 10000); // Stop animation after 10 seconds
}, 20000); 

// Cool pulsing effect
setTimeout(() => {
	render(solid(colors.RED));

	const animation = pulse();

	setTimeout(() => animation.stop, 10000);
}, 30000);

onExit(null, 0);
*/