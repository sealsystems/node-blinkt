"use strict";

const Gpio = require('onoff').Gpio;

const clk = new Gpio(24, 'out');
const dat = new Gpio(23, 'out');

const Blinkt = function () {};

/**
 * All pixels will start off white at full brightness by default.
 */
Blinkt.prototype.setup = function setup () {
	this._numPixels = 8;
	this._pixels = [];

	// Init pixels
	for (let i = 0; i < this._numPixels; i++) {
		this.setPixel(i, 255, 255, 255, 1.0);
	}
};

/**
 * Sets all pixels to the passed RGB and brightness values.
 * @param {Number} r The pixel red value between 0 and 255.
 * @param {Number} g The pixel green value between 0 and 255.
 * @param {Number} b The pixel blue value between 0 and 255.
 * @param {Number} a The pixel brightness value between 0.0 and 1.0.
 */
Blinkt.prototype.setAllPixels = function setAllPixels (r, g, b, a) {
	for (let i = 0; i < this._numPixels; i++) {
		this.setPixel(i, r, g, b, a);
	}
};

/**
 * Sets the specified pixel to the passed rgb and brightness level.
 * The pixelNum is an integer between 0 and 7 to indicate the pixel
 * to change.
 * @param {Number} pixelNum The pixel to set RGB and brightness for.
 * An integer value between 0 and 7. Zero is the first pixel, 7 is
 * the last one.
 * @param {Number} r The pixel red value between 0 and 255.
 * @param {Number} g The pixel green value between 0 and 255.
 * @param {Number} b The pixel blue value between 0 and 255.
 * @param {Number} a The pixel brightness value between 0.0 and 1.0.
 */
Blinkt.prototype.setPixel = function setPixel (pixelNum, r, g, b, a) {
	if (a === undefined) {
		if (this._pixels[pixelNum]) {
			// Set a to current level or 1.0 if none exists
			a = this._pixels[pixelNum][3] !== undefined ? this._pixels[pixelNum][3] : 1.0;
		}
	} else {
		a = parseInt((31.0 * a), 10) & 0b11111; // jshint ignore:line
	}

	this._pixels[pixelNum] = [
		parseInt(r, 10) & 255, // jshint ignore:line
		parseInt(g, 10) & 255, // jshint ignore:line
		parseInt(b, 10) & 255, // jshint ignore:line
		a
	];
};

/**
 * Sets the brightness of the pixel specified by pixelNum.
 * @param {Number} pixelNum The pixel to set RGB and brightness for.
 * An integer value between 0 and 7. Zero is the first pixel, 7 is
 * the last one.
 * @param {Number} brightness The pixel brightness value between 0.0
 * and 1.0.
 */
Blinkt.prototype.setBrightness = function setBrightness (pixelNum, brightness) {
	this._pixels[pixelNum][3] = parseInt((31.0 * brightness), 10) & 0b11111; // jshint ignore:line
};

/**
 * Sets all pixels to white.
 */
Blinkt.prototype.clearAll = function clearAll () {
	for (let i = 0; i < this._numPixels; i++) {
		this.setPixel(i, 255, 255, 255);
	}
};

/**
 * Sends the current pixel settings to the Blinkt! device. Once you
 * have set each pixel RGB and brightness, you MUST call this for the
 * pixels to change on the Blinkt! device.
 */
Blinkt.prototype.sendUpdate = function sendUpdate () {
	for (let i = 0; i < 4; i++) {
		this._writeByte(0);
	}

	for (let i = 0; i < this._numPixels; i++) {
		const pixel = this._pixels[i];

		// Brightness
		this._writeByte(0b11100000 | pixel[3]); // jshint ignore:line
		// Blue
		this._writeByte(pixel[2]);
		// Green
		this._writeByte(pixel[1]);
		// Red
		this._writeByte(pixel[0]);
	}

	this._writeByte(0xff);
};

/**
 * Writes byte data to the GPIO pins.
 * @param {Number} byte The byte value to write.
 * @private
 */
Blinkt.prototype._writeByte = function writeByte (byte) {
	for (let i = 0 ; i < this._numPixels; i++) {
		const bit = ((byte & (1 << (7 - i))) > 0) === true ? 1 : 0;

		dat.writeSync(bit);
		clk.writeSync(1);
		clk.writeSync(0);
	}
};

module.exports = Blinkt;
