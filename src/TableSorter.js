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
		zebraClasses: false,
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
			this.filters = this.options.filters || {};
			this.$placeholder = $('<div />');
			this.$thead = this.$table.find(this.options.thead);
			this.headings = this.getHeadings(this.options.headings);
			this.rows = this.getRows(this.options.rows);
			this.zebra(this.options.zebraClasses);
			/**
			 * Fired after initialization
			 * @event Initialize
			 * @param {}
			 * @ifprevented  The 
			 * @example       
			 
	

			 */						
		},
		/**
		 * Find all the headings matching the given selector
		 * @method getHeadings
		 * @param {String|HTMLElement[]} selector  CSS selector to find the rows OR a Collection of HTMLTableRowElement objects
		 * @return {HTMLElement[]}
		 */
		getHeadings: function(selector) {
			return this.$table.find(selector).toArray();
		},
		/**
		 * Find all the rows matching the given selector
		 * @method getRows
		 * @param {String|HTMLElement[]} selector  CSS selector to find the rows OR a Collection of HTMLTableRowElement objects
		 * @return {HTMLElement[]}
		 */
		getRows: function(selector) {
			return this.$table.find(selector).toArray();
		},
		/**
		 * Get the values associated with the given column
		 * @method getValues
		 * @param {HtmlElement} th  The header element for which to get the values
		 * @return {Array}
		 */
		getValues: function(th) {
			if (!th.TableSorterValues) {
				this._collectValues();
			}
			return th.TableSorterValues;
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
			var c, clen, r, rlen, thIdx = 0, th, thsByIdx = {}, processor, collector;
			var children = this.$thead.children();
			
			for (c = 0, clen = children.length; c < clen; c++) {
				th = children[c];
				if (th === this.headings[thIdx]) {
					thsByIdx[thIdx++] = {element:th, values:[], idx:c};
				}
			}
			for (c = 0; c < thIdx; c++) {
				processor = this.getDatatypeProcessor(thsByIdx[c].element);
				collector = this.getCollector(thsByIdx[c].element, thsByIdx[c].idx);
				for (r = 0, rlen = this.rows.length; r < rlen; r++) {
					thsByIdx[c].values.push({
						tr: this.rows[r],
						val: processor( collector(r, this.rows[r]) )
					});					
				}
			}
			var compare = function(a, b) {
				return (a.val === b.val) ? 0 : (a.val > b.val ? 1 : -1);
			};
			for (c = 0; c < thIdx; c++) {
				thsByIdx[c].element.TableSorterValues = thsByIdx[c].values.sort(compare);
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
			var table, i, len;
			if (!th.TableSorterValues) {
				this._collectValues();
			}
			direction = direction && (/desc|-1/i).test(direction) ? -1 : 1;			
			// detach table element from DOM while sorting because it is faster: http://jsperf.com/to-detach-or-not-to-detach
			this.$table.replaceWith(this.$placeholder);
			table = this.$table.get(0);
			// TODO: handle one or more tbodies and thead if needed?
			if (direction == 1) {
				for (i = 0, len = th.TableSorterValues.length; i < len; i++) {
					table.appendChild(th.TableSorterValues[i].tr);
				}
			}
			else {
				for (i = th.TableSorterValues.length - 1; i >= 0; i--) {
					table.appendChild(th.TableSorterValues[i].tr);
				}				
			}
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
		 * @param {Any} arg..  One or more arguments to pass to the filter's rule callback
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
					if (spec.setup) {
						args = spec.setup(args);
					}
					applyWith = [undefined,undefined].concat(args);
					for (i = 0, len = this.rows.length; i < len; i++) {
						applyWith[0] = i;
						applyWith[1] = this.rows[i];
						this.rows[i].style.display = spec.dynamicRule.apply(null, applyWith) ? '' : 'none';
					}
				}
				else {
					// apply is faster than call
					// create an applyWith array so we can avoid the slowdown of concat in each loop
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
			return this;
		},
		defineFilter: function(name, spec) {
			var i, len, withArgs, fn;
			if (spec.column) {
				spec.collector = ['column', spec.column];
			}
			if ($.isArray(spec.collector)) {
				fn = $.TableSorter.collectors[ spec.collector[0] ];
				// run concat outside loop
				// see http://jsperf.com/concat-inside-loop-vs-outside-loop
				withArgs = [undefined,undefined].concat(spec.collector.slice(1));
				spec.collector = function(i, row) {
					withArgs[0] = i;
					withArgs[1] = row;
					return fn.apply(null, withArgs);
				};
			}
			if (!spec.dynamicRule) {
				spec.values = [];
				for (i = 0, len = this.rows.length; i < len; i++) {
					spec.values.push(spec.collector(i, this.rows[i]));
				}
				if (!spec.rule) {
					spec.rule = $.TableSorter.rules.matchAnywhere;
				}				
				if (typeof spec.rule == 'string' && !!$.TableSorter.rules[spec.rule]) {
					spec.rule = $.TableSorter.rules[spec.rule];
				}
				if (typeof spec.rule != 'function') {
					throw new TypeError('defineFilter(name, spec) - spec.rule `'+spec.rule+'` must be a function or a key in $.TableSorter.rules');
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
			// parse float after removing leading characters besides digits, decimal points, and signs
			return parseFloat(number.replace(/^[^\d\.+\-]+/, ''));
		}
	};	
	
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
		matchAnywhere: function(i, cellValue, search) {
			return cellValue.toLowerCase().indexOf(search.toLowerCase()) > -1;
		},
		matchAnywhereCaseSensitive: function(i, cellValue, search) {
			return cellValue.indexOf(search) > -1;
		},
		matchAt: function(i, cellValue, search, at) {
			return cellValue.toLowerCase().indexOf(search.toLowerCase()) === at;
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
		greaterThan: function(i, cellValue, compareTo) {
			return parseFloat(cellValue) > compareTo;
		},
		lessThan: function(i, cellValue, compareTo) {
			return parseFloat(cellValue) < compareTo;			
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
