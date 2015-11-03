// OBJECT for simple Handlebars-like compiling of templates

;(function() {
	'use strict';

	// TODO Strip spaces

	var Template = function(template) {
		this.template = template;

		return this;
	};

	Template.prototype.prefix = '{{';
	Template.prototype.suffix = '}}';

	Template.prototype.tagPrefix = '#';
	Template.prototype.tagSuffix = '/';

	Template.prototype.render = function(data) {
		var output = this.template;
		data = data ? data : {};

		while (output.indexOf(this.prefix) > -1) {
			var key = output.substring(output.indexOf(this.prefix) + this.prefix.length, output.indexOf(this.suffix));

			output = this.tagHandler('each', key, output, function(keys, original, template) {
				var key = keys[1];
				var array = (key === 'this') ? data : getByString(data, key);

				return array.reduce(function(previous, current) {
					return previous += template.render(current);
				}, '');
			});

			output = this.tagHandler('ifnot', key, output, function(keys, original, template) {
				var key = keys[1];
				var desired = keys[2];

				desired = (desired == 'false') ? false : desired;
				desired = (desired == 'true') ? true : desired;

				return (data[key] != desired) ? original : '';
			});

			output = this.tagHandler('if', key, output, function(keys, original, template) {
				var key = keys[1];
				var desired = keys[2];

				desired = (desired == 'false') ? false : desired;
				desired = (desired == 'true') ? true : desired;

				return (data[key] == desired) ? original : '';
			});

			// Handle normal variables
			var value = (key === 'this') ? data : getByString(data, key);
			if (typeof(value) === 'function') {
				value = value.call(data);
			}
			output = output.replace(this.prefix + key + this.suffix, value);
		}

		return output;
	};

	Template.prototype.tagHandler = function(tagName, key, output, processor) {
		if (key.indexOf(this.tagPrefix + tagName) > -1) {
			var openingTag = this.prefix + key + this.suffix;
			var closingTag = this.prefix + this.tagSuffix + tagName + this.suffix;

			var original = output.substring(output.indexOf(openingTag) + openingTag.length);
			original = original.substring(0, original.indexOf(closingTag));

			var template = new Template('' + original);

			var replacement = processor(key.split(' '), original, template);

			output = output.replace(openingTag + original + closingTag, replacement);
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