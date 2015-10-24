;(function() {
	'use strict';

	var random = require('tools/random');

	var Die = function(sides) {
		if (sides) {
			this.sides = sides;
		} else {
			this.sides = [];
		}

		this.current = 0;

		return this;
	};

	Die.prototype.getCurrent = function() {
		return this.sides[this.current];
	};

	Die.prototype.roll = function() {
		this.current = random(this.side.length);

		return this;
	};

	module.exports = Die;
})();