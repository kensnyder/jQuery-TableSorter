(function (factory) {
	// AMD compatibility
	// https://github.com/umdjs/umd/blob/6c10fc0af1e1692cf430c9eb7f530d6b5a5d758b/jqueryPlugin.js
	if (typeof define === 'function' && define.amd) {
		// AMD environment
		define(['jquery'], factory);
	} else {
		// Browser environment
		factory(jQuery);
	}
}(function($) {
	"use strict";
	/**
	 * @module jQuery
	 */
	
	function getText(node) {
		return node ? (node.innerText || node.textContent || '') : '';
	}
	
	// Our true constructor function. See jQuery.TableSorter.prototype.initialize for documentation
	$.TableSorter = function() {
		this.initialize.apply(this, Array.prototype.slice.call(arguments));
	};
	/**
	 * Default options. Change these to globally change the default options
	 * See {{#crossLink "TableSorter/constructor:method"}}constructor{{/crossLink}} for documentation on each option
	 * @property {Object} defaultOptions
	 * @static
	*/
	$.TableSorter.defaultOptions = {
		zebra: false,
		thead: 'tr:eq(0)',
		headings: 'th',
		rows: 'tr:gt(0)'
	};
	$.TableSorter.prototype = {
		/**
		 * The current options. Starts with value given in constructor
		 * @property {Object} options
		 *   @param 
		 *   @param {Function} [options.onInitialize]  Add a {{#crossLink "TableSorter/Initialize:event"}}Initialize event{{/crossLink}}
		 *   @example
	
	
	
		 */
		/**
		 * 
		 * @property {}
		 */				
		/**
		 * @class TableSorter
		 * @constructor
		 * @example

	// Instantiate the OOP way
	var instance = new $.TableSorter('selector', options)
		
	// Instantiate the jQuery way
	$('selector').tablesorter(options);
	// call methods on the instance
	$('selector').tablesorter('method', arg1, arg2);
	// initialize and get back instance
	var instance = $('selector').tablesorter('getInstance');

		 * @param {String|jQuery|HTMLElement} $element  The selector, jQuery object, or Element to make sortable (may be a table or any other element)
		 * @param {Object} [options=TableSorter.defaultOptions] See {{#crossLink "TableSorter/options:property"}}options property{{/crossLink}} for full documentation
		 */
		initialize: function($element, options) {
			this.$table = $($element);
			if (this.$table.length === 0) {
				return;
			}
			this.options = $.extend({}, $.TableSorter.defaultOptions, options || {});
			this.$placeholder = $('<div />');
			this.filters = {};
			this._index();
			/**
			 * Fired after initialization
			 * @event Initialize
			 * @param {}
			 * @ifprevented  The 
			 * @example
			 
	

			 */						
		},
		/**
		 * Get this instance. Useful for jQuery-style usage:  var instance = $('input').tablesorter(options).tablesorter('getInstance')
		 * @method getInstance
		 * @return {TableSorter}
		 */
		getInstance: function() {
			return this;
		},		
		/**
		 * Gather table elements, zebra stripe, and clear value cache. Performed on initialization and on re-indexing
		 * @method _index
		 * @private
		 */
		_index: function() {
			this.$thead = this.$table.find(this.options.thead);
			this.headings = this._getHeadings(this.options.headings);
			this.rows = this._getRows(this.options.rows);
			this.zebra(this.options.zebra);			
			this._valueCache = [];
		},
		/**
		 * Trigger indexing after something in the table changes
		 * @method reindex
		 * @return {TableSorter}
		 * @chainable
		 */
		reindex: function() {
			this._index();
			return this;
		},
		/**
		 * Find all the headings matching the given selector
		 * @method _getHeadings
		 * @private
		 * @param {String|HTMLElement[]} selector  CSS selector to find the rows OR a Collection of HTMLTableRowElement objects
		 * @return {HTMLElement[]}
		 */
		_getHeadings: function(selector) {
			return this.$table.find(selector).toArray();
		},
		/**
		 * Find all the rows matching the given selector
		 * @method _getRows
		 * @private
		 * @param {String|HTMLElement[]} selector  CSS selector to find the rows OR a Collection of HTMLTableRowElement objects
		 * @return {HTMLElement[]}
		 */
		_getRows: function(selector) {
			return this.$table.find(selector).toArray();
		},
		/**
		 * Set the collected values for the given column
		 * @method setValues
		 * @param {Number} colNum  The index of the column starting with 1
		 * @param {HTMLElement} th  The table heading element
		 * @param {Array} values  The array of values that was collected
		 * @return {TableSorter}
		 * @chainable
		 */
		setValues: function(colNum, th, values) {
			this._valueCache.push({column: colNum+1, heading:th, values:values});
			return this;
		},
		/**
		 * Get the values associated with the given column
		 * @method getValues
		 * @param {HtmlElement|Number} th  The header element for which to get the values or the 1-based index of the column in the DOM
		 * @return {Array|null}  Array of values or null if th is not recognized
		 */
		getValues: function(th) {
			var key;
			if (this.headings.length === 0) {
				return null;
			}
			if (this._valueCache.length === 0) {
				this._collectValues();
			}
			if (typeof th == 'string') {
				th = parseInt(th, 10);
			}
			key = (typeof th == 'number' ? 'column' : 'heading');
			for (var i = 0, len = this._valueCache.length; i < len; i++) {
				if (this._valueCache[i][key] === th) {
					return this._valueCache[i].values;
				}
			}	
			return null;
		},
		/**
		 * Get the datatype of the given column
		 * @method getDatatype
		 * @param {HTMLElement} th  The table heading element (a member of this.headings)
		 * @return {String}  The datatype specified in the th attribute data-datatype (string|number)
		 */
		getDatatype: function(th) {
			return th.getAttribute('data-datatype') || 'string';
		},
		/**
		 * Get the function needed to process values in the given column (strings or numbers)
		 * @method getDatatypeProcessor
		 * @param {HTMLElement} th  The table heading element (a member of this.headings)
		 * @return {Function}
		 */
		getDatatypeProcessor: function(th) {
			var type = this.getDatatype(th);
			if (!$.TableSorter.datatypes[type]) {
				throw new Error('Unknown datatype `' + type +'`; function not found on $.TableSorter.datatypes.' + type + '.');
			}
			return $.TableSorter.datatypes[type];
		},
		/**
		 * Get the function needed to colect values for each row in the given column (e.g. cell text or attribute on row)
		 * @method getDatatypeProcessor
		 * @param {HTMLElement} th  The table heading element (a member of this.headings)
		 * @param {Number} idx  The index of the heading in the DOM
		 * @return {Function}  A function that takes argument tr (HTMLElement) and returning the value for that row and column
		 */
		getCollector: function(th, idx) {
			var type, arg;
			for (type in $.TableSorter.collectors) {
				arg = th.getAttribute('data-'+type);
				if (arg) {
					break;
				}
			}
			if (!arg) {
				arg = idx + 1;
				type = 'column';
			}
			return function(i, tr) {
				return $.TableSorter.collectors[type](i, tr, arg);
			};
		},
		/**
		 * Collect and store the values associated with each column
		 * @method getValues
		 * @return {undefined}
		 */
		_collectValues: function() {
			var c, clen, r, rlen, thIdx = 0, th, values, processor, collector;
			var compare = function(a, b) {
				return (a.val === b.val) ? 0 : (a.val > b.val ? 1 : -1);
			};			
			var theadChildren = this.$thead.children();			
			for (c = 0, clen = theadChildren.length; c < clen; c++) {
				th = theadChildren[c];
				if (th === this.headings[thIdx]) {
					thIdx++;
					processor = this.getDatatypeProcessor(th);
					collector = this.getCollector(th, c);
					values = [];
					for (r = 0, rlen = this.rows.length; r < rlen; r++) {
						values.push({
							tr: this.rows[r],
							val: processor( collector(r, this.rows[r]) )
						});					
					}
					this.setValues(c, th, values.sort(compare));
				}
			}
		},
		/**
		 * Sort on the given column
		 * @method sort
		 * @param {HTMLElement} th  The header element to sort on
		 * @param {String|Number} [direction=ASC]  Sort ascending or descending (-1/DESC/desc or 1/ASC/asc)
		 * @return {TableSorter}
		 */
		sort: function(th, direction) {
			var table, i, len, idx, resortedRows = [];
			// 1 = ascending, -1 = descending
			direction = direction && (/desc|-1/i).test(direction) ? -1 : 1;			
			// detach table element from DOM while sorting because it is faster: http://jsperf.com/to-detach-or-not-to-detach
			this.$table.replaceWith(this.$placeholder);
			table = this.$table.get(0);
			// TODO: handle one or more tbodies and thead if needed?
			var values = this.getValues(th);
			for (i = 0, len = values.length; i < len; i++) {
				idx = (direction == 1 ? i : len - i - 1);
				table.appendChild(values[idx].tr);
				resortedRows[i] = values[idx].tr;
			}
			this.rows = resortedRows;
			this.zebra(this.options.zebra);
			// re-attache table element into the DOM
			this.$placeholder.replaceWith(this.$table);
			return this;
		},
		/**
		 * Filter out and hide rows with a callback (signature 1)
		 * @method filter
		 * @param {Function} callack  A callback to apply to each row; if it returns truthy, the row will be displayed otherwise it will be hidden
		 * @return {TableSorter}
		 */
		/**
		 * Filter out and hide rows with a pre-defined filter (signature 2)
		 * @method filter
		 * @param {String} name  The name of the filter defined with defineFilter()
		 * @param {Any} [args]*  One or more arguments to pass to the filter's rule callback
		 * @return {TableSorter}
		 */
		filter: function(callback) {
			var i, len, args, spec, applyWith;
			if (typeof callback == 'string') {
				// signature 2: named filter
				spec = this.filters[callback];
				if (!spec) {
					throw new TypeError('Unknown filter `' + callback + '`. Filters must be pre-defined with defineFilter(name,spec).');
				}
				args = [].slice.call(arguments, 1);
				if (spec.dynamicRule) {
					// create an applyWith array so we can avoid the slowdown of concat in each loop
					// see http://jsperf.com/concat-inside-loop-vs-outside-loop
					applyWith = [undefined,undefined].concat(args);
					for (i = 0, len = this.rows.length; i < len; i++) {
						applyWith[0] = i;
						applyWith[1] = this.rows[i];
						this.rows[i].style.display = (spec.dynamicRule.apply(null, applyWith) ? '' : 'none');
					}
				}
				else {
					// create an applyWith array so we can avoid the slowdown of concat in each loop
					// see http://jsperf.com/concat-inside-loop-vs-outside-loop
					applyWith = [undefined,undefined].concat(args);
					for (i = 0, len = spec.values.length; i < len; i++) {
						applyWith[0] = i;
						applyWith[1] = spec.values[i];
						this.rows[i].style.display = (spec.rule.apply(null, applyWith) ? '' : 'none');
					}
				}
			}
			else {
				// signature 1: callback
				for (i = 0, len = this.rows.length; i < len; i++) {
					this.rows[i].style.display = (callback(i, this.rows[i]) ? '' : 'none');
				}
			}
			this.zebra(this.options.zebra);
			return this;
		},
		/**
		 * Define a filter than can be given parameters later
		 * @method defineFilter
		 * @param {String} name  The name of the filter to be called later by this.filter(name)
		 * @param {Object} spec  A definition of the filter
		 * @param {Number} [spec.column]  The 1-based index of the column to use
		 * @param {Function|Array} [spec.collector]  A function to use to collect values OR an Array with a name of a property in $.TableSorter.collectors and params to pass to that function
		 */
		defineFilter: function(name, spec) {
			var i, len, applyWith, collector, processor;
			if (spec.column) {
				spec.collector = ['column', spec.column];
			}
			if (typeof spec.datatype == 'string') {
				processor = $.TableSorter.datatypes[ spec.datatype ];
				if (!processor) {
					throw new TypeError('Unknown datatype `' + spec.datatype + '`. A filter datatype must be a function or property of $.TableSorter.datatypes.');
				}
			}
			if (typeof spec.datatype == 'function') {
				processor = spec.datatype;
			}
			if (typeof spec.collector == 'function' && processor) {
				spec.collector = (function(collector) {
					return function(i, row) {
						return processor( collector(i, row) );
					};
				})(spec.collector);
			}			
			if ($.isArray(spec.collector)) {
				collector = $.TableSorter.collectors[ spec.collector[0] ];
				// run concat outside loop
				// see http://jsperf.com/concat-inside-loop-vs-outside-loop
				applyWith = [undefined,undefined].concat(spec.collector.slice(1));
				if (processor) {
					spec.collector = function(i, row) {
						applyWith[0] = i;
						applyWith[1] = row;
						return processor( collector.apply(null, applyWith) );
					};
				}
				else {
					spec.collector = function(i, row) {
						applyWith[0] = i;
						applyWith[1] = row;
						return collector.apply(null, applyWith);
					};
				}
			}
			if (!spec.dynamicRule) {
				spec.values = [];
				for (i = 0, len = this.rows.length; i < len; i++) {
					spec.values.push(spec.collector(i, this.rows[i]));
				}
				if (!spec.rule) {
					spec.rule = $.TableSorter.rules.contains;
				}				
				if (typeof spec.rule == 'string' && !!$.TableSorter.rules[spec.rule]) {
					spec.rule = $.TableSorter.rules[spec.rule];
				}
				if (typeof spec.rule != 'function') {
					throw new TypeError('defineFilter(name, spec) - spec.rule `'+spec.rule+'` must be a function or a property of $.TableSorter.rules');
				}
			}
			this.filters[name] = spec;
		},
		/**
		 * Paint the rows with zebra classes
		 * @method zebra
		 * @param {Array} cssClasses  A list of classes to repeat such as ['odd','even']
		 * @return {TableSorter}
		 * @chainable
		 */
		zebra: function(cssClasses) {
			if (!cssClasses || cssClasses.length === 0) {
				return this;
			}
			var mod = cssClasses.length;
			var regex = new RegExp('\\b('+cssClasses.join('|')+')\\b', 'g');
			var idx = 0;
			for (var i = 0, len = this.rows.length; i < len; i++) {
				if (this.rows[i].style.display == 'none') {
					continue;
				}
				this.rows[i].className = this.rows[i].className.replace(regex, '') + (' ' + cssClasses[idx++ % mod]);
			}
			return this;
		}
	};
  
	//
	// static properties and methods
	//
	$.TableSorter.version = '%VERSION%';
	
	$.TableSorter.datatypes = {
		string: Array.prototype.trim ? 
			function(s) {
				return s.trim();
			} :
			function(s) {
				return $.trim(s);
			},
		number: function(number) {
			// parse float after removing leading characters besides digits, decimal points, and signs (e.g. currency symbols)
			return parseFloat(number.replace(/^[^\d\.+\-]+/, ''));
		},
		date: function(dateStr) {
			var timeParts, dateParts, match, parsers, i, len;
			parsers = $.TableSorter.dateUtils.dateParsers;
			for (i = 0, len = parsers.length; i < len; i++) {
				if ((match = dateStr.match(parsers[i].matcher))) {
					dateParts = parsers[i].getParts(match);
					break;
				}
			}
			parsers = $.TableSorter.dateUtils.timeParsers;
			for (i = 0, len = parsers.length; i < len; i++) {
				if ((match = dateStr.match(parsers[i].matcher))) {
					timeParts = parsers[i].getParts(match);
					break;
				}
			}
			if (!dateParts && !timeParts) {
				return 0;
			}
			if (!dateParts) {
				dateParts = util.today;
			}
			if (!timeParts) {
				timeParts = [0,0,0];
			}
			return new Date(
				parseInt(dateParts[0],10), 
				parseInt(dateParts[1],10)-1,
				parseInt(dateParts[2],10),
				parseInt(timeParts[0],10),
				parseInt(timeParts[1],10),
				parseInt(timeParts[2],10),
				parseInt(timeParts[3],10)
			).getTime();
		}
	};
	
	var now = new Date();
	
	var util = $.TableSorter.dateUtils = {
		today: [now.getFullYear(), now.getMonth(), now.getDate()],
		monthLookup: {'jan':1, 'feb':2, 'mar':3, 'apr':4, 'may':5, 'jun':6, 'jul':7, 'aug':8, 'sep':9, 'oct':10, 'nov':11, 'dec':12},
		regexes: {
			YEAR: "[1-9]\\d{3}",
			MONTH: "1[0-2]|0?[1-9]",
			MONTHNAME: "jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|september|oct|october|nov|november|dec|december",
			DAY: "3[01]|[12]\\d|0?[1-9]",
			DAY2: "3[01]|[12]\\d|0[1-9]",
			TIMEZONE: "[+-][01]\\d\\:?[0-5]\\d",
			H24: "[01]\\d|2[0-3]",
			MIN: "[0-5]\\d",
			SEC: "[0-5]\\d",
			MS: "\\d{3,}",
			H12: "0?[1-9]|1[012]",
			AMPM: "am|pm"	
		},
		makePattern: function(code) {
			code = code.replace(/_([A-Z][A-Z0-9]+)_/g, function($0, $1) {
				return util.regexes[$1];
			});
			return new RegExp(code, 'i');
		}
	};
	util.timeParsers = [
		{
			// 8:32pm
			matcher: util.makePattern("(?:\\b|T| )(_H12_)(?:\\:(_MIN_)(?:\\:(_SEC_))?)? ?(_AMPM_)"),
			getParts: function(match) {
				var hour = parseInt(match[1], 10);
				hour = match[2].toLowerCase() == 'am' ? (hour == 12 ? 0 : hour) : (hour == 12 ? 12 : hour + 12);
				var min = match[2] || 0;
				var sec = match[3] || 0;
				return [hour, min, sec, 0];
			}
		},
		{
			// 20:32:00
			matcher: util.makePattern("(?:\\b|T| )(_H24_)\\:(_MIN_)(?:\\:(_SEC_)(?:\\.(_MS_))?)?"),
			getParts: function(match) {
				var hour = match[1];
				var min = match[2];
				var sec = match[3] || 0;
				var ms = match[4] || 0;
				return [hour, min, sec, ms];
			}
		}
	];
	util.dateParsers = [
		{
			// 7/28/2013
			matcher: util.makePattern("^(_MONTH_)( ?[\\/-] ?)(_DAY_)\\2(_YEAR_)"),
			getParts: function(match) {
				var m = match[1];
				var d = match[3];
				var Y = match[4];
				return [Y, m, d];
			}
		},
		{
			// 2013-07-28
			matcher: util.makePattern("^(_YEAR_)-(_MONTH_)-(_DAY_)"),
			getParts: function(match) {
				var Y = match[1];
				var m = match[2];
				var d = match[3];
				return [Y, m, d];
			}
		},
		{
			// 28 Jul 2013
			matcher: util.makePattern("^(_DAY_)([ -])(_MONTHNAME_).?\\2(_YEAR_)"),
			getParts: function(match) {
				var Y = match[4];
				var m = util.monthLookup[match[3].toLowerCase().slice(0,3)];
				var d = match[1];
				return [Y, m, d];
			}
		},
		{
			// Jul 28, 2013
			matcher: util.makePattern("^(_MONTHNAME_) (_DAY_),? (_YEAR_)"),
			getParts: function(match) {
				var Y = match[3];
				var m = util.monthLookup[match[1].toLowerCase().slice(0,3)];
				var d = match[2];
				return [Y, m, d];
			}
		}
	];
	
	/**
	 * 
	 */
	$.TableSorter.collectors = {
		attr: function(i, row, attrName) {
			return row.getAttribute(attrName);
		},
		cellAttr: function(i, row, cellSelector, attrName) {
			if (typeof cellSelector == 'number') {
				return row.children[cellSelector-1].getAttribute(attrName);
			}
			return $(row).find(cellSelector).attr(attrName);
		},
		column: function(i, row, idx) {
			return getText(row.children[idx-1]);
		},
		columns: function(i, row, idxList, glue) {
			idxList = idxList.split(/\s*,\s*/);
			var text = [];
			for (var j = 0, len = idxList.length; j < len; j++) {
				text.push(getText(row.children[idxList[j]-1]));
			}
			return text.join(glue || ' ');
		},
		selector: function(i, row, selector) {
			return $(row).find(selector).text();
		},
		callback: function(i, row, name) {
			return window[name](row);
		}
	};
	
	$.TableSorter.rules = {
		same: function(i, cellValue, search) {
			return cellValue.toLowerCase() === search.toLowerCase();
		},
		exact: function(i, cellValue, search) {
			return cellValue === search;
		},
		contains: function(i, cellValue, search) {
			return cellValue.toLowerCase().indexOf(search.toLowerCase()) > -1;
		},
		containsCaseSensitive: function(i, cellValue, search) {
			return cellValue.indexOf(search) > -1;
		},
		matchAt: function(i, cellValue, search, atIndex) {
			return cellValue.toLowerCase().indexOf(search.toLowerCase()) === atIndex;
		},
		matchAtCaseSensitive: function(i, cellValue, search, at) {
			return cellValue.indexOf(search) === at;
		},
		startsWith: function(i, cellValue, search) {
			return cellValue.toLowerCase().indexOf(search.toLowerCase()) === 0;
		},
		startsWithCaseSensitive: function(i, cellValue, search) {
			return cellValue.indexOf(search) === 0;
		},
		regExp: function(i, cellValue, regExp) {
			return regExp.test(cellValue);
		},
		gt: function(i, cellValue, compareTo) {
			return parseFloat(cellValue) > compareTo;
		},
		gte: function(i, cellValue, compareTo) {
			return parseFloat(cellValue) >= compareTo;
		},
		lt: function(i, cellValue, compareTo) {
			return parseFloat(cellValue) < compareTo;			
		},
		lte: function(i, cellValue, compareTo) {
			return parseFloat(cellValue) <= compareTo;			
		},
		eq: function(i, cellValue, compareTo) {
			return parseFloat(cellValue) === compareTo;			
		},
		ne: function(i, cellValue, compareTo) {
			return parseFloat(cellValue) != compareTo;			
		},
		between: function(i, cellValue, min, max) {
			var val = parseFloat(cellValue);
			return val >= min && val <= max;			
		},
		outside: function(i, cellValue, upTo, orAbove) {
			var val = parseFloat(cellValue);
			return val < upTo || val > orAbove;			
		},
		isEmpty: function(i, cellValue) {
			return cellValue === '';
		},
		isNotEmpty: function(i, cellValue) {
			return cellValue !== '';
		}
	};
	
	
	$.fn.tablesorter = function(options) {  
		var instance = this.data('TableSorterInstance');
		// handle where first arg is method TableSorter and additional args should be passed to that method
		if (typeof options == 'string' && instance instanceof $.TableSorter && typeof this.data('TableSorterInstance')[options] == 'function') {
			var args = Array.prototype.slice.call(arguments, 1);
			return this.data('TableSorterInstance')[options].apply(this.data('TableSorterInstance'), args);
		}
		if (this.data('TableSorterInstance')) {
			return this;
		}
		// otherwise create new $.TableSorter instance but return the jQuery instance
		return this.each(function() {     
			var $elem = $(this);
			var instance = new $.TableSorter($elem, options);
			$elem.data('TableSorterInstance', instance);
		});
	};
	
}));  
