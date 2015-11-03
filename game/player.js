// OBJECT representing a user/player of a game

;(function() {
	'use strict';

	var Deck = require('game/deck');
	var EventHandler = require('tools/eventHandler');

	var Player = function(name) {
		this.name   = name;
		this.score  = 0;
		this._active = true;
		this.hand   = new Deck(false);
		this.events = new EventHandler();

		this.events.trigger('created');
	};

	Object.defineProperty(Player.prototype, 'active', {
		set: function active(value) {
			this._active = value;
			if (value === true) {
				this.events.trigger('activated');
			}
			if (value === false) {
				this.events.trigger('deactivated');
			}
		},
		get: function active() {
			return this._active;
		}
	});

	module.exports = Player;
})();