// OBJECT for simple Handlebars-like compiling of templates

;(function() {
	'use strict';

	var Template = function(template, model) {
		this.template = template;

		return this;
	};

	Template.prototype.prefix = '{{';
	Template.prototype.suffix = '}}';

	Template.prototype.render = function(data) {
		var output = this.template;
		data = data ? data : {};

		while (output.indexOf(this.prefix) > -1) {
			var key = output.substring(output.indexOf(this.prefix) + this.prefix.length, output.indexOf(this.suffix));
			var value = getByString(data, key);
			if (typeof(value) === 'function') {
				value = value.call(data);
			}
			output = output.replace(this.prefix + key + this.suffix, value);
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