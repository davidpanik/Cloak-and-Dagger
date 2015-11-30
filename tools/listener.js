// OBJECT for listening to DOM events

;(function() {
	'use strict';

	// TODO Listen for anything https://gist.github.com/cvan/8798617
	// TODO Specify scope on initialisation

	var Listener = function() {
		this.events = [];
	};

	Listener.prototype.on = function(eventType, className, callback) {
		document.addEventListener(eventType, function(e) {
			var target = getEventTarget(e);
			if (target.classList.contains(className)) {
				callback(e, target);
			}
		});
	};

	Listener.prototype.off = function(eventType, className, callback) {

	};

	Listener.prototype.trigger = function(eventType, className) {

	};

	function getEventTarget(e) {
		e = e || window.event;
		return e.target || e.srcElement;
	}

	module.exports = Listener;
})();