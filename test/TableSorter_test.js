/*
  ======== A Handy Little QUnit Reference ========
  http://api.qunitjs.com/

  Test methods:
    module(name, {[setup][ ,teardown]})
    test(name, callback)
    expect(numberOfAssertions)
    stop(increment)
    start(decrement)
  Test assertions:
    ok(value, [message])
    equal(actual, expected, [message])
    notEqual(actual, expected, [message])
    deepEqual(actual, expected, [message])
    notDeepEqual(actual, expected, [message])
    strictEqual(actual, expected, [message])
    notStrictEqual(actual, expected, [message])
    throws(block, [expected], [message])
*/
(function($) { "use strict";

function makeTable(lines, containerTagName, rowTagName, colTagName) {
	var i, ilen, j, jlen, tag, tr, cell, cells, classes, container;
	container = document.createElement(containerTagName || 'table');
	if (typeof lines == 'string') {
		lines.split('\n');
	}
	for (i = 0, ilen = lines.length; i < ilen; i++) {
		// add tr
		tr = document.createElement(rowTagName || 'tr');
		container.appendChild(tr);
		// add cells
		tag = colTagName || (i === 0 ? 'th' : 'td');
		cells = lines[i].split('|');
		for (j = 0, jlen = cells.length; j < jlen; j++) {
			cell = document.createElement(tag);
			tr.appendChild(cell);
			cells[j] = cells[j].replace(/@(\S+)/g, function($0, $1) {
				var parts = $1.split('=');
				var name = parts[0];
				var value = parts[1];
				cell.setAttribute(name, value);
				return '';
			});
			classes = [];
			cells[j] = cells[j].replace(/\.([^\s\.]+)/g, function($0, $1) {
				classes.push($1);
				return '';
			});
			cell.className = classes.join(' ');
			cell.innerHTML = $.trim(cells[j]);
		}
	}
	return $(container);
}
function makeDefaultTable(cols, rows, container, rowTagName, colTagName) {
	var r, c, cells;
	var lines = [];
	var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	cells = [];
	for (c = 0; c < cols; c++) {
		cells.push(alphabet[c]);
	}
	lines.push(cells.join(' | '));
	for (r = 1; r < rows; r++) {
		cells = [];
		for (c = 0; c < cols; c++) {
			cells.push(alphabet[c] + r);
		}
		lines.push(cells.join(' | '));
	}
	return makeTable(lines, container, rowTagName, colTagName);
}
function getContents($table, rowTagName, colTagName) {
	var rows = [];
	$table.find(rowTagName || 'tr').each(function(i, row) {
		var cells = [];
		$(row).find(colTagName || 'td, th').each(function(i, cell) {
			cells.push($(cell).text());
		});
		rows.push(cells);
	});
	return rows;
}
var utcOffsetMs = (function() {
	var match = new Date().toString().match(/GMT([+-])(\d\d)(\d\d)/);
	if (!match) {
		return 0;
	}
	var sign = match[1] == '+' ? 1 : -1;
	var hours = parseInt(match[2], 10);
	var min = parseInt(match[3], 10);
	return ((sign * hours * 60) + min) * 1000;
})();

var $workspace = $('#qunit-fixture');

var config = {
	setup: function() {
		
	},
	teardown: function() {
		//$workspace.empty();
	}
};  
module('Init', config);
test("Constructor", function() {
	var sorter = new $.TableSorter(document.createElement('table'), {foo:1});
	strictEqual(sorter.$table instanceof jQuery, true, 'Table is stored at instance.$table');
	strictEqual(sorter.options.foo, 1, 'option foo is stored');
});	
test("Default Options", function() {
	$.TableSorter.defaultOptions.foo = 1;
	var sorter = new $.TableSorter(document.createElement('table'));
	strictEqual(sorter.options.foo, 1, 'option foo is stored');
	delete $.TableSorter.defaultOptions.foo;
});	
module('Unit test helpers', config);
test("makeTable util function for testing", function() {
	var $table = makeTable([
		'@data-index=1 Field 1 | @data-index=2 Field 2',
		'.cell.one Cell 1 | .cell.two Cell 2'
	]);
	var sorter = new $.TableSorter($table);
	strictEqual($table.find('tr').length, 2, '2 trs');
	strictEqual($table.find('tr:nth-child(1) th').length, 2, '2 ths');
	strictEqual($table.find('tr:nth-child(1) th[data-index]').length, 2, 'attributes');
	strictEqual($table.find('tr:nth-child(1) th[data-index=1]').length, 1, 'attributes');
	strictEqual($table.find('tr:nth-child(1) th[data-index=2]').length, 1, 'attributes');
	strictEqual($table.find('tr:nth-child(1) th:nth-child(1)').text(), 'Field 1', 'html');
	strictEqual($table.find('tr:nth-child(1) th:nth-child(2)').text(), 'Field 2', 'html');
	strictEqual($table.find('tr:nth-child(2) td').length, 2, '2 tds');
	strictEqual($table.find('tr:nth-child(2) td.cell').length, 2, 'classes');
	strictEqual($table.find('tr:nth-child(2) td.one').length, 1, 'classes');
	strictEqual($table.find('tr:nth-child(2) td.two').length, 1, 'classes');
	strictEqual($table.find('tr:nth-child(2) td:nth-child(1)').text(), 'Cell 1', 'html');
	strictEqual($table.find('tr:nth-child(2) td:nth-child(2)').text(), 'Cell 2', 'html');
});	
test("makeDefaultTable util function for testing", function() {
	var $table1 = makeTable([
		'A | B | C',
		'A1 | B1 | C1',
		'A2 | B2 | C2',
		'A3 | B3 | C3'
	]);
	var $table2 = makeDefaultTable(3, 4);
	strictEqual($table1.html(), $table2.html(), '3x4 table');	
});	
module('Headings and rows', config);
test("Handle heading rows", function() {
	var $table = makeDefaultTable(3, 4);
	var sorter = new $.TableSorter($table, {
		headings: 'th',
		rows: 'tr:gt(0)'
	});
	strictEqual(sorter.headings.length, 3, 'Headers properly collected');
	strictEqual(sorter.headings[0].innerHTML, 'A', 'Headers properly collected');
	strictEqual(sorter.headings[1].innerHTML, 'B', 'Headers properly collected');
	strictEqual(sorter.headings[2].innerHTML, 'C', 'Headers properly collected');
	strictEqual(sorter.rows.length, 3, 'Rows properly collected with first row ignored');
});	
test("Handle div-based structures", function() {
	var $table = makeDefaultTable(3, 4, 'div', 'div', 'span');
	var sorter = new $.TableSorter($table, {
		headings: 'div:eq(0) span',
		rows: 'div:gt(0)'
	});
	strictEqual(sorter.headings.length, 3, 'Headers properly collected');
	strictEqual(sorter.headings[0].innerHTML, 'A', 'Headers properly collected');
	strictEqual(sorter.headings[1].innerHTML, 'B', 'Headers properly collected');
	strictEqual(sorter.headings[2].innerHTML, 'C', 'Headers properly collected');
	strictEqual(sorter.rows.length, 3, 'Rows properly collected with first row ignored');
});	
module('Zebra striping', config);
test("2 classes", function() {
	var $table = makeDefaultTable(1, 5)
	var sorter = new $.TableSorter($table, {
		zebra: ['odd','even']
	});
	strictEqual($table.find('tr').eq(1).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(2).hasClass('even'), true, 'even stripes');
	strictEqual($table.find('tr').eq(3).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(4).hasClass('even'), true, 'even stripes');
});	
test("4 classes", function() {
	var $table = makeDefaultTable(1, 9)
	$table.find('tr:nth-child(2)').addClass('stripe2');
	var sorter = new $.TableSorter($table, {
		zebra: ['stripe1','stripe1','stripe2','stripe2']
	});
	strictEqual($table.find('tr').eq(1).hasClass('stripe1'), true, 'odd double stripes');	
	strictEqual($table.find('tr').eq(2).hasClass('stripe1'), true, 'odd double stripes');	
	strictEqual($table.find('tr').eq(3).hasClass('stripe2'), true, 'even double stripes');	
	strictEqual($table.find('tr').eq(4).hasClass('stripe2'), true, 'even double stripes');	
	strictEqual($table.find('tr').eq(5).hasClass('stripe1'), true, 'odd double stripes');	
	strictEqual($table.find('tr').eq(6).hasClass('stripe1'), true, 'odd double stripes');	
	strictEqual($table.find('tr').eq(7).hasClass('stripe2'), true, 'even double stripes');	
	strictEqual($table.find('tr').eq(8).hasClass('stripe2'), true, 'even double stripes');	
});	
test("hidden rows", function() {
	var $table = makeDefaultTable(1, 7)
	$table.find('tr').eq(3).hide();
	$table.find('tr').eq(5).hide();
	var sorter = new $.TableSorter($table, {
		zebra: ['odd','even']
	});
	strictEqual($table.find('tr').eq(1).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(2).hasClass('even'), true, 'even stripes');
	strictEqual($table.find('tr').eq(3).hasClass('odd'), false, 'hidden row');
	strictEqual($table.find('tr').eq(3).hasClass('even'), false, 'hidden row');
	strictEqual($table.find('tr').eq(4).hasClass('odd'), true, 'odd stripes');	
	strictEqual($table.find('tr').eq(5).hasClass('odd'), false, 'hidden row');	
	strictEqual($table.find('tr').eq(5).hasClass('even'), false, 'hidden row');	
	strictEqual($table.find('tr').eq(6).hasClass('even'), true, 'even stripes');
});
module('Datatypes', config);
test("Collecting datatypes", function() {
	var $table = makeDefaultTable(4, 1);
	var sorter = new $.TableSorter($table);
	strictEqual(sorter.getDatatype(sorter.headings[0]), 'string', 'string datatype');
	sorter.headings[1].setAttribute('data-datatype','number');
	strictEqual(sorter.getDatatype(sorter.headings[1]), 'number', 'number datatype');
	sorter.headings[2].setAttribute('data-datatype','date');
	strictEqual(sorter.getDatatype(sorter.headings[2]), 'date', 'date datatype');
	sorter.headings[3].setAttribute('data-datatype','nonsense');
	window['throws'](function() {
		sorter.getDataType(sorter.headings[3]);
	}, Error, 'Unknown datatype throws Error object');
});
test("string", function() {
	var $table = makeDefaultTable(1, 1);
	var sorter = new $.TableSorter($table);
	var processor = sorter.getDatatypeProcessor(sorter.headings[0]);
	strictEqual(processor('foo'), 'foo', 'Returning trimming');
	strictEqual(processor(' foo '), 'foo', 'String trimming');
	strictEqual(processor('\t\n foo '), 'foo', 'String trimming');
});
test("number", function() {
	var $table = makeDefaultTable(1, 1);
	var sorter = new $.TableSorter($table);
	sorter.headings[0].setAttribute('data-datatype','number');
	var processor = sorter.getDatatypeProcessor(sorter.headings[0]);
	strictEqual(processor('1'), 1, 'Single Integer');
	strictEqual(processor('-12'), -12, 'Negative number');
	strictEqual(processor('+12'), 12, 'Plus sign');
	strictEqual(processor('1.2'), 1.2, 'Decimal number');
	strictEqual(processor(' 1.2'), 1.2, 'Decimal number with preceeding spaces');
	strictEqual(processor('1.2 '), 1.2, 'Decimal number with trailing spaces');
	strictEqual(processor('$5.25'), 5.25, 'Money');
	strictEqual(processor('1e3'), 1000, 'Exponent');
	strictEqual(processor('-1E4'), -10000, 'Exponent');
});
test("date", function() {
	var $table = makeDefaultTable(1, 1);
	var sorter = new $.TableSorter($table);
	sorter.headings[0].setAttribute('data-datatype','date');
	var processor = sorter.getDatatypeProcessor(sorter.headings[0]);
	strictEqual(processor('7/28/2013 5:10pm'), 1375053360000 + utcOffsetMs, '7/28/2013 5:10pm');
	strictEqual(processor('2013-07-28 5:10pm'), 1375053360000 + utcOffsetMs, '013-07-28 5:10pm');
	strictEqual(processor('28 Jul 2013 5:10pm'), 1375053360000 + utcOffsetMs, '28 Jul 2013 5:10pm');
	strictEqual(processor('Jul 28, 2013 5:10pm'), 1375053360000 + utcOffsetMs, 'Jul 28, 2013 5:10pm');
	strictEqual(processor('7/28/2013 17:10:00'), 1375053360000 + utcOffsetMs, '7/28/2013 17:10:00');
	strictEqual(processor('2013-07-28 17:10:00'), 1375053360000 + utcOffsetMs, '013-07-28 17:10:00');
	strictEqual(processor('28 Jul 2013 17:10:00'), 1375053360000 + utcOffsetMs, '28 Jul 2013 17:10:00');
	strictEqual(processor('Jul 28, 2013 17:10:00'), 1375053360000 + utcOffsetMs, 'Jul 28, 2013 17:10:00');
});
module("Filters - collectors", config);
test("Collecting Column values", function() {
	var $table = makeTable([
		'A | B',
		'A1 | B1',
		'A2 | B2'
	]);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[0], val:'A1'},
			{tr: sorter.rows[1], val:'A2'}
		],
		'get column values - already sorted'
	);
	deepEqual(
		sorter.getValues( $table.find('th').get(1) ), 
		[
			{tr: sorter.rows[0], val:'B1'},
			{tr: sorter.rows[1], val:'B2'}
		],
		'get column values - already sorted - col 2'
	);
});	
test("Collecting Column values - sorted", function() {
	var $table = makeTable([
		'A | B',
		'A2 | B2',
		'A1 | B1'
	]);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:'A1'},
			{tr: sorter.rows[0], val:'A2'}
		],
		'get column values after sorted'
	);
	deepEqual(
		sorter.getValues( $table.find('th').get(1) ), 
		[
			{tr: sorter.rows[1], val:'B1'},
			{tr: sorter.rows[0], val:'B2'}
		],
		'get column values after sorted - col 2'
	);
});
test("Reference collected column values by column index", function() {
	var $table = makeTable([
		'.sortable Candy | Warehouse | .sortable Quantity',
		'Snickers | B1 | 042',
		'Lemonheads | B2 | 117'
	]);
	var sorter = new $.TableSorter($table, {
		headings: '.sortable'
	});
	deepEqual(
		sorter.getValues(1), 
		[
			{tr: sorter.rows[1], val:'Lemonheads'},
			{tr: sorter.rows[0], val:'Snickers'}
		],
		'get column values by first column'
	);
	deepEqual(
		sorter.getValues(3), 
		[
			{tr: sorter.rows[0], val:'042'},
			{tr: sorter.rows[1], val:'117'}
		],
		'get column values by third column'
	);
});	
test("Collecting Column values with number datatype", function() {
	var $table = makeTable([
		'@data-datatype=number A | @data-datatype=number B',
		'11 | 11',
		'9 | 9'
	]);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:9},
			{tr: sorter.rows[0], val:11}
		],
		'get column values - numbers'
	);
});	
module("Collector functions");
test("attr", function() {
	var $table = makeTable([
		'@data-attr=data-timestamp @data-datatype=number A',
		'7/21/2013',
		'7/20/2013'
	]);
	var today = Date.parse('7/20/2013');
	var tomorrow = Date.parse('7/21/2013');
	$table.find('tr').get(1).setAttribute('data-timestamp', tomorrow);
	$table.find('tr').get(2).setAttribute('data-timestamp', today);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:today},
			{tr: sorter.rows[0], val:tomorrow}
		],
		'get column values via data-timestamp attribute'
	);
});	
test("column", function() {
	var $table = makeTable([
		'@data-column=2 A | B',
		'101 | Ruby',
		'102 | JavaScript'
	]);
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:'JavaScript'},
			{tr: sorter.rows[0], val:'Ruby'}
		],
		'get column values via column index'
	);
});	
test("column on sparse columns", function() {
	var $table = makeTable([
		'.sortable A | .not-sortable B | .sortable C',
		'101 | foo | Ruby',
		'102 | bar | JavaScript'
	]);
	var sorter = new $.TableSorter($table, {
		headings: 'th.sortable'
	});
	deepEqual(
		sorter.getValues( $table.find('th').get(2) ), 
		[
			{tr: sorter.rows[1], val:'JavaScript'},
			{tr: sorter.rows[0], val:'Ruby'}
		],
		'get column values via column index'
	);
});	
test("selector", function() {
	var $table = makeTable([
		'@data-selector=.language A | B',
		'101 | Ruby',
		'102 | JavaScript'
	]);
	$table.find('td:last-child').addClass('language');
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[1], val:'JavaScript'},
			{tr: sorter.rows[0], val:'Ruby'}
		],
		'get column values via selector'
	);
});	
test("callback", function() {
	var $table = makeTable([
		'@data-callback=handleNA A | B',
		'101 | Ruby',
		'102 | JavaScript',
		'103 | N/A',
	]);
	window.handleNA = function(row) {
		var text = $(row.children[1]).text();
		return (text == 'N/A' ? '' : text);
	};
	var sorter = new $.TableSorter($table);
	deepEqual(
		sorter.getValues( $table.find('th').get(0) ), 
		[
			{tr: sorter.rows[2], val:''},
			{tr: sorter.rows[1], val:'JavaScript'},
			{tr: sorter.rows[0], val:'Ruby'}
		],
		'get column values via callback function'
	);
});	
module('Sort', config);
test("Ascending/Descending", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// ASCENDING
	sorter.sort( $table.find('th').get(0) );
	var $sortedCol1 = makeTable([
		'Fruit | Count',
		'Apple | 2',
		'Banana | 1'
	]);
	strictEqual($table.html(), $sortedCol1.html(), 'Sort on column 1');
	sorter.sort( $table.find('th').get(1) );
	var $sortedCol2 = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);	
	strictEqual($table.html(), $sortedCol2.html(), 'Sort on column 2');
	// DESCENDING
	sorter.sort( $table.find('th').get(0), 'DESC' );
	$sortedCol1 = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	strictEqual($table.html(), $sortedCol1.html(), 'Sort on column 1 DESC');
	sorter.sort( $table.find('th').get(1), 'DESC' );
	$sortedCol2 = makeTable([
		'Fruit | Count',
		'Apple | 2',
		'Banana | 1'
	]);	
	strictEqual($table.html(), $sortedCol2.html(), 'Sort on column 2 DESC');
});
test("Zebra after sort", function() {
	var $table = makeTable([
		'Fruit | @data-datatype=number Count',
		'Banana | 1',
		'Apple | 2',
		'Strawberry | 9',
		'Grape | 7',
		'Orange | 12'
	]);
	var sorter = new $.TableSorter($table, {
		zebra: ['odd','even']		
	});
	strictEqual($table.find('tr').eq(1).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(2).hasClass('even'), true, 'even stripes');
	strictEqual($table.find('tr').eq(3).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(4).hasClass('even'), true, 'even stripes');	
	strictEqual($table.find('tr').eq(5).hasClass('odd'), true, 'odd stripes');
	sorter.sort(2);
	strictEqual($table.find('tr').eq(1).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(2).hasClass('even'), true, 'even stripes');
	strictEqual($table.find('tr').eq(3).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(4).hasClass('even'), true, 'even stripes');	
	strictEqual($table.find('tr').eq(5).hasClass('odd'), true, 'odd stripes');	
});
module('Filters', config);
test("Filter with callback", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	sorter.filter(function(i, row) {
		return $(row).find('td:eq(0)').text().match(/b/i);
	});
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
});
test("Zebra after filter", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Strawberry | 9',
		'Grape | 7',
		'Orange | 12'
	]);
	var sorter = new $.TableSorter($table, {
		zebra: ['odd','even']
	});
	strictEqual($table.find('tr').eq(1).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(2).hasClass('even'), true, 'even stripes');
	strictEqual($table.find('tr').eq(3).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(4).hasClass('even'), true, 'even stripes');	
	strictEqual($table.find('tr').eq(5).hasClass('odd'), true, 'odd stripes');
	sorter.filter(function(i, row) {
		return $(row).find('td:eq(0)').text().match(/e/i);
	});
	strictEqual($table.find('tr').eq(2).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(3).hasClass('even'), true, 'even stripes');
	strictEqual($table.find('tr').eq(4).hasClass('odd'), true, 'odd stripes');
	strictEqual($table.find('tr').eq(5).hasClass('even'), true, 'even stripes');
});
module('Filter collectors', config);
test("Definition", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		collector: function(i, row) {
			return (i+1) + '. ' + $(row.children[0]).text();
		}
	});
	strictEqual(typeof sorter.filters.fruit, 'object', 'Filter created ok.');
	deepEqual(sorter.filters.fruit.values, ['1. Banana','2. Apple'], 'Collecting string values');
	// filter on Count
	sorter.defineFilter('count', {
		collector: function(i, row) {
			return parseFloat($(row.children[1]).text());
		}
	});
	deepEqual(sorter.filters.count.values, [1,2], 'Collecting numeric values');
});
test("column", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		collector: ['column',1]
	});
	deepEqual(sorter.filters.fruit.values, ['Banana','Apple'], 'Collecting strings from a column');
	// filter on Count
	sorter.defineFilter('count', {
		collector: ['column',2]
	});
	deepEqual(sorter.filters.count.values, ['1','2'], 'Collecting numbers from a column');
});
test("column by column key", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 1
	});
	deepEqual(sorter.filters.fruit.values, ['Banana','Apple'], 'Collecting strings from a column');
	// filter on Count
	sorter.defineFilter('count', {
		column: 2
	});
	deepEqual(sorter.filters.count.values, ['1','2'], 'Collecting numbers from a column');
});
test("columns", function() {
	var $table = makeTable([
		'First Name | Last Name',
		'John | Smith',
		'Jennifer | Williams'
	]);	
	var sorter = new $.TableSorter($table);
	sorter.defineFilter('name', {
		collector: ['columns', '2,1', ', ']
	});
	deepEqual(sorter.filters.name.values, ['Smith, John','Williams, Jennifer'], 'Collecting multiple columns');
});
test("cellAttr", function() {
	var $table = makeTable([
		'Event | Date',
		'Red | .date @data-timestamp=1374968571 7/27/2013 5:42pm',
		'Green | .date @data-timestamp=1374968615 7/27/2013 5:43pm',
		'Refactor | .date @data-timestamp=1374968733 - 7/27/2013 5:45pm'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('gt', {
		collector: ['cellAttr','.date','data-timestamp'],
		rule: 'gt'
	});
	deepEqual(sorter.filters.gt.values, ['1374968571','1374968615','1374968733'], 'proper collection with cellAttr');
	sorter.filter('gt', 1374968730);
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(3).style.display, '', 'unfiltered row should be displayed');
});
module('Filter Rules', config);
test("contains", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 1,
		rule: $.TableSorter.rules.contains
	});
	sorter.filter('fruit', 'b');
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	sorter.filter('fruit', 'apple');
	strictEqual($table.find('tr').get(1).style.display, 'none', 'after refilter: unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, '', 'after refilter: filtered row should be hidden');
	sorter.filter('fruit', 'strawberry');
	strictEqual($table.find('tr').get(1).style.display, 'none', 'after refilter: no matches');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'after refilter: no matches');
});
test("invalid", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	window['throws'](function() {		
		sorter.defineFilter('fruit', {
			collector: function(i, row) {
				return $(row.children[0]).text();
			},
			rule: 'invalid'
		});
	}, TypeError);
});
test("same", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 1,
		rule: 'same'
	});
	sorter.filter('fruit', 'banana');
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
});
test("exact", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 1,
		rule: 'exact'
	});
	sorter.filter('fruit', 'banana');
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	sorter.filter('fruit', 'Banana');
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
});
test("containsCaseSensitive", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 1,
		rule: 'containsCaseSensitive'
	});
	sorter.filter('fruit', 'b');
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	sorter.filter('fruit', 'Apple');
	strictEqual($table.find('tr').get(1).style.display, 'none', 'after refilter: unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, '', 'after refilter: filtered row should be hidden');
	sorter.filter('fruit', 'strawberry');
	strictEqual($table.find('tr').get(1).style.display, 'none', 'after refilter: no matches');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'after refilter: no matches');
});
test("startsWith", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 1,
		rule: 'startsWith'
	});
	sorter.filter('fruit', 'b');
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	sorter.filter('fruit', 'n');
	strictEqual($table.find('tr').get(1).style.display, 'none', 'after refilter: no matches');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'after refilter: no matches');
});
test("matchAt", function() {
	var $table = makeTable([
		'TODOs | Done?',
		'1. Write failing tests | Yes',
		'2. write code to pass tests | No',
		'3. Refactor code | No',
		'4. ??? | No',
		'5. Profit | No'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('todo', {
		column: 1,
		rule: 'matchAt'
	});
	sorter.filter('todo', 'write', 3);
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(3).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(4).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(5).style.display, 'none', 'filtered row should be hidden');
	sorter.defineFilter('todo2', {
		column: 1,
		rule: 'matchAtCaseSensitive'
	});
	sorter.filter('todo2', 'write', 3);
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(3).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(4).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(5).style.display, 'none', 'filtered row should be hidden');
});
test("regExp", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Pineapple | 5'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit2', {
		column: 1,
		rule: 'regExp'
	});
	sorter.filter('fruit2', /\bapple/i);
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(3).style.display, 'none', 'filtered row should be hidden');
});
test("gt", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Pineapple | 5'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('moreThan', {
		column: 2,
		rule: 'gt'
	});
	sorter.filter('moreThan', 4);
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(3).style.display, '', 'unfiltered row should be displayed');
});
test("gte", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Pineapple | 5'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('atLeast', {
		column: 2,
		rule: 'gte'
	});
	sorter.filter('atLeast', 5);
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(3).style.display, '', 'unfiltered row should be displayed');
});
test("lte", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Pineapple | 5'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('atMost', {
		column: 2,
		rule: 'lte'
	});
	sorter.filter('atMost', 2);
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(3).style.display, 'none', 'filtered row should be hidden');
});
test("ne", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Pineapple | 5'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('not', {
		column: 2,
		rule: 'ne'
	});
	sorter.filter('not', 2);
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(3).style.display, '', 'unfiltered row should be displayed');
});
test("between", function() {
	var $table = makeTable([
		'Name | Calories',
		'Jane | 800',
		'John | 2200',
		'Jim | 3500'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('healthy', {
		column: 2,
		rule: 'between'
	});
	sorter.filter('healthy', 1800, 2400);
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(3).style.display, 'none', 'filtered row should be hidden');
});
test("outside", function() {
	var $table = makeTable([
		'Name | Calories',
		'Jane | 800',
		'John | 2200',
		'Jim | 3500'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('unhealthy', {
		column: 2,
		rule: 'outside'
	});
	sorter.filter('unhealthy', 1800, 2400);
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(3).style.display, '', 'unfiltered row should be displayed');
});
test("isEmpty", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Lettuce | '
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('no-counts', {
		column: 2,
		rule: 'isEmpty'
	});
	sorter.filter('no-counts');
	strictEqual($table.find('tr').get(1).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(3).style.display, '', 'unfiltered row should be displayed');
});
test("isNotEmpty", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Lettuce | '
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('has-count', {
		column: 2,
		rule: 'isNotEmpty'
	});
	sorter.filter('has-count');
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(3).style.display, 'none', 'filtered row should be hidden');
});
test("lt", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2',
		'Pineapple | 5'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('lessThan', {
		column: 2,
		rule: 'lt'
	});
	sorter.filter('lessThan', 4);
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(3).style.display, 'none', 'filtered row should be hidden');
});
test("eq", function() {
	var $table = makeTable([
		'Fruit | Price',
		'Banana | 1.00',
		'Apple | 1',
		'Pineapple | 2.50'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('NumericallySame', {
		column: 2,
		rule: 'eq'
	});
	sorter.filter('NumericallySame', 1);
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(3).style.display, 'none', 'filtered row should be hidden');
});
module("Dynamic filter rules");
test("dynamicRule", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Apple | 2',
		'Banana | 1',
		'Strawberry | 3'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('min_count', {
		dynamicRule: function(i, row, sign, value) {
			var count = parseFloat($(row.children[1]).text());
			if (sign == '>') {
				return count > value;
			}
			else if (sign == '=') {
				return count === value;
			}
			else {
				return count < value;
			}
		}
	});
	sorter.filter('min_count', '>', 1);
	strictEqual($table.find('tr').get(1).style.display, '', 'unfiltered row should be displayed');
	strictEqual($table.find('tr').get(2).style.display, 'none', 'filtered row should be hidden');
	strictEqual($table.find('tr').get(3).style.display, '', 'unfiltered row should be displayed');
});
module("Reindexing")
test("Reindex then sort", function() {
	var $table = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Apple | 2'
	]);
	var sorter = new $.TableSorter($table);
	$table.append('<tr><td>Strawberry</td><td>10</td></tr>');
	sorter.sort( $table.find('th').get(0) );
	// since banana and apply were appended and strawberry was ignored, the rows should be
	// Strawberry, Banana, Apple
	var $sorted1 = makeTable([
		'Fruit | Count',
		'Strawberry | 10',
		'Apple | 2',
		'Banana | 1'
	]);
	deepEqual(getContents($table), getContents($sorted1), 'New rows should be ignored until reindexing');
	sorter.reindex();
	strictEqual(sorter.rows.length, 3, 'New row should be in sorter.rows');
	// Now that we have re-indexed, our sort should work as expected
	sorter.sort( $table.find('th').get(0) );
	var $sorted2 = makeTable([
		'Fruit | Count',
		'Apple | 2',
		'Banana | 1',
		'Strawberry | 10'
	]);
	deepEqual(getContents($table), getContents($sorted2), 'New rows are added after reindexing');	
	// change a single value
	$table.find('tr').eq(1).find('td').eq(0).text('Grape');
	sorter.sort( $table.find('th').get(0) );
	strictEqual($table.find('tr').eq(1).find('td').eq(0).text(), 'Grape', 'Cell changes are ignored until reindexing');
	sorter.reindex();
	sorter.sort( $table.find('th').get(0) );
	// now we should see the table update
	var $sorted3 = makeTable([
		'Fruit | Count',
		'Banana | 1',
		'Grape | 2',
		'Strawberry | 10'
	]);	
	deepEqual(getContents($table), getContents($sorted3), 'Cell changes found after reindexing');	
});
module('Filter datatypes', config);
test("string", function() {
	var $table = makeTable([
		'Fruit | Count',
		' | 1',
		' | 2'
	]);
	var sorter = new $.TableSorter($table);
	$table.find('tr').eq(1).find('td').eq(0).text('\tBanana ');
	$table.find('tr').eq(2).find('td').eq(0).text('\r\nApple ');
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 1,
		datatype: 'string'
	});
	deepEqual(sorter.filters.fruit.values, ['Banana','Apple'], 'Collecting values with datatype string');
});
test("number", function() {
	var $table = makeTable([
		'Fruit | Price',
		'Banana | $1.00',
		'Apple | $2.00'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 2,
		datatype: 'number'
	});
	strictEqual(sorter.filters.fruit.values[0], 1, 'Dollars 1');
	strictEqual(sorter.filters.fruit.values[1], 2, 'Dollars 2');
});
test("date", function() {
	var $table = makeTable([
		'Fruit | Next Delivery',
		'Banana | 7/28/2013 5:10pm',
		'Apple | 28 Jul 2013 at 5:10pm'
	]);
	var sorter = new $.TableSorter($table);
	// filter on fruit column
	sorter.defineFilter('fruit', {
		column: 2,
		datatype: 'date'
	});
	strictEqual(sorter.filters.fruit.values[0], 1375053360000 + utcOffsetMs, '7/28/2013 5:10pm');
	strictEqual(sorter.filters.fruit.values[1], 1375053360000 + utcOffsetMs, '28 Jul 2013 at 5:10pm');
});
module('Sort binding', config);
test("Header", function() {
	var $table = makeTable([
		'.fruit Fruit | .count @data-datatype=number Count',
		'Grape | 100',
		'Strawberry | 9',
		'Banana | 13'
	]);
	//$table.appendTo($workspace);
	var sorter = new $.TableSorter($table, {
		sortOnClick: true
	});
	$table.find('th').eq(0).triggerHandler('click');
	var $sorted1Asc = makeTable([
		'Fruit | @data-datatype=number Count',
		'Banana | 13',
		'Grape | 100',
		'Strawberry | 9'
	]);
	deepEqual(getContents($table), getContents($sorted1Asc), 'columns are sorted on click');
	strictEqual($table.find('th').eq(0).hasClass('ts-sorted-asc'), true, 'sorted heading has proper css class');
	// click again to sort descending
	$table.find('th').eq(0).triggerHandler('click');
	var $sorted1Desc = makeTable([
		'Fruit | @data-datatype=number Count',
		'Strawberry | 9',
		'Grape | 100',
		'Banana | 13'
	]);	
	deepEqual(getContents($table), getContents($sorted1Desc), 'columns are sorted desc on second click');
	strictEqual($table.find('th').eq(0).hasClass('ts-sorted-asc'), false, 'desc sorted heading removes asc css class');
	strictEqual($table.find('th').eq(0).hasClass('ts-sorted-desc'), true, 'desc sorted heading has proper css class');
	// click on another heading
	$table.find('th').eq(1).triggerHandler('click');
	strictEqual($table.find('th').eq(0).hasClass('ts-sorted-desc'), false, 'old column sort class removed');
});

}(jQuery));