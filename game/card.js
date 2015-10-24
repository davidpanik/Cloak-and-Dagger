;(function() {
	'use strict';

	var Card = function(data) {
		if (data) {
			for (var x in data) {
				this[x] = data[x];
			}
		}

		return this;
	};

	module.exports = Card;
})();