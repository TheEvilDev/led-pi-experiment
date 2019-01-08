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
	return new Promise((resolve, reject) => {
		try {
			const animation = action();
			
			setTimeout(() => {
				if(animation && animation.stop) {
					animation.stop();
				};

				resolve();
			}, milliseconds);
		} catch (e) {
			reject(e);
		};
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
		}
	};
};

///// Control functions (actually setting the states on the LEDS) 
const render = function(data) {
	return () => ledController.render(data);
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
	return () => {
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
	try {
		await timer(render(solid(colors.RED)), 1000);
		await timer(render(solid(colors.BLUE)), 1000);
		await timer(render(solid(colors.GREEN)), 1000);
		await timer(render(alternating(colors.RED, colors.HOTPINK)), 1000);
		await timer(pulse, 5000);
		await timer(alternate(solid(colors.YELLOW), solid(colors.RED)), 5000);
	} catch (e) {
		console.error(e);
		process.exitCode = 1;
	} finally {
		ledController.reset();
	}
})();