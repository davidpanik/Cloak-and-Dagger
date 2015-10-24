// OBJECT for Node.js-like specifying and loading modules

;(function() {
	'use strict';

	// TODO add cross-browser ajax
	// TODO better sync loading of files
	// TODO handle code minification/concatenatation

	var cache = {};
	var timer = {};
	var cacheLife = 1000;

	if (!window.module) {
		window.module = {};
	}
	if (!window.module.exports) {
		window.module.exports = null;
	}

	if (!String.prototype.endsWith) {
		String.prototype.endsWith = function(searchString, position) {
			var subjectString = this.toString();
			if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
				position = subjectString.length;
			}
			position -= searchString.length;
			var lastIndex = subjectString.indexOf(searchString, position);
			return lastIndex !== -1 && lastIndex === position;
		};
	}

	window.require = function(url) {
		if (!url.endsWith('.js')) {
			url += '.js';
		}

		if (cache[url]) {
			return cache[url];
		} else {
			var request = new(XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');
			request.open('GET', url, false);
			request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			request.send();

			if (request.readyState === 4 && request.status === 200) {
				var moduleFunction = new Function(request.responseText);
				module.exports = null;
				moduleFunction();
				cache[url] = module.exports;
				module.exports = null;

				clearTimeout(timer);
				timer = setTimeout(function() {
					cache = {};
				}, cacheLife);

				return cache[url];
			} else {
				return false;
			}
		}
	};
})();