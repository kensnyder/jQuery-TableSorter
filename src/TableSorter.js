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
	
	// get our document once
	var $document = $(document);

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

		 * @param {String|jQuery|HTMLElement} $TableSorter  The 
		 * @param {Object} [options=TableSorter.defaultOptions] See {{#crossLink "TableSorter/options:property"}}options property{{/crossLink}} for full documentation
		 */
		initialize: function($element, options) {
			this.$table = $($element);
			this.options = $.extend({}, $.TableSorter.defaultOptions, options || {});		
						
			/**
			 * Fired after initialization
			 * @event Initialize
			 * @param {}
			 * @ifprevented  The 
			 * @example       
			 
	

			 */						
		}
		
	}
  
	//
	// static properties and methods
	//
	$.TableSorter.version = '%VERSION%';
	
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
			var instance = new Ctor($elem, options);
			$elem.data('TableSorterInstance', instance);
		});
	}
	
}));  
