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
			this.players.push(
				new Player(player)
			);
		} else {
			this.players.push(player);
		}

		this.events.trigger('added', player);

		return this;
	};

	Players.prototype.getActive = function(callback) {
		var activePlayers = [];

		for (var x = 0; x < this.players.length; x++) {
			if (this.players[x].active) {
				activePlayers.push(this.players[x]);
				if (callback) {
					callback.call(this.players[x]);
				}
			}
		}

		return activePlayers;
	};

	Players.prototype.getAll = function(callback) {
		for (var x = 0; x < this.players.length; x++) {
			if (callback) {
				callback.call(this.players[x]);
			}
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