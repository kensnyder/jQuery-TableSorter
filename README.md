jQuery Table Sorter
=

Version 0.1.0-pre, Jul 2013, MIT License

High performance table sort and filter

[Download](https://github.com/kensnyder/jQuery-TableSorter/TableSorter-0.1.0-pre-Download.zip?raw=true), [Demos](#), [Unit tests](#)

Table of Contents
-

<ul>
	<li><a href="#introduction">Introduction</a></li>
	<li><a href="#how-to-use">How to Use</a></li>
	<li><a href="#options">Options</a></li>
	<li><a href="#events">Events</a></li>
	<li><a href="#instance-properties">Instance Properties</a></li>
	<li><a href="#instance-methods">Instance Methods</a></li>
	<li><a href="#static-members">Static Members</a></li>
	<li><a href="#more-examples">More Examples</a></li>
	<li><a href="#changelog">Changelog</a></li>
	<li><a href="#contributing">Contributing</a></li>
	<li><a href="#reporting-bugs">Reporting Bugs</a></li>
	<li><a href="#license">License</a></li>
</ul>

Introduction
-

Features include:

* One
* Two
* Unit tested
* Works on IE8+, FF, Chrome, Safari
* Compatible with AMD


How to Use
-

Hi

```html
<link  href="/js/TableSorter.min.css" rel="stylesheet" />
<script src="/js/TableSorter.min.js"></script>
```

Then somewhere in your code, call:

```javascript
var instance = new $.TableSorter(selector, options);
// OR
$(selector).tablesorter(options);
```

See the documentation below for a full list of options.

Options
-

<table>
	<tr>
		<th>Type</th>
		<th>Option Name</th>
		<th>Default</th>
		<th>Description</th>
	<tr>
	<tr>
		<td>{Function}</td>
		<td><strong>onInitialize</strong></td>
		<td></td>
		<td>Add a Initialize event</td>
	</tr>
	
</table>

Also note that default options can be overwritten by altering `$.TableSorter.defaultOptions`.

Events
-

Events can be passed as options to the constructor, or can be added later using jQuery event methods `.on()`, `.off()`, `.bind()` `.one()`, `.unbind()` and `.trigger()`

For example:

```javascript
// Register events in initial options
$(input).tablesorter({
	option1: value1,
	onEVENT: doStuff
});
// Register events later
$(input).tablesorter({
	option1: value1
}).tablesorter('bind', 'EVENT', doStuff);
```

How is data passed to event callbacks?

* Each event callback receives one argument: `event`
* `event` is a jQuery event object
* `event` also contains useful information related to the event. See the [Events](#events) section below for more information.
* When an event has a default action that can be prevented, `event` will have property `cancelable` set to true and `event.isCancelable()` will return true
* To prevent a default action, call `event.preventDefault()`
* To cancel the firing of other attached callbacks, call `event.stopImmediatePropagation()`
* In some case, altering information on the `event` object will change the behavior of the default action
* The callback will be fired in the scope of the TableSorter instance. In other words, using `this` in the callback will refer to the TableSorter instance. See the [Instance Properties](#instance-properties) and [Instance Methods](#instance-methods) sections below for more information.

The following is a description of each event.

<table>
	<tr>
		<th>Event</th>
		<th>Data available on <code>event</code></th>
		<th>Effect of `event.preventDefault()`</th>
	</tr>
	<tr>
		<td><strong>Initialize</strong><br />Fired after initialization</td>
		<td>
			{} <strong>UNKNOWN</strong> <br />
		</td>
		<td>The</td>
	</tr>
	
</table>
			
Instance Properties
-

<table>
	<tr>
		<th>Type</th>
		<th>Name</th>
		<th>Description</th>
	<tr>
	<tr>
		<td>{Object}</td>
		<td><strong>defaultOptions</strong></td>
		<td>Default options. Change these to globally change the default options
See constructor for documentation on each option</td>
	</tr>
	<tr>
		<td>{}</td>
		<td><strong></strong></td>
		<td></td>
	</tr>
	
</table>

Instance Methods
-

Instance methods may be called using an Object Oriented style or with the classic jQuery style:

```javascript
// Object Oriented Style
var tablesorter = new $.TableSorter(input, options);
tablesorter.methodName(arg1, arg2, argN);

// jQuery Style
$(input).tablesorter(options);
$(input).tablesorter('methodName', arg1, arg2, argN);

// jQuery Style followed by Object Oriented Style
$(input).tablesorter(options);
var instance = $(input).tablesorter('getInstance');
instance.methodName(arg1, arg2, argN);
```

<table>

<tr>
	<td>
		<strong>getInstance</strong>()<br />
		Get this instance. Useful for jQuery-style usage:  var instance = $(&#x27;input&#x27;).tablesorter(options).tablesorter(&#x27;getInstance&#x27;)
		<br />
		<strong>@return</strong> {TableSorter} 
	</td>
</tr>

<tr>
	<td>
		<strong>_index</strong>()<br />
		Gather table elements, zebra stripe, and clear value cache. Performed on initialization and on re-indexing
		<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>reindex</strong>()<br />
		Trigger indexing after something in the table changes
		<br />
		<strong>@return</strong> {TableSorter} 
	</td>
</tr>

<tr>
	<td>
		<strong>_getHeadings</strong>(selector)<br />
		Find all the headings matching the given selector<br />
		<strong>@param</strong> {String|HTMLElement[]} selector CSS selector to find the rows OR a Collection of HTMLTableRowElement objects<br />
		<strong>@return</strong> {HTMLElement[]} 
	</td>
</tr>

<tr>
	<td>
		<strong>_getRows</strong>(selector)<br />
		Find all the rows matching the given selector<br />
		<strong>@param</strong> {String|HTMLElement[]} selector CSS selector to find the rows OR a Collection of HTMLTableRowElement objects<br />
		<strong>@return</strong> {HTMLElement[]} 
	</td>
</tr>

<tr>
	<td>
		<strong>setValues</strong>(colNum, th, values)<br />
		Set the collected values for the given column<br />
		<strong>@param</strong> {Number} colNum The index of the column starting with 1<strong>@param</strong> {HTMLElement} th The table heading element<strong>@param</strong> {Array} values The array of values that was collected<br />
		<strong>@return</strong> {TableSorter} 
	</td>
</tr>

<tr>
	<td>
		<strong>getDatatype</strong>(th)<br />
		Get the datatype of the given column<br />
		<strong>@param</strong> {HTMLElement} th The table heading element (a member of this.headings)<br />
		<strong>@return</strong> {String} The datatype specified in the th attribute data-datatype (string|number)
	</td>
</tr>

<tr>
	<td>
		<strong>getDatatypeProcessor</strong>(th)<br />
		Get the function needed to process values in the given column (strings or numbers)<br />
		<strong>@param</strong> {HTMLElement} th The table heading element (a member of this.headings)<br />
		<strong>@return</strong> {Function} 
	</td>
</tr>

<tr>
	<td>
		<strong>getDatatypeProcessor</strong>(th, idx)<br />
		Get the function needed to colect values for each row in the given column (e.g. cell text or attribute on row)<br />
		<strong>@param</strong> {HTMLElement} th The table heading element (a member of this.headings)<strong>@param</strong> {Number} idx The index of the heading in the DOM<br />
		<strong>@return</strong> {Function} A function that takes argument tr (HTMLElement) and returning the value for that row and column
	</td>
</tr>

<tr>
	<td>
		<strong>getValues</strong>()<br />
		Collect and store the values associated with each column
		<br />
		<strong>@return</strong> {Undefined} 
	</td>
</tr>

<tr>
	<td>
		<strong>sort</strong>(th[, direction=ASC])<br />
		Sort on the given column<br />
		<strong>@param</strong> {HTMLElement} th The header element to sort on<strong>@param</strong> {String|Number} [direction=ASC] Sort ascending or descending (-1/DESC/desc or 1/ASC/asc)<br />
		<strong>@return</strong> {TableSorter} 
	</td>
</tr>

<tr>
	<td>
		<strong>filter</strong>(callack)<br />
		Filter out and hide rows with a callback (signature 1)<br />
		<strong>@param</strong> {Function} callack A callback to apply to each row; if it returns truthy, the row will be displayed otherwise it will be hidden<br />
		<strong>@return</strong> {TableSorter} 
	</td>
</tr>

<tr>
	<td>
		<strong>filter</strong>(name[, args])<br />
		Filter out and hide rows with a pre-defined filter (signature 2)<br />
		<strong>@param</strong> {String} name The name of the filter defined with defineFilter()<strong>@param</strong> {Any} [args] One or more arguments to pass to the filter&#x27;s rule callback<br />
		<strong>@return</strong> {TableSorter} 
	</td>
</tr>

<tr>
	<td>
		<strong>defineFilter</strong>(name, spec)<br />
		Define a filter than can be given parameters later<br />
		<strong>@param</strong> {String} name The name of the filter to be called later by this.filter(name)<strong>@param</strong> {Object} spec A definition of the filter<br />
		<strong>@return</strong> {undefined}
	</td>
</tr>

<tr>
	<td>
		<strong>zebra</strong>(cssClasses)<br />
		Paint the rows with zebra classes<br />
		<strong>@param</strong> {Array} cssClasses A list of classes to repeat such as [&#x27;odd&#x27;,&#x27;even&#x27;]<br />
		<strong>@return</strong> {TableSorter} 
	</td>
</tr>

<tr>
	<td>
		<strong>getValues</strong>(th)<br />
		Get the values associated with the given column<br />
		<strong>@param</strong> {HtmlElement|Number} th The header element for which to get the values or the 1-based index of the column in the DOM<br />
		<strong>@return</strong> {Array|null} Array of values or null if th is not recognized
	</td>
</tr>

</table>

More examples
-

Stuff

```javascript

```

Changelog
-

**Version 0.1.0, July 2013**
* initial version


Contributing
-

After using git to clone the repo, you'll need nodejs, npm, and grunt-cli installed. See [gruntjs.com](http://gruntjs.com/getting-started) for more information. Then inside the cloned directory run `npm install` and then `grunt`

Make updates only to the files in the `./src` directory. Then run `grunt` to automatically generate documentation and other files. You may also make changes to the demos by editing `./demos/*` files or improve the build process by editing `./Gruntfile.js`. Then make a pull request.


Reporting Bugs
-

To report bugs, add an issue to the [GitHub issue tracker](https://github.com/kensnyder/jQuery-TableSorter/issues).


License
-

Copyright 2012-2013, Ken Snyder

[MIT License](http://www.opensource.org/licenses/mit-license.php)
