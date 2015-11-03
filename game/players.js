// COLLECTION of Player objects

;(function() {
	'use strict';

	var Player = require('game/player');
	var EventHandler = require('tools/eventHandler');

	var Players = function(players) {
		if (players) {
			this.players = players;
		} else {
			this.players = [];
		}

		this.currentPlayer = 0;

		this.events = new EventHandler();

		this.events.trigger('created');

		return this;
	};

	Players.prototype.add = function(player) {
		if (typeof(player) === 'string') {
			player = new Player(player);
		}

		var self = this;

		player.events.on('deactivated', function() {
			if (self.getActive.length === 1) {
				self.events.trigger('onePlayerLeft');
			} else if (self.getActive.length === 0) {
				self.events.trigger('noPlayersLeft');
			}
		});

		this.players.push(player);

		this.events.trigger('added', player);

		return this;
	};

	Players.prototype.getActive = function(callback) {
		return this.players.filter(function(player) {
			if (callback) {
				callback.call(player);
			}

			return player.active;
		});
	};

	Players.prototype.getAll = function(callback) {
		if (callback) {
			this.players.forEach(function(player) {
				callback.call(player);
			});
		}

		return this.players;
	};

	Players.prototype.next = function() {
		if (this.getActive().length === 1) {
			this.events.trigger('onePlayerLeft', this.getActive()[0]);
		} else if (this.getActive().length === 0) {
			this.events.trigger('noPlayersLeft');
		} else {
			do {
				this.currentPlayer++;
				if (this.currentPlayer > this.players.length - 1) {
					this.currentPlayer = 0;
				}
			} while (!this.players[this.currentPlayer].active);
		}

		return this;
	};

	Players.prototype.current = function() {
		return this.players[this.currentPlayer];
	};

	Players.prototype.highestScore = function() {
		var highestScore = 0;
		var highestPlayer = null;

		this.getAll(function() {
			if (this.score > highestScore) { // What about draws?
				highestScore = this.score;
				highestPlayer = this;
			}
		});

		return highestPlayer;
	};

	module.exports = Players;
})();