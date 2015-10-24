;(function() {
	'use strict';

	var EventHandler = function() {
		this.events = [];
	};

	EventHandler.prototype.on = function(identifier, callback) {
		if (!this.events[identifier]) {
			this.events[identifier] = [];
		}

		this.events[identifier].push(callback);

		return this;
	};

	EventHandler.prototype.off = function(identifier, callback) {
		if (this.events[identifier]) {
			var index = this.events[identifier].indexOf(callback);
			if (callback > -1) {
				this.events.splice(index, 1);
				if (this.events[identifier].length === 0) {
					delete this.events[identifier];
				}
			}
		}
	};

	EventHandler.prototype.trigger = function(identifier) {
		var newArguments = [];
		for (var x = 1; x < arguments.length; x++) {
			newArguments.push(arguments[x]);
		}

		if (this.events[identifier]) {
			var events = this.events[identifier];
			for (var x = 0; x < events.length; x++) {
				events[x].apply(this, newArguments);
			}
		}

		return this;
	};

	module.exports = EventHandler;
})();