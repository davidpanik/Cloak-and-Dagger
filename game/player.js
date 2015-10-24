;(function() {
	'use strict';

	var Deck = require('game/deck');
	var EventHandler = require('tools/eventHandler');

	var Player = function(name) {
		this.name   = name;
		this.score  = 0;
		this.active = true;
		this.hand   = new Deck(false);
		this.events = new EventHandler();

		this.events.trigger('created');
	};

	module.exports = Player;
})();