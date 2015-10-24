;(function() {
	'use strict';

	var Log = function() {
		this.store = '';
	};

	Log.prototype.add = function(str) {
		console.log(str);
		this.store += str + '<br/>';
	};

	Log.prototype.reset = function(str) {
		this.store = '';
	};

	module.exports = Log;
})();