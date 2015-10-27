// OBJECT for tracking text output

;(function() {
	'use strict';

	var Log = function() {
		this.reset();

		return this;
	};

	Log.prototype.lineSeperator = '<br/>';

	Log.prototype.add = function(str) {
		console.log(str);
		this.store.push(str);

		return this;
	};

	Log.prototype.reset = function(str) {
		this.store = [];

		return this;
	};

	module.exports = Log;
})();