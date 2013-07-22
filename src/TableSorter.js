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
			this.$thead = this.$table.find(this.options.thead);
			this.headings = this.getHeadings(this.options.headings);
			this.rows = this.getRows(this.options.rows);
			this.paintZebra(this.options.zebraClasses);	
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
		getDatatype: function(th) {
			return th.getAttribute('data-datatype') || 'string';
		},
		getDatatypeProcessor: function(th) {
			var type = this.getDatatype(th);
			if (!$.TableSorter.datatypes[type]) {
				throw new Error('Unknown datatype `' + type +'`; function not found on $.TableSorter.datatypes.' + type + '.');
			}
			return $.TableSorter.datatypes[type];
		},
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
			return function(th) {
				return $.TableSorter.collectors[type](th, arg);
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
					thsByIdx[thIdx++] = {element:th, values:[]};
				}
			}
			for (c = 0; c < thIdx; c++) {
				processor = this.getDatatypeProcessor(thsByIdx[c].element);
				collector = this.getCollector(thsByIdx[c].element, c);
				for (r = 0, rlen = this.rows.length; r < rlen; r++) {
					thsByIdx[c].values.push({
						tr: this.rows[r],
						val: processor( collector(this.rows[r]) )
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
		 * Paint the rows with zebra classes
		 * @method paintZebra
		 * @param {Array} cssClasses  A list of classes to repeat such as ['odd','even']
		 * @return {TableSorter}
		 * @chainable
		 */
		paintZebra: function(cssClasses) {
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
		string: function(s) {
			return $.trim(s);
		},
		number: function(number) {
			// parse float after removing leading characters besides digits, decimal points, and signs
			return parseFloat(number.replace(/^[^\d\.+\-]+/, ''));
		}
	};	
	
	$.TableSorter.collectors = {
		attr: function(row, value) {
			return row.getAttribute(value);
		},
		column: function(row, idx) {
			return getText(row.children[idx-1]);
		},
		selector: document.querySelector ? 
			function(row, selector) {			
				return selector.match(/(\:|\()/) ? $(row).find(selector).text() : getText(row.querySelector(selector));
			} :
			function (row, selector) {
				return $(row).find(selector).text();
			},
		callback: function(row, name) {
			return window[name](row);
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
