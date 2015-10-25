// OBJECT for simple Handlebars-like compiling of templates

;(function() {
	'use strict';

	// TODO Add handling for conditional statements
	// TODO Strip spaces

	var Template = function(template) {
		this.template = template;

		return this;
	};

	Template.prototype.prefix = '<!--';
	Template.prototype.suffix = '-->';

	Template.prototype.render = function(data) {
		var output = this.template;
		data = data ? data : {};

		while (output.indexOf(this.prefix) > -1) {
			var key = output.substring(output.indexOf(this.prefix) + this.prefix.length, output.indexOf(this.suffix));

			// Handle each statements
			if (key.indexOf('#each') > -1) {
				var openingTag = this.prefix + key + this.suffix;
				var closingTag = this.prefix + '/each' + this.suffix;

				var original = output.substring(output.indexOf(openingTag) + openingTag.length);
				original = original.substring(0, original.indexOf(closingTag));

				var replacement = '';

				var bob = new Template('' + original);
				var arrayName = key.split(' ')[1];
				var array = data[arrayName];

				for (var x = 0; x < array.length; x++) {
					replacement += bob.render(array[x]);
				}

				output = output.replace(openingTag + original + closingTag, replacement);
			} else { // Handle normal variables
				var value = getByString(data, key);
				if (typeof(value) === 'function') {
					value = value.call(data);
				}
				output = output.replace(this.prefix + key + this.suffix, value);
			}
		}

		return output;
	};

	var getByString = function(obj, str) {
		str = str.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
		str = str.replace(/^\./, '');           // strip a leading dot
		var a = str.split('.');

		for (var i = 0, n = a.length; i < n; ++i) {
			var key = a[i];
			if (key in obj) {
				obj = obj[key];
			} else {
				return;
			}
		}
		return obj;
	};

	module.exports = Template;
})();