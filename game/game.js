// Build out game-specific logic and functionality here

;(function() {
	'use strict';

	// TODO Handle draws
	// TODO Build intelligent AI
	// TODO Add user input
	// TODO Negative score tokens happening

	var Deck = require('game/deck');
	var Players = require('game/players');
	var Bind = require('tools/bind');
	var Template = require('tools/template');
	var Log = require('tools/log');
	var random = require('tools/random');

	var masterList = {
		'card_1': {
			title: 'Accusation',
			desc:  'Pick another player and choose a card (other than Accusation), if they hold it then they are out of the round',
			value: 1,
			action: function(player) {
				var opponent = chooseOpponent();
				if (opponent === null) {
					log.add('No suitable opponents');
					return false;
				} else {
					log.add('Targeted ' + opponent.name);

					var guess = masterList['card_' + (random(7) + 1)];

					log.add('Guessed ' + guess.title + '...');

					if (opponent.hand.contains(guess)) {
						opponent.active = false;
						log.add('Correctly');
					} else {
						log.add('Incorrectly');
					}
				}
			}
		},
		'card_2': {
			title: 'Espionage',
			desc:  'Inspect another player\'s hand',
			value: 2,
			action: function(player) {
				var opponent = chooseOpponent();
				if (opponent === null) {
					log.add('No suitable opponents');
					return false;
				} else {
					log.add('Targeted ' + opponent.name);

					opponent.hand.getAll(function() {
						log.add('Revealing... ' + this.title);
					});
				}
			}
		},
		'card_3': {
			title: 'Confrontation',
			desc:  'Choose another player and secretly compare hands, the player will the losest value is out of the round',
			value: 3,
			action: function(player) {
				var opponent = chooseOpponent();
				if (opponent === null) {
					log.add('No suitable opponents');
					return false;
				} else {
					log.add('Targeted ' + opponent.name);

					calculateHandScores();

					if (player.handScore > opponent.handScore) {
						opponent.active = false;
						log.add('Knocking their opponent out');
					} else if (player.handScore < opponent.handScore) {
						player.active = false;
						log.add('Knocking themselves out');
					} else {
						log.add('It was a draw');
					}
				}
			}
		},
		'card_4': {
			title: 'Alibi',
			desc:  'You cannot be targeted until your next turn',
			value: 4,
			action: function(player) {
				player.protected = true;
			}
		},
		'card_5': {
			title: 'Blackmail',
			desc:  'Choose a player to discard their hand and draw a new card',
			value: 5,
			action: function(player) {
				var opponent = chooseOpponent();
				if (opponent === null) {
					log.add('No suitable opponents');
					return false;
				} else {
					log.add('Targeted ' + opponent.name);

					do {
						discardPile.add( opponent.hand.remove() );
					} while(!opponent.hand.empty);

					if (opponent.active && !deck.empty) {
						opponent.hand.add( deck.remove() );
					}
				}
			}
		},
		'card_6': {
			title: 'Switch',
			desc:  'Swap hands with another player',
			value: 6,
			action: function(player) {
				var opponent = chooseOpponent();
				if (opponent === null) {
					log.add('No suitable opponents');
					return false;
				} else {
					log.add('Targeted ' + opponent.name);

					var temp = opponent.hand;
					opponent.hand = player.hand;
					player.hand = temp;
				}
			}
		},
		'card_7': {
			title: 'Undercover',
			desc:  'Discard this card if you also hold Blackmail or Switch',
			value: 7,
			action: function(player) {
				// No action
			}
		},
		'card_8': {
			title: 'Ringleader',
			desc:  'If you discard this card lose the round',
			value: 8,
			action: function(player) {
				player.active = false;
			}
		}
	};

	var deck, burnPile, discardPile, players, log, views = {};
	var settings = {
		numberOfPlayers: 4,
		scoreTokens:     25, // 25
		roundNumber:     0,
		actionDelay:     500,
		active:          false
	};

	function newGame() {
		log = new Log();

		// Build our main deck
		deck = new Deck(false, [
			masterList['card_1'], masterList['card_1'], masterList['card_1'], masterList['card_1'], masterList['card_1'],
			masterList['card_2'], masterList['card_2'],
			masterList['card_3'], masterList['card_3'],
			masterList['card_4'], masterList['card_4'],
			masterList['card_5'], masterList['card_5'],
			masterList['card_6'],
			masterList['card_7'],
			masterList['card_8']
		]);

		burnPile = new Deck(false); // Create an empty burn pile
		discardPile = new Deck(true); // Create an empty discard pile

		// Whenever a player plays a card
		discardPile.events.on('added', function(card) {
			log.add(players.current().name + ' played ' + card.title);
			card.action(players.current());
		});

		deck.events.on('empty', function(card) { // If we've run out of cards to play
			console.log('EMPTY');
			// Sum up everyone's hand values
			var currentWinner = players.getActive()[0];

			calculateHandScores();

			players.getActive(function() {
				if (this.handScore > currentWinner.handScore) {
					currentWinner = this;
				}
			});

			roundWon(currentWinner, 'wins with the highest score');
		});

		// Create new players
		players = new Players();
		for (var x = 0; x < settings.numberOfPlayers; x++) {
			players.add('Player ' + (x + 1));
		}

		players.events.on('onePlayerLeft', function(card) { // If only one player is left in the game
			roundWon(players.getActive()[0], 'wins by being last standing');
		});

		views['deck'] = new Bind('[data-view="deck"]', deck);
		views['discardPile'] = new Bind('[data-view="discard"]', discardPile);
		views['player'] = new Bind('[data-view="players"]', players);
		views['log'] = new Bind('[data-view="log"]', log);
		views['settings'] = new Bind('[data-view="settings"]', settings);

		log.add('Starting game...');

		newRound();
	}

	function newRound() {
		settings.roundNumber++;

		log.add('New round - ' + settings.roundNumber);

		// Regather all cards to the deck
		deck.add(burnPile.removeAll());
		deck.add(discardPile.removeAll());
		players.getAll(function() {
			deck.add(this.hand.removeAll());
		});

		deck.shuffle();

		burnPile.add(deck.remove()); // Remove one card and add to the burn pile

		// Deal each player one card
		players.getAll(function() {
			this.active = true;
			this.hand.add(deck.remove());
		});

		settings.active = true;

		playTurn();
	}

	function playTurn() {
		if (settings.active) {
			players.current().hand.add( deck.remove() ); // Player draws a new card

			setTimeout(function() {
				if (settings.active) {
					players.current().protected = false; // Reset protection flag (card 4)

					if ( // Special rule for card 7
						players.current().hand.contains(masterList['card_7']) &&
						( players.current().hand.contains(masterList['card_5']) || players.current().hand.contains(masterList['card_6']) )
					) {
						discardPile.add( players.current().hand.remove(masterList['card_7']) );
					} else { // Otherwise
						discardPile.add( players.current().hand.remove('random') ); // Play a random card
					}


					// Next player takes their turn
					if (settings.active) {
						players.next();
						setTimeout(playTurn, settings.actionDelay);
					}
				}
			}, settings.actionDelay);
		}
	}

	function roundWon(winner, message) {
		log.add(winner.name + ' ' + message);
		winner.score++;
		settings.active = false;

		if (--settings.scoreTokens < 1) {
			log.add('Game finished! ' + players.highestScore().name + ' won');
			log.add('========================');
		} else {
			newRound();
		}
	}

	function chooseOpponent() {
		var validOpponents = [];
		// Filter down a list of players who can be targetted
		players.getActive(function() {
			if (
				this !== players.current() &&
				!this.protected &&
				!this.hand.empty
			) {
				validOpponents.push(this);
			}
		});

		if (validOpponents.length === 0) { // There are no viable targets
			return null;
		} else { // Choose a random opponent (currently just random)
			return validOpponents[random(validOpponents.length)];
		}
	}

	function calculateHandScores() {
		players.getActive(function() {
			this.handScore =
				this.active
					? this.hand.cards.reduce(function(previous, current) { return previous + current; }, 0)
						: 0;
		});
	}

	newGame();
})();