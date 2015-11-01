// COLLECTION of Card objects

;(function() {
	'use strict';

	var EventHandler = require('tools/eventHandler');
	var random = require('tools/random');

	var Deck = function(faceUp, cards) {
		if (typeof(faceUp) === 'undefined') faceUp = false;

		this.faceUp = faceUp;

		if (cards) {
			this.cards = cards;
			this.empty = false;
		} else {
			this.cards = [];
			this.empty = true;
		}

		this.events = new EventHandler();

		this.events.trigger('created');

		return this;
	};

	Deck.prototype.shuffle = function() {
		var numberOfPasses = 10;

		var randomSort = function() {
			return (0.5 - Math.random());
		};

		for (var x = 0; x < numberOfPasses; x++) {
			this.cards.sort(randomSort);
		}

		this.events.trigger('shuffled');

		return this;
	};

	Deck.prototype.clear = function() {
		this.cards = [];
		this.empty = true;
	};

	Deck.prototype.length = function() {
		return this.cards.length;
	};

	Deck.prototype.contains = function(card) {
		return (this.cards.indexOf(card) > -1);
	};

	Deck.prototype.remove = function(card) {
		var method = '';

		if (card && this.contains(card)) {
			card = this.cards.splice(this.cards.indexOf(card), 1);
			method = 'specified';
		} else if (card && card === 'random') {
			card = this.cards.splice(random(this.length()), 1);
			method = 'random';
		} else {
			card = this.cards.pop();
			method = 'top';
		}

		this.events.trigger('removed', card, method);

		if (this.length() < 1) {
			this.events.trigger('empty');
			this.empty = true;
		}

		return card;
	};

	Deck.prototype.add = function(cards) {
		if (!Array.isArray(cards)) {
			cards = [cards];
		}

		if (cards.length) {
			cards.forEach(function(card) {
				this.events.trigger('added', card);
			}, this);

			this.cards = this.cards.concat(cards);
			this.empty = false;
		}

		return this;
	};

	Deck.prototype.removeAll = function() {
		var removedCards = this.cards;

		this.cards = [];
		this.events.trigger('empty');
		this.empty = true;

		return removedCards;
	};

	Deck.prototype.getAll = function(callback) {
		if (callback) {
			this.cards.forEach(function(card) {
				callback.call(card);
			});
		}

		return this.cards;
	};

	module.exports = Deck;
})();