// OBJECT for automatically update DOM content based on a object's values

;(function() {
	'use strict';

	// TODO - Be more memory efficient
	// TODO - There is a false positive on comparison of data having changed

	var Template = require('tools/template');
	var EventHandler = require('tools/eventHandler');
	var events = new EventHandler();

	var Bind = function(selector, model) {
		this.selector = document.querySelector(selector);
		this.template = new Template(this.selector.innerHTML);
		this.model = model;

		this.active = true;
		this.previousData = '';
		this.newData = '';

		var self = this;
		events.on('refresh', function() {
			self.update();
		});

		return this;
	};

	Bind.prototype.update = function() {
		if (this.active) {
			this.newData = JSON.stringify(this.model);

			if (this.newData !== this.previousData) {
				this.previousData = this.newData;
				this.selector.innerHTML = this.render(this.model);
			}
		}
	};

	Bind.prototype.render = function(data) {
		if (typeof(data) === 'object') {
			return this.template.render(data);
		} else {
			return data;
		}
	};

	Bind.prototype.stop = function() {
		this.active = false;
		this.previousData = '';
	};

	var timer = function() {
		events.trigger('refresh');
		requestAnimationFrame(timer);
	};
	timer();

	module.exports = Bind;
})();