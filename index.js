var ledController = require('rpi-ws281x-native');
var _ = require('lodash');

const NUM_LEDS = 300;

ledController.init(NUM_LEDS);

const RED = '0xff0000';
const BLUE = '0x0000ff';
const GREEN = '0x00ff00';
const HOTPINK = '0xff69b4';
const YELLOW = '0xFFFF00';
const GOLD = '0xFFD700';
const BLACK = '0x000000';
const PRIMARY = HOTPINK;
const SECONDARY = RED;

var allRed = _.times(NUM_LEDS, function() { return RED; });
var allBlue = _.times(NUM_LEDS, function() { return BLUE; });
var allGreen = _.times(NUM_LEDS, function() { return GREEN; });
var alternating = _.times(NUM_LEDS, function(index) { if( index % 2 === 0) { return PRIMARY; } else { return SECONDARY; } });
var alternating2 = _.times(NUM_LEDS, function(index) { if( index % 2 === 0) { return SECONDARY; } else { return PRIMARY; } });

/*
ledController.render(allRed);

setTimeout(() => ledController.render(allBlue), 5000);
setTimeout(() => ledController.render(alternating), 15000);
setTimeout(() => ledController.render(allGreen), 10000);
setTimeout(() => ledController.reset(), 20000);
*/

var isRed = false;

var solid = function(color) {
	var leds = _.times(NUM_LEDS, function() { return color; });
	ledController.render(leds);
};

var cleanup = function(options, exitCode) {
	ledController.reset();
	process.exitCode = exitCode || 0;
};

process.on('SIGINT', cleanup);

var alternate = function(interval) {

setInterval(function() { 
	if(isRed) {
		ledController.render(alternating);
		isRed = false;
	} else {
		ledController.render(alternating2);
		isRed = true;
	}
}, interval);
};

var fade = function() {
	var brightness = 0;
	var ascending = true;

	setInterval(function() {
		if(ascending) {
			brightness += 5;
			if(brightness === 255) {
				ascending = false;
			}
		} else {
			brightness -= 5;
			if(brightness === 0) {
				ascending = true;
			}
		}
		ledController.setBrightness(brightness);
	}, 30);
};

solid(HOTPINK);
fade();

// alternate(500);
